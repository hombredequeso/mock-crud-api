const express = require("express");
const { LRUCache } = require('lru-cache');
const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

const options = {
  max: 500,
};

const initializeCache = (cacheData, cache) => {
  let itemsAddedToCache =0;
  Object.entries(cacheData).forEach(([key, value]) => {
    cache.set(key, value);
    ++itemsAddedToCache;
  });
  console.log(`Startup: items added to cache: ${itemsAddedToCache}`);
  return itemsAddedToCache;
}

const cache = new LRUCache(options)

const dataFilename = process.argv[2]
if (dataFilename) {
  const data = require(dataFilename)
  const addedToCacheCount = initializeCache(data, cache);
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});


const getKeyFromRequest = (req) => getKey(req.params.entity, req.params.id);
const getKey = (entity, id) => `${entity}/${id}`;

app.put("/:entity/:id", (req, res) => {
  const key = getKeyFromRequest(req);
  console.log(`PUT ${key}`)
  const resourceValue = req.body;
  cache.set(key, resourceValue);
  res.status(200).json({params: req.params, body: req.body});
})

app.delete('/:entity/:id', (req, res) => {
  const key = getKeyFromRequest(req);
  console.log(`DELETE ${key}`)
  const deleteResult = cache.delete(key);
  const responseStatus = deleteResult? 202: 404;
  res.status(responseStatus).end();
})

const getFromCacheIncludingWildcardId = (cacheL, entity, id) => {
  const exactResult = cacheL.get(getKey(entity, id));
  if (exactResult !== undefined){
    return exactResult;
  }

  const wildCardKey = getKey(entity, "*");
  const wildCardResult = cacheL.get(wildCardKey);

  if (wildCardResult && wildCardResult?.id && wildCardResult.id !== id) {
    let clonedResult = {...wildCardResult, id: id};
    return clonedResult;
  }

  if (wildCardResult) {
    return wildCardResult;
  }

  return undefined;
}

app.get("/:entity/:id", (req, res) => {
  console.log(`GET ${req.params.entity}/${req.params.id}`);
  const resourceValue = getFromCacheIncludingWildcardId(cache, req.params.entity, req.params.id)

  if (resourceValue) {
    res.status(200).json(resourceValue);
  } else {
    res.status(404).end();
  }
})

// GET entity?ids=1,2,3
// If tere is no resource for a particular id, then 'null' will be returned for that id.
// (cache.get return 'undefined', JSON turns that array element into 'null')
// Consequently: this will never return 404, but at worst, an array with only 'null' values
app.get("/:entity", (req, res) => {
  console.log(`GET ${req.params.entity}?ids=${req.query.ids}`)
  if (!req?.query?.ids) {
    res.status(404).end();
  }
  const keys = {entity: req.params.entity, ids: req.query.ids.split(',')};
  const entity = keys.entity;
  const entityArray = keys.ids.map(entityId => {
    const entityValue = getFromCacheIncludingWildcardId(cache, entity, entityId);
    return entityValue;
  });


  const response = {
    jobs: entityArray
  }

  res.status(200).json(response);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

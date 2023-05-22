A basic mock REST api 

# Usage
```
yarn
yarn start datafile.json
```

# Description

This project starts a simple CRUD api that stores its data in memory. All resources should be of the form 'entity/id'. PUT/DELETE/GET operations all work on individual resources. If using the wildcard id '*', it applies to all resources of that type, although if a paricular resource is specified that will be preferrentially used.

# Data File Format
See sample-data for examples.
books.json: specify individual resources
books-all.json: specify one common resource using '*' (will be the resource for all id's).

# Example Usage
```
> yarn start ./sample-data/books.json
...
> curl localhost:3000/book/123
{"id":"123","title":"Picture of Dorian Grey","author":"Oscar Wilde"}%

> curl localhost:3000/book/999
> curl -X PUT localhost:3000/book/999 -d '{"id":"999","title":"Hacking Away","author":"Hombre de Queso"}' -H 'Content-Type: application/json'
{"params":{"entity":"book","id":"999"},"body":{"id":"999","title":"Hacking Away","author":"Hombre de Queso"}}% 
> curl localhost:3000/book/999 
{"id":"999","title":"Hacking Away","author":"Hombre de Queso"}%

> curl -X DELETE localhost:3000/book/999
> curl localhost:3000/book/999          
 
 ```

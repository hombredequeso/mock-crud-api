FROM node:20-alpine3.19

WORKDIR /app

COPY package.json ./

RUN yarn install

COPY . .

EXPOSE 3000 3000

ENTRYPOINT ["yarn", "start"]


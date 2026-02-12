FROM node:lts-alpine3.21

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .

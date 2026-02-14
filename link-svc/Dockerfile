FROM node:lts-alpine3.21 AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:lts-alpine3.21

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/proto ./proto

EXPOSE 4000
EXPOSE 50001

CMD ["node", "dist/main.js"]

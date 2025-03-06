FROM node:22-alpine

WORKDIR /usr/src/ws

RUN apk add --no-cache python3 make g++ openssl \
    && npm install -g typescript

COPY ./packages ./packages
COPY ./packages/db/.env ./packages/db/.env
COPY ./yarn.lock ./yarn.lock

COPY ./package.json ./package.json
COPY ./turbo.json ./turbo.json

COPY ./apps/ws ./apps/ws

RUN yarn install
RUN yarn run db:generate
RUN yarn run build

EXPOSE 4000

WORKDIR /usr/src/ws/apps/ws

CMD ["yarn", "run", "start"]

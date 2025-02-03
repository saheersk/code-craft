FROM node:18-alpine

WORKDIR /usr/src/ws

RUN apk add --no-cache python3 make g++ openssl \
    && npm install -g typescript

COPY package*.json ./

RUN yarn install

COPY . ./

RUN yarn build --verbose

EXPOSE 3002

CMD ["yarn", "start"]

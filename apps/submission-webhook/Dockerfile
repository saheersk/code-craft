FROM node:18-alpine

WORKDIR /usr/src/submission-webhook

RUN apk add --no-cache python3 make g++ openssl \
    && npm install -g typescript

COPY package*.json ./

RUN yarn install

COPY . ./

RUN yarn build --verbose

EXPOSE 3000

CMD ["yarn", "start"]

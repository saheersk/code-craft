FROM node:16-alpine

WORKDIR /submission-webhook

COPY package.json package-lock.json ./

RUN yarn add --frozen-lockfile

COPY . .


EXPOSE 3002

CMD ["yarn", "dev"]

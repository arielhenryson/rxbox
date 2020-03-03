FROM node:alpine

USER root

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

RUN npm i -g typescript ts-node

RUN mkdir -p /app
WORKDIR /app

COPY . /app



RUN npm install


CMD [ "npm", "run", "test" ]

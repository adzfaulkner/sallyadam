FROM node:17-alpine as js

RUN apk add g++ make py3-pip util-linux

WORKDIR /app

COPY app/package.* ./

RUN npm install --quiet --unsafe-perm=true --allow-root \
    && mkdir -p node_modules/.cache \
    && chmod -R 777 node_modules/.cache
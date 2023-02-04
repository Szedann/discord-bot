FROM node:18-alpine as base

WORKDIR /home/node/app

RUN apk add  --no-cache ffmpeg

COPY package*.json ./

RUN npm i

COPY . .

FROM base as production

ENV NODE_PATH=./build

RUN npx prisma generate

RUN npm run build

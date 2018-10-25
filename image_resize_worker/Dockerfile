FROM node:7.7.2-alpine
RUN apk --update add imagemagick
WORKDIR /usr/app

COPY package.json .
RUN npm install --quiet

COPY . .

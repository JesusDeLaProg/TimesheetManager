FROM node:lts-slim

WORKDIR /usr/src/server

# package.json + package-lock.json
COPY package*.json ./

RUN npm ci

COPY . ./

RUN npm run build

CMD ["npm", "start"]
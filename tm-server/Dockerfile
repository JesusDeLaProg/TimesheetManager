FROM node:lts-slim

WORKDIR /usr/src/server

# package.json + package-lock.json
COPY package*.json ./

RUN npm ci

COPY . ./

RUN npm run build

EXPOSE 8080
EXPOSE 9229

CMD ["node", "--inspect=0.0.0.0:9229", "/usr/src/server/dist/main.js"]
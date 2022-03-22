FROM node:latest

WORKDIR /bot

COPY package.json .
RUN npm install

COPY . /bot

CMD ["node", "index.js"]
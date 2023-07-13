FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV sentry_api_port $sentry_api_port
EXPOSE $sentry_api_port

CMD ["npm", "start"]

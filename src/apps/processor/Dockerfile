FROM node:24

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE ${PROCESSOR_PORT}

CMD ["npm", "run", "start:processor:prod"]

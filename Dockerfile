FROM node:16.13

RUN mkdir -p /var/www/api

WORKDIR /var/www/api

COPY . .

RUN npm install

# RUN npm run build

EXPOSE 8001

# CMD [ "node", "dist/main.js" ]
CMD [ "npm", "run", "start:dev" ]
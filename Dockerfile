FROM node:21.6.2-alpine3.18

RUN mkdir -p /home/app

WORKDIR /home/app

COPY . /home/app

RUN npm install

EXPOSE 4007

CMD ["npm", "start"]
FROM mhart/alpine-node:12

RUN apk add g++ make python
# создание директории приложения
WORKDIR /usr/src/app

# установка зависимостей
# символ астериск ("*") используется для того чтобы по возможности 
# скопировать оба файла: package.json и package-lock.json
COPY package*.json ./

RUN npm install
# Если вы создаете сборку для продакшн
# RUN npm ci --only=production

# копируем исходный код
COPY . .

RUN npm run build:client
RUN npm run build:server

EXPOSE 8080
CMD [ "node", "build/server.js" ]
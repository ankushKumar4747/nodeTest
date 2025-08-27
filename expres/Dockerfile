FROM node:20
WORKDIR /app
COPY ./package.json ./
CMD [ "ls"]
RUN npm install
COPY . .
EXPOSE 4000
CMD [ "node","index.js" ]




FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3004

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3004"] 
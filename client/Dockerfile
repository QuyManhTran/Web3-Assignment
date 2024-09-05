FROM node:20-alpine3.19 as development

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN  npm run build

FROM nginx:1.27.0-alpine-slim as production

COPY --from=development /app/build /usr/share/nginx/html/web3

COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
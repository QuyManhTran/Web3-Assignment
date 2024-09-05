#start
FROM node:20.15.1-alpine as builder

FROM builder as development

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN node ace build --ignore-ts-errors

# Change working directory to /app/build
WORKDIR /app/build

# Run npm install in /app/build directory
RUN npm ci --omit="dev"

FROM builder as production

WORKDIR /app

COPY --from=development /app/build /app


CMD [ "node", "bin/server.js" ]

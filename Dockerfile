FROM node:14-alpine
WORKDIR ./app

COPY . .

RUN ["npm", "ci"]

EXPOSE 8080

ENTRYPOINT [ "npm", "start" ]
require('dotenv').config();

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const graphQl = require('express-graphql');
const app = express();

const logger = require('./src/util/logger');
const connectDb = require('./src/util/connectDb');

// GraphQL Implementation
const gqlSchema = require('./src/graphql/schema');
const gqlResolver = require('./src/graphql/resolvers');

// General Middleware
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ALLOWED_ORIGINS);
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  next();
});

// GraphQL Endpoint
app.use(
  '/graphql',
  graphQl({
    schema: gqlSchema,
    rootValue: gqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      } else {
        const data = err.originalError.data;
        const code = err.originalError.code || 500;
        const message = err.message;
        return { message, code, data };
      }
    }
  })
);

// Error Handling
app.use((err, req, res, next) => {
  logger.error(err);
  const status = err.statusCode || 500;
  const { message, data } = err;
  res.status(status).json({ message, data });
});

process.on('uncaughtException', err => {
  logger.fatal(err);
});

process.on('unhandledRejection', reason => {
  throw reason;
});

// Server Setup
const PORT = process.env.PORT || 8080;

mongoose.connection.once('open', () => {
  app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });
});

connectDb(10000).catch(err => {
  logger.fatal(err);
  process.exitCode = 1;
});

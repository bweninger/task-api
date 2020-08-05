const pino = require('pino');

let logger;
if (process.env.NODE_ENV === 'development') {
  logger = pino({
    prettyPrint: true
  });
} else {
  logger = pino();
}

module.exports = logger;

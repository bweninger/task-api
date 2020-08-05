const mongoose = require('mongoose');

let timeOfLastTry = 0;
const RETRY_INTERVAL = 1000;

const connectDb = async tryForMs => {
  if (tryForMs && typeof tryForMs === 'number') {
    timeOfLastTry = Date.now() + tryForMs;
  } else if (!timeOfLastTry) {
    timeOfLastTry = Date.now() + 5000;
  }

  mongoose
    .connect(process.env.DB_MONGO_CONNECTION, {
      useNewUrlParser: true,
      dbName: process.env.DB_MONGO_DATABASE
    })
    .catch(err => {
      if (Date.now() < timeOfLastTry) {
        setTimeout(connectDb, RETRY_INTERVAL);
      } else {
        process.exitCode = 1;
        throw err;
      }
    });
};

module.exports = connectDb;

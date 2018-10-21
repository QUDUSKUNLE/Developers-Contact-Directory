/* eslint-disable no-console */
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import expressValidator from 'express-validator';
import errorHandler from 'errorhandler';
import mongoose from 'mongoose';

import routes from './routes/index';


dotenv.config();

// Configure production variable
const prod = process.env.PRODUCTION;
const port = process.env.PORT;

// initialize application
const app = express();

// configure application
app.use(cors());
app.use(require('morgan')('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

if (!prod) {
  app.use(errorHandler());
}

mongoose.promise = global.Promise;
// configure mongoose database
if (process.env.NODE_ENV === 'test') {
  mongoose.connect(process.env.MONGODB_URL_TEST, {
    useMongoClient: true,
    autoReconnect: true
  });
} else {
  mongoose.connect(process.env.MONGODB_URL, {
    useMongoClient: true,
    autoReconnect: true
  });
}

app.use('/api/v1', routes);
app.get('/', (req, res) => res.json('Welcome to DevelopersContact Home'));

app.listen(port);

module.exports = app;

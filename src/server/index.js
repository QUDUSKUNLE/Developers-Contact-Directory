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

// configure mongoose global
mongoose.promise = global.Promise;

// Configure production variable
const prod = process.env.PRODUCTION;
const port = process.env.PORT;

// initialize application
const app = express();

// configure application
app.use(cors());
app.use(require('morgan')('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressValidator());

if (!prod) {
  app.use(errorHandler());
}

// configure mongoose database
mongoose.connect(process.env.DATABASE_HOST, {
  useCreateIndex: true,
  useNewUrlParser: true,
});

app.use('/api/v1', routes);
app.get('/', (req, res) => {
  res.send('Simple CRUD for developers contact');
});

app.listen(port, () => console.log(`Server running on PORT ${port}`));

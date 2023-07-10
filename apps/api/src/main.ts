/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import express from 'express';
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
import * as path from 'path';
const pool = require('./db');
var logger = require('morgan');
import { EnvironmentInfo } from '../../../libs/common/src/models/common';
const usersRouter = require('./routes/users');

const jwt = require('jsonwebtoken');
const randtoken = require('rand-token');
const passport = require('passport');
const app = express();
//app.use(express.json({ limit: '80mb', extended: true }));
app.use(express.urlencoded({ limit: '80mb', extended: true }));
// app.use(passport.initialize());
// app.use(passport.session());

const cors = require('cors');
var corsOptions = {
  origin: '*',
  // optionsSuccessStatus: 200,
  // methods: 'PUT, GET, POST, DELETE, OPTIONS',
  // Headers: 'Origin, X- Requested - With, Content-Type, Accept',
  // origin: 'http://localhost:4200', // Replace with the actual origin of your frontend application
  methods: ['GET', 'POST'], // Specify the allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(cookieParser());
// Parse JSON request bodies
app.use(bodyParser.json());

// Parse URL-encoded request bodies
app.use(bodyParser.urlencoded({ extended: true }));
import connectToDatabase from './db';

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use('/users', usersRouter);

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to api!' });
});

let env: EnvironmentInfo = new EnvironmentInfo();
const port = env.apiPort();
const url = env.apiUrl();
const server = app.listen(port, () => {
  console.log(`Listening at ${url}:${port}`);
  // Check database connection
  connectToDatabase()
    .then(() => {
      console.log('Database connection Ok');
    })
    .catch((error) => {
      console.error('Error connecting to the database:', error);
    });
});
server.on('error', console.error);

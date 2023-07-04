/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
const pool = require('./db');
import { EnvironmentInfo } from '../../../libs/common/src/lib/common';
const usersRouter = require('./routes/users');
const app = express();
 
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
  console.log(`Listening at ${url}:${port}/users`);
   // Check database connection
   connectToDatabase()
   .then(() => {
     console.log('Databse connection Ok');
   })
   .catch((error) => {
     console.error('Error connecting to the database:', error);
   });
});
server.on('error', console.error);

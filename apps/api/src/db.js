const mysql = require('mysql2/promise');
import { EnvironmentInfo } from '../../../libs/common/src/models/common';

async function connectToDatabase() {
  try {
    let env = new EnvironmentInfo();
    const connection = await mysql.createConnection({
      host: env.dbUrl(),
      port: env.dbPort(),
      user: env.dbUser(),
      password: env.dbPassword(),
      database: env.dbName(),
    });
    //console.log('Connected to the database');
    return connection;
  } catch (error) {
    // console.error('Error connecting to the database:', error);
    throw error; // Throw the error to be handled by the calling code
  }
}

module.exports = connectToDatabase;

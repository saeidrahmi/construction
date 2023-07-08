const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');

const CryptoJS = require('crypto-js');
import { EnvironmentInfo } from '../../../../libs/common/src/models/common';
//import { UserResponseInterface } from '../../../../libs/common/src/models/user-response';
function decryptCredentials(encryptedCredentials) {
  let env = new EnvironmentInfo();
  const secretKey = env.secretKey();
  // Decode the Base64 encoded encrypted credentials
  const encodedCredentials = Buffer.from(
    encryptedCredentials,
    'base64'
  ).toString('ascii');

  // Split the encoded credentials into username and password using the delimiter
  const [encryptedUsername, encryptedPassword] = encodedCredentials.split(':');

  // Decrypt the username and password using AES decryption with the secret key
  const decryptedUsername = CryptoJS.AES.decrypt(
    encryptedUsername,
    secretKey
  ).toString(CryptoJS.enc.Utf8);
  const decryptedPassword = CryptoJS.AES.decrypt(
    encryptedPassword,
    secretKey
  ).toString(CryptoJS.enc.Utf8);

  return { userId: decryptedUsername, password: decryptedPassword };
}

router.get('/', async (req, res) => {
  try {
    const connection = await connectToDatabase();

    // Execute a query
    const [rows] = await connection.execute('SELECT * FROM users');
    console.log('Query results:', rows);

    // Close the connection
    await connection.end();

    res.json(rows);
  } catch (error) {
    console.error('Error performing the query:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.post('/login', async (req, res) => {
  try {
    const connection = await connectToDatabase();

    const { credentials } = req.body;

    // decrypt credentials
    const { userId, password } = decryptCredentials(credentials);

    // Execute a query
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE userId = ? AND password = ?',
      [userId, password]
    );
    // Close the connection
    await connection.end();
    if (rows.length === 0) {
      // User not found or incorrect credentials
      return res.status(401).json({ error: 'Invalid userId or password' });
    } else {
      let user = {
        userId: rows[0].userId,
        jwtToken: rows[0].jwtToken,
        role: rows[0].role,
        firstName: rows[0].firstName,
        lastName: rows[0].lastName,
        registerdDate: rows[0].registerdDate,
      };
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.post('/logout', async (req, res) => {
  res.status(200).json();
});

module.exports = router;

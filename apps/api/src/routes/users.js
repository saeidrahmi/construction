const express = require('express');
const router = express.Router();
const connectToDatabase = require('../db');

const CryptoJS = require('crypto-js');
import { EnvironmentInfo } from '../../../../libs/common/src/models/common';
const passport = require('passport');

const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const env = new EnvironmentInfo();
const secretKey = env.secretKey();
const passportOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.secretKey(),
};

passport.use(
  new JwtStrategy(passportOpts, function (jwtPayload, done) {
    const expirationDate = new Date(jwtPayload.exp * 1000);
    if (expirationDate < new Date()) {
      return done(null, false);
    }
    done(null, jwtPayload);
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.username);
});

function verifyToken(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }
  let token = req.headers.authorization.split(' ')[1];
  if (token === 'null') {
    return res.status(401).send({ message: 'Unauthorized request' });
  }
  jwt.verify(token, secretKey, function (err, decoded) {
    if (!decoded) {
      return res.status(401).send({ message: 'Unauthorized request' });
    }
    if (err) {
      res.status(401).send({
        message: 'Unauthorized! Access Token was expired!',
      });
    } else {
      next();
    }
  });
}

function decryptCredentials(encryptedCredentials) {
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
function decryptItem(item) {
  // Decode the Base64 encoded encrypted credentials

  // Decrypt the username and password using AES decryption with the secret key
  const decryptedItem = CryptoJS.AES.decrypt(item, secretKey).toString(
    CryptoJS.enc.Utf8
  );

  return decryptedItem;
}
router.get('/', async (req, res) => {
  try {
    const connection = await connectToDatabase();

    // Execute a query
    const [rows] = await connection.execute('SELECT * FROM users');

    // Close the connection
    await connection.end();

    res.json(rows);
  } catch (error) {
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
        role: rows[0].role,
        firstName: rows[0].firstName,
        lastName: rows[0].lastName,
        registeredDate: rows[0].registeredDate,
      };
      let payload = { subject: user };

      let token = jwt.sign(payload, secretKey, { expiresIn: 3600 });
      Object.assign(user, { jwtToken: token });
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.post('/logout', async (req, res) => {
  // decrypt credentials
  const userId = decryptItem(req.body.userId);

  res.status(200).json();
});

module.exports = router;

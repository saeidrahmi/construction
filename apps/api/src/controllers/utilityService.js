const connectToDatabase = require('../db');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
import { EnvironmentInfo } from '../../../../libs/common/src/models/common';
const env = new EnvironmentInfo();
const jwtSecretKey = env.jwtSecretKey();
function verifyToken(allowedRoles) {
  return async function (req, res, next) {
    if (!req.headers.authorization) {
      return res.status(401).send({ errorMessage: 'Unauthorized request' });
    }

    let token = req.headers.authorization.split(' ')[1];
    if (token === 'null') {
      return res.status(401).send({ errorMessage: 'Unauthorized request' });
    }

    jwt.verify(token, jwtSecretKey, async function (err, decoded) {
      if (!decoded) {
        return res.status(401).send({ errorMessage: 'Unauthorized request' });
      }

      if (err) {
        res
          .status(401)
          .send({ errorMessage: 'Unauthorized! Access Token was expired!' });
      } else {
        let userId = decoded.subject.userId;
        let userRole = decoded.subject.role;

        const existingUser = await executeQuery(
          `SELECT * FROM users WHERE userId = ? and jwtToken= ?`,
          [userId, token]
        );

        if (existingUser.length > 0) {
          if (roleCheck(allowedRoles, userRole)) {
            next();
          } else {
            return res
              .status(401)
              .json({ errorMessage: 'Unauthorized. No Access.' });
          }
        } else {
          return res
            .status(401)
            .json({ errorMessage: 'Error resetting password.' });
        }
      }
    });
  };
}
function verifyTokenWithNoRole() {
  return async function (req, res, next) {
    try {

      const authorizationHeader = req.headers.authorization;

      if (
        !authorizationHeader ||
        authorizationHeader.split(' ')[0] !== 'Bearer'
      ) {
        return res.status(401).send({ errorMessage: 'Unauthorized request' });
      }

      const token = authorizationHeader.split(' ')[1];

      if (!token || token === 'null') {
        return res.status(401).send({ errorMessage: 'Unauthorized request' });
      }

      jwt.verify(token, jwtSecretKey, async function (err, decoded) {
        if (err) {
          return res
            .status(401)
            .send({ errorMessage: 'Unauthorized! Access Token was expired!' });
        }

        const userId = decoded?.subject?.userId;

        if (!userId) {
          return res.status(401).send({ errorMessage: 'Unauthorized request' });
        }

        const existingUser = await executeQuery(
          'SELECT * FROM users WHERE userId = ? and jwtToken= ?',
          [userId, token]
        );

        if (existingUser.length > 0) {
          next();
        } else {
          return res
            .status(401)
            .json({ errorMessage: 'Error resetting password.' });
        }
      });
    } catch (error) {
      console.error('Error in verifyTokenWithNoRole middleware:', error);
      return res.status(500).send({ errorMessage: 'Internal Server Error' });
    }
  };
}

function roleCheck(allowedRoles, userRole) {
  const userRoleLower = userRole?.toLocaleLowerCase();
  const allowedRolesLower = allowedRoles.map((role) =>
    role?.toLocaleLowerCase()
  );

  return allowedRolesLower.includes(userRoleLower);
}

const verifyAllToken = verifyToken([
  env.getRole().general,
  env.getRole().admin,
  env.getRole().sAdmin,
]);
const verifyGeneralToken = verifyToken([env.getRole().general]);
const verifyAdminToken = verifyToken([env.getRole().admin]);
const verifySAdminToken = verifyToken([env.getRole().sAdmin]);
const verifyAdminAndSAdminToken = verifyToken([
  env.getRole().admin,
  env.getRole().sAdmin,
]);

function decryptCredentials(encryptedCredentials, secretKey) {
  // Decode the Base64 encoded encrypted credentials
  // const encodedCredentials = Buffer.from(
  //   encryptedCredentials,
  //   'base64'
  // ).toString('ascii');

  // Split the encoded credentials into username and password using the delimiter
  const [encryptedUsername, encryptedPassword] =
    encryptedCredentials.split(':');

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
function encryptItem(item, secretKey) {
  const encryptedItem = CryptoJS.AES.encrypt(item, secretKey).toString();
  return encryptedItem;
}
function decryptItem(item, secretKey) {
  // Decrypt the username and password using AES decryption with the secret key
  const decryptedItem = CryptoJS.AES.decrypt(item, secretKey).toString(
    CryptoJS.enc.Utf8
  );

  return decryptedItem;
}

const executeQuery = async (query, params = []) => {
  const connection = await connectToDatabase();
  try {
    const [result] = await connection.execute(query, params);
    return result;
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.end();
  }
};
function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

module.exports = {
  executeQuery,
  decryptItem,
  encryptItem,
  decryptCredentials,
  verifyToken,
  addDays,
  verifySAdminToken,
  verifyAdminToken,
  verifyGeneralToken,
  verifyAdminAndSAdminToken,
  verifyAllToken,
  verifyTokenWithNoRole,
};

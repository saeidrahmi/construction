const connectToDatabase = require('../db');
const CryptoJS = require('crypto-js');

function verifyToken(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }
  let token = req.headers.authorization.split(' ')[1];
  if (token === 'null') {
    return res.status(401).send({ message: 'Unauthorized request' });
  }
  jwt.verify(token, webSecretKey, function (err, decoded) {
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
    connection.end();
  }
};

module.exports = {
  executeQuery,
  decryptItem,
  encryptItem,
  decryptCredentials,
  verifyToken,
};

const {
  decryptItem,
  executeQuery,
  encryptItem,
  decryptCredentials,
  verifyToken,
} = require('./utilityService'); // Import necessary helper functions
import { EnvironmentInfo } from '../../../../libs/common/src/models/common';
const passport = require('passport');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const env = new EnvironmentInfo();
const webSecretKey = env.webSecretKey();
const dbSecretKey = env.dbSecretKey();
const jwtSecretKey = env.jwtSecretKey();
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require('../../nodemailer');
const passportOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.webSecretKey(),
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

// Logout controller function
async function logoutController(req, res) {
  try {
    const userId = decryptItem(req.body.userId, webSecretKey);
    const result = await executeQuery(
      'UPDATE users SET jwtToken = ?, loggedIn = ? WHERE userId = ?',
      ['', 0, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(401).json({ errorMessage: 'Logout operation failed.' });
    } else {
      return res.status(200).json();
    }
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error updating user' });
  }
}
async function loginController(req, res) {
  try {
    const { credentials } = req.body;
    // Decrypt credentials
    const { userId, password } = decryptCredentials(credentials, webSecretKey);
    // Execute the select query
    const rows = await executeQuery('SELECT * FROM users WHERE userId = ? ', [
      userId,
    ]);

    if (rows.length === 0) {
      // User not found or incorrect credentials
      return res
        .status(401)
        .json({ errorMessage: 'Invalid userId or password' });
    } else if (password != decryptItem(rows[0].password, dbSecretKey)) {
      return res
        .status(401)
        .json({ errorMessage: 'Invalid userId or password.' });
    } else if (env.multiLoginAllowed() == false && rows[0].loggedIn) {
      return res
        .status(401)
        .json({ errorMessage: 'User is already logged-in.' });
    } else if (!rows[0].registered) {
      return res.status(401).json({ errorMessage: 'User is not registered.' });
    } else if (!rows[0].active) {
      return res.status(401).json({
        errorMessage: 'User is not active. Please call to activate your user.',
      });
    } else {
      const user = {
        userId: rows[0].userId,
        role: rows[0].role,
        firstName: rows[0].firstName,
        lastName: rows[0].lastName,
        registeredDate: rows[0].registeredDate,
        loggedIn: rows[0].loggedIn,
        active: rows[0].active,
        registered: rows[0].registered,
        lastLoginDate: new Date(),
      };
      const payload = { subject: user };
      const token = jwt.sign(payload, jwtSecretKey, {
        expiresIn: env.userSessionTokenExpiry(),
      });
      Object.assign(user, { jwtToken: token });

      // Update user login info
      const updateResult = await executeQuery(
        'UPDATE users SET loginCount = loginCount + 1, jwtToken = ?, loggedIn = ?, lastLoginDate = ? WHERE userId = ?',
        [token, 1, new Date(), userId]
      );
      if (updateResult.affectedRows === 0) {
        // User not found or update operation failed
        return res
          .status(401)
          .json({ errorMessage: 'Login Update operation failed.' });
      }

      // Send the user details and token
      return res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ errorMessage: 'Internal Server Error' });
  }
}
async function signupController(req, res) {
  try {
    const userId = decryptItem(req.body.userId, webSecretKey);
    const user = {
      userId: userId,
    };
    const payload = { subject: user };
    const token = jwt.sign(payload, jwtSecretKey, {
      expiresIn: env.userRegistrationTokenExpiry(),
    });
    const existingUser = await executeQuery(
      `SELECT * FROM users WHERE userId = ? `,
      [userId]
    );

    if (existingUser.length > 0 && existingUser[0].registered == 0) {
      // User already exists, handle accordingly (return error or update existing user)

      const query = 'UPDATE  users SET  jwtToken = ?  WHERE userId = ? ';
      const values = [token, userId];

      const result = await executeQuery(query, values);
      console.log(res);
      if (result.affectedRows > 0 || result.insertId) {
        try {
          await sendVerificationEmail(userId, token);
          return res.status(200).json({
            message:
              'Signup operation completed successfully. Please check your email.',
          });
        } catch (error) {
          return res.status(500).json({
            errorMessage:
              'Failed to send verification email. Please try again later.',
          });
        }
      } else {
        return res.status(500).json({ errorMessage: 'Error updating user' });
      }
    } else if (existingUser.length > 0 && existingUser[0].registered == 1) {
      return res.status(400).json({
        errorMessage: 'User already registered. Please try again later.',
      });
    } else {
      const query = `INSERT INTO users (userId, registeredDate,role, jwtToken, active, registered) VALUES ( ?,?, ?, ?, ?, ?)`;
      const values = [userId, new Date(), env.getRole().general, token, 0, 0];
      const result = await executeQuery(query, values);
      if (result.affectedRows > 0 || result.insertId) {
        try {
          await sendVerificationEmail(userId, token);
          return res.status(200).json({
            message:
              'Signup operation completed successfully. Please check your email.',
          });
        } catch (error) {
          return res.status(500).json({
            errorMessage:
              'Failed to send verification email. Please try again later.',
          });
        }
      } else {
        return res.status(500).json({ errorMessage: 'Error updating user' });
      }
    }
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error updating user' });
  }
}
async function resetPasswordController(req, res) {
  try {
    const userId = decryptItem(req.body.userId, webSecretKey);
    const user = {
      userId: userId,
    };

    const payload = { subject: user };
    const token = jwt.sign(payload, jwtSecretKey, {
      expiresIn: env.getPasswordResetExpiry(),
    });
    const existingUser = await executeQuery(
      `SELECT * FROM users WHERE userId = ? and registered= ? and active= ?`,
      [userId, 1, 1]
    );

    if (existingUser.length > 0) {
      // User already exists, handle accordingly (return error or update existing user)

      const query =
        'UPDATE  users SET  jwtToken = ?, passwordReset = ?  WHERE userId = ? ';
      const values = [token, 1, userId];

      const result = await executeQuery(query, values);

      if (result.affectedRows > 0 || result.insertId) {
        try {
          await sendPasswordResetEmail(userId, token);
          return res.status(200).json({
            message:
              'Password Reset operation completed successfully. Please check your email.',
          });
        } catch (error) {
          return res.status(500).json({
            errorMessage: 'Failed to send email. Please try again later.',
          });
        }
      } else {
        return res.status(500).json({ errorMessage: 'Error updating user' });
      }
    } else
      return res
        .status(500)
        .json({ errorMessage: 'Error: invalid request resetting password' });
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: 'Error: invalid request  resetting password' });
  }
}
async function registerController(req, res) {
  try {
    const user = req.body.user;
    const userSignupToken = req.body.userSignupToken;
    const userId = decryptItem(user.userId, webSecretKey);
    const password = decryptItem(user.password, webSecretKey);

    const existingUser = await executeQuery(
      `SELECT userId FROM users WHERE userId = ? and jwtToken=? and registered=?`,
      [userId, userSignupToken, 0]
    );
    if (existingUser.length === 0) {
      // User does not exists,
      return res.status(400).json({
        errorMessage: 'User not allowed to signup. Invalid request.',
      });
    } else {
      const userObj = {
        userId: userId,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        registeredDate: new Date(),
        loggedIn: 1,
        active: 1,
        registered: 1,
        lastLoginDate: new Date(),
      };
      const payload = { subject: userObj };
      const token = jwt.sign(payload, jwtSecretKey, {
        expiresIn: env.userRegistrationTokenExpiry(),
      });

      const query =
        'UPDATE  users SET loginCount=?, registeredDate=?, lastLoginDate=?, jwtToken = ?, loggedIn = ?, active=?, registered=?,firstName= ?,  lastName= ?, password= ?  WHERE userId = ?';
      const values = [
        1,
        userObj.registeredDate,
        userObj.lastLoginDate,
        token,
        1,
        1,
        1,
        userObj.firstName,
        userObj.lastName,
        encryptItem(password, dbSecretKey),
        userId,
      ];

      const result = await executeQuery(query, values);
      if (result.affectedRows > 0 || result.insertId) {
        return res.status(200).json(user);
      } else {
        return res.status(500).json({ errorMessage: 'Error updating user' });
      }
    }
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error registering user' });
  }
}
module.exports = {
  logoutController,
  loginController,
  signupController,
  registerController,
  resetPasswordController,
};

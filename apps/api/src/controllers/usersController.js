const {
  decryptItem,
  executeQuery,
  encryptItem,
  decryptCredentials,
  verifyToken,
  addDays,
} = require('./utilityService'); // Import necessary helper functions
import { EnvironmentInfo } from '../../../../libs/common/src/models/common';
const connectToDatabase = require('../db');
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
    } else if (rows[0].deleted) {
      return res.status(401).json({
        errorMessage: 'Account closed. Please call to activate your user.',
      });
    } else {
      const user = {
        userId: rows[0].userId,
        role: rows[0].role,
        profileImage: rows[0].profileImage,
        logoImage: rows[0].logoImage,
        firstName: rows[0].firstName,
        company: rows[0].company,
        jobProfileDescription: rows[0].jobProfileDescription,
        lastName: rows[0].lastName,
        middleName: rows[0].middleName,
        registeredDate: rows[0].registeredDate,
        loggedIn: rows[0].loggedIn,
        active: rows[0].active,
        registered: rows[0].registered,
        lastLoginDate: new Date(),
        phone: rows[0].phone,
        fax: rows[0].fax,
        website: rows[0].website,
        address: rows[0].address,
        city: rows[0].city,
        province: rows[0].province,
        postalCode: rows[0].postalCode,
      };
      const jwtUser = {
        userId: rows[0].userId,
      };
      const payload = { subject: jwtUser };
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
      } else {
        const selectPlansQuery = `SELECT * FROM userPlans JOIN plans ON userPlans.planId = plans.planId where userPlans.userId=? AND  userPlans.userPlanActive=1 `;
        const updateResult = await executeQuery(selectPlansQuery, [userId]);

        const response = {
          user: user,
          plan: updateResult[0],
        };
        return res.status(200).json(response);
      }
    }
  } catch (error) {
    res.status(500).json({ errorMessage: 'Internal Server Error' });
  }
}
async function signupController(req, res) {
  const connection = await connectToDatabase();
  try {
    await connection.beginTransaction();
    const userId = decryptItem(req.body.userId, webSecretKey);
    const user = {
      userId: userId,
    };
    const payload = { subject: user };
    const token = jwt.sign(payload, jwtSecretKey, {
      expiresIn: env.userRegistrationTokenExpiry(),
    });
    const [existingUser] = await connection.execute(
      `SELECT * FROM users WHERE userId = ? `,
      [userId]
    );

    if (existingUser.length > 0 && existingUser[0].registered == 0) {
      // User already exists, handle accordingly (return error or update existing user)

      const query = 'UPDATE  users SET  jwtToken = ?  WHERE userId = ? ';
      const values = [token, userId];

      const [result] = await connection.execute(query, values);

      if (result.affectedRows > 0 || result.insertId) {
        try {
          await sendVerificationEmail(userId, token);
          await connection.commit();
          return res.status(200).json({
            message:
              'Signup operation completed successfully. Please check your email.',
          });
        } catch (error) {
          await connection.rollback();
          return res.status(500).json({
            errorMessage:
              'Failed to send verification email. Please try again later.',
          });
        }
      } else {
        await connection.rollback();
        return res.status(500).json({ errorMessage: 'Error updating user' });
      }
    } else if (existingUser.length > 0 && existingUser[0].registered == 1) {
      return res.status(400).json({
        errorMessage: 'User already registered. Please try again later.',
      });
    } else {
      const query = `INSERT INTO users (userId, registeredDate,role, jwtToken, active, registered) VALUES ( ?,?, ?, ?, ?, ?)`;
      const values = [userId, new Date(), env.getRole().general, token, 0, 0];

      const [result] = await connection.execute(query, values);

      if (result.affectedRows > 0 || result.insertId) {
        try {
          await sendVerificationEmail(userId, token);
          console.log('succuesfull');
          await connection.commit();
          return res.status(200).json({
            message:
              'Signup operation completed successfully. Please check your email.',
          });
        } catch (error) {
          await connection.rollback();
          console.log('failed');

          return res.status(500).json({
            errorMessage:
              'Failed to send verification email. Please try again later.',
          });
        }
      } else {
        await connection.rollback();
        return res.status(500).json({ errorMessage: 'Error updating user' });
      }
    }
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ errorMessage: 'Error updating user' });
  } finally {
    await connection.end();
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
async function registerFreeUserController(req, res) {
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
      const connection = await connectToDatabase();
      try {
        await connection.beginTransaction();

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

        const [result] = await connection.execute(query, values);
        if (result.affectedRows > 0 || result.insertId) {
          const plan = req.body.plan;

          const purchaseDate = new Date();
          const values = [
            plan.planId,
            userId,
            purchaseDate,
            addDays(purchaseDate, plan.duration),
            1,
            //new Date(purchaseDate.getTime() + plan.duration * 24 * 60 * 60 * 1000),
          ];
          const query = `INSERT INTO userPlans ( planId,userId ,purchasedDate,userPlanExpiryDate,userPlanActive) VALUES (?, ?,?,?,?)`;
          const [result] = await connection.execute(query, values);
          if (result.affectedRows > 0 || result.insertId) {
            await connection.commit();

            const response = {
              user: {
                userId: userId,
                jwtToken: token,
                role: user.role,
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                registeredDate: userObj.registeredDate,
                lastLoginDate: userObj.lastLoginDate,
                active: true,
                deleted: false,
                loggedIn: true,
                registered: true,
              },
              plan: {
                ...plan,
                userPlanId: result.insertId,
                purchasedDate: purchaseDate,
                userPlanExpiryDate: addDays(purchaseDate, plan.duration),
                userPlanActive: 1,
              },
            };
            return res.status(200).json(response);
          } else {
            await connection.rollback();
            return res
              .status(500)
              .json({ errorMessage: 'Error updating user' });
          }
        } else {
          await connection.rollback();
          return res.status(500).json({ errorMessage: 'Error updating user' });
        }
      } catch (error) {
        await connection.rollback(); // Rollback the transaction on error
        return res.status(500).json({ errorMessage: 'Error registering user' });
      } finally {
        connection.end(); // Close the database connection
      }
    }
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error registering user' });
  }
}
async function registerPaidUserController(req, res) {
  try {
    const user = req.body.user;
    const userSignupToken = req.body.userSignupToken;
    const userId = decryptItem(user.userId, webSecretKey);
    const password = decryptItem(user.password, webSecretKey);
    const payment = req.body.payment;
    const amount = payment.amount;
    const tax = payment.tax;
    const totalAmount = payment.totalAmount;
    const paymentConfirmation = payment.paymentConfirmation;

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
      const connection = await connectToDatabase();
      try {
        await connection.beginTransaction();

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

        const [result] = await connection.execute(query, values);
        if (result.affectedRows > 0 || result.insertId) {
          const plan = req.body.plan;

          const purchaseDate = new Date();
          const values = [
            plan.planId,
            userId,
            purchaseDate,
            addDays(purchaseDate, plan.duration),
            //new Date(purchaseDate.getTime() + plan.duration * 24 * 60 * 60 * 1000),
            1,
          ];
          const query = `INSERT INTO userPlans ( planId,userId ,purchasedDate,userPlanExpiryDate,userPlanActive) VALUES (?, ?,?,?,?)`;
          console.log(values, query);
          const [result] = await connection.execute(query, values);
          if (result.affectedRows > 0 || result.insertId) {
            const values = [
              result.insertId,
              paymentConfirmation,
              amount,
              tax,
              totalAmount,
            ];
            const query = `INSERT INTO userPayments ( userPlanId ,paymentConfirmation ,paymentAmount,tax,totalPayment) VALUES (?, ?,?, ?,?)`;
            const [resultPayment] = await connection.execute(query, values);
            if (resultPayment.affectedRows > 0 || resultPayment.insertId) {
              await connection.commit();

              const response = {
                user: {
                  userId: userId,
                  jwtToken: token,
                  role: user.role,
                  firstName: user.firstName,
                  middleName: user.middleName,
                  lastName: user.lastName,
                  registeredDate: userObj.registeredDate,
                  lastLoginDate: userObj.lastLoginDate,
                  active: true,
                  deleted: false,
                  loggedIn: true,
                  registered: true,
                },
                plan: {
                  ...plan,
                  userPlanId: result.insertId,
                  purchasedDate: purchaseDate,
                  userPlanExpiryDate: addDays(purchaseDate, plan.duration),
                  userPlanActive: 1,
                },
              };
              return res.status(200).json(response);
            } else {
              await connection.rollback();
              return res
                .status(500)
                .json({ errorMessage: 'Error updating Payments' });
            }
          } else {
            await connection.rollback();
            return res
              .status(500)
              .json({ errorMessage: 'Error updating user' });
          }
        } else {
          await connection.rollback();
          return res.status(500).json({ errorMessage: 'Error updating user' });
        }
      } catch (error) {
        await connection.rollback(); // Rollback the transaction on error
        return res.status(500).json({ errorMessage: 'Error registering user' });
      } finally {
        connection.end(); // Close the database connection
      }
    }
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error registering user' });
  }
}

async function checkUserTokenController(req, res) {
  try {
    let token = req.body.token;
    if (token === 'null') return res.status(200).json(false);
    else {
      jwt.verify(token, jwtSecretKey, async (err, decoded) => {
        if (!decoded) return res.status(200).json(false);
        else if (err) return res.status(200).json(false);
        else {
          let userId = decoded.subject.userId;

          const existingUser = await executeQuery(
            `SELECT * FROM users WHERE userId = ? and jwtToken= ?`,
            [userId, token]
          );

          if (existingUser.length > 0) {
            return res.status(200).json(true);
          } else return res.status(200).json(false);
        }
      });
    }
  } catch (error) {
    return res.status(500).json();
  }
}

async function completeResetPasswordController(req, res) {
  try {
    let token = req.body.token;
    let userId = decryptItem(req.body.userId, webSecretKey);
    let password = decryptItem(req.body.password, webSecretKey);
    const query =
      'UPDATE  users SET password= ?,jwtToken = ?, passwordReset = ?  WHERE userId = ? and jwtToken = ? and passwordReset = ?';
    const values = [
      encryptItem(password, dbSecretKey),
      '',
      0,
      userId,
      token,
      1,
    ];
    const result = await executeQuery(query, values);

    if (result.affectedRows > 0 || result.insertId) {
      return res.status(200).json(true);
    } else {
      return res.status(500).json({ errorMessage: 'Error updating user' });
    }
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error resetting password.' });
  }
}
async function editUserProfileController(req, res) {
  try {
    const user = req.body;
    const userId = decryptItem(user.userId, webSecretKey);

    if (req.files['profileImage'] || req.files['logoImage']) {
      //const image = req.file;
      let query = '';
      let values = '';

      if (req.files['profileImage'] && !req.files['logoImage']) {
        const profileImage = req.files['profileImage'][0];
        const { originalname, buffer, mimetype } = profileImage;
        query =
          'UPDATE  users SET company = ?, jobProfileDescription = ?, profileImage = ?, firstName= ?,lastName = ?, phone = ?, fax = ?, address = ?, city = ?, province = ?,postalCode = ?, website = ? , middleName = ?  WHERE userId = ? ';
        values = [
          user.company,
          user.jobProfileDescription,
          buffer,
          user.firstName,
          user.lastName,
          user.phone,
          user.fax,
          user.address,
          user.city,
          user.province,
          user.postalCode,
          user.website,
          user.middleName,
          userId,
        ];
      } else if (!req.files['profileImage'] && req.files['logoImage']) {
        const logoImage = req.files['logoImage'][0];
        const { originalname, buffer, mimetype } = logoImage;
        query =
          'UPDATE  users SET company = ?, jobProfileDescription = ?, logoImage = ?, firstName= ?,lastName = ?, phone = ?, fax = ?, address = ?, city = ?, province = ?,postalCode = ?, website = ? , middleName = ?  WHERE userId = ? ';
        values = [
          user.company,
          user.jobProfileDescription,
          buffer,
          user.firstName,
          user.lastName,
          user.phone,
          user.fax,
          user.address,
          user.city,
          user.province,
          user.postalCode,
          user.website,
          user.middleName,
          userId,
        ];
      } else if (req.files['profileImage'] && req.files['logoImage']) {
        const logoImage = req.files['logoImage'][0];
        const profileImage = req.files['profileImage'][0];
        const profileImagebuffer = profileImage.buffer;
        const logoImagebuffer = logoImage.buffer;

        query =
          'UPDATE  users SET company = ?, jobProfileDescription = ?,  profileImage = ?,logoImage = ?, firstName= ?,lastName = ?, phone = ?, fax = ?, address = ?, city = ?, province = ?,postalCode = ?, website = ? , middleName = ?  WHERE userId = ? ';
        values = [
          user.company,
          user.jobProfileDescription,
          profileImagebuffer,
          logoImagebuffer,
          user.firstName,
          user.lastName,
          user.phone,
          user.fax,
          user.address,
          user.city,
          user.province,
          user.postalCode,
          user.website,
          user.middleName,
          userId,
        ];
      }

      const result = await executeQuery(query, values);
      if (result.affectedRows > 0 || result.insertId) {
        const selectQuery = `SELECT * FROM users WHERE userId = ?`;
        const selectResult = await executeQuery(selectQuery, [userId]);
        let userObject = selectResult[0];
        delete userObject.password;
        return res.status(200).json({ user: userObject });
      } else {
        return res.status(500).json({ errorMessage: 'Error updating user' });
      }
    } else {
      const query =
        'UPDATE  users SET  company = ?, jobProfileDescription = ?,firstName= ?,lastName = ?, phone = ?, fax = ?, address = ?, city = ?, province = ?,postalCode = ?, website = ? , middleName = ?  WHERE userId = ? ';
      const values = [
        user.company,
        user.jobProfileDescription,
        user.firstName,
        user.lastName,
        user.phone,
        user.fax,
        user.address,
        user.city,
        user.province,
        user.postalCode,
        user.website,
        user.middleName,
        userId,
      ];
      console.log(query, values);
      const result = await executeQuery(query, values);
      if (result.affectedRows > 0 || result.insertId) {
        const selectQuery = `SELECT * FROM users WHERE userId = ?`;
        const selectResult = await executeQuery(selectQuery, [userId]);
        let userObject = selectResult[0];
        delete userObject.password;
        return res.status(200).json({ user: userObject });
      } else {
        return res.status(500).json({ errorMessage: 'Error updating user' });
      }
    }
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error updating password.' });
  }
}

async function changePasswordController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    let password = decryptItem(req.body.password, webSecretKey);
    let currentPassword = decryptItem(req.body.currentPassword, webSecretKey);
    const existingUser = await executeQuery(
      `SELECT password FROM users WHERE userId = ? `,
      [userId]
    );
    if (
      existingUser.length > 0 &&
      currentPassword === decryptItem(existingUser[0].password, dbSecretKey)
    ) {
      const query = 'UPDATE  users SET password= ? WHERE userId = ? ';
      const values = [encryptItem(password, dbSecretKey), userId];
      const result = await executeQuery(query, values);

      if (result.affectedRows > 0 || result.insertId) {
        return res.status(200).json(true);
      } else {
        return res.status(500).json({ errorMessage: 'Error updating user' });
      }
    } else return res.status(400).json({ errorMessage: 'Wrong password' });
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error resetting password.' });
  }
}
async function userServicesListController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const selectQuery = `SELECT service FROM userServices WHERE userId = ?`;
    const selectResult = await executeQuery(selectQuery, [userId]);
    const serviceNames = selectResult.map((row) => row.service);
    return res.status(200).json(serviceNames);
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: 'Error getting user services.' });
  }
}
async function addUserServicesController(req, res) {
  try {
    const userId = decryptItem(req.body.userId, webSecretKey);
    const service = req.body.service;
    const query = `INSERT INTO userServices (userId,  service) VALUES ( ?,?)`;
    const values = [userId, service];
    const result = await executeQuery(query, values);
    if (result.affectedRows > 0 || result.insertId) {
      return res.status(200).json();
    } else {
      return res
        .status(500)
        .json({ errorMessage: 'Error adding service to user' });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: 'Error getting user services.' });
  }
}
async function removeUserServicesController(req, res) {
  try {
    try {
      const userId = decryptItem(req.body.userId, webSecretKey);
      const service = req.body.service;
      const query = `Delete from userServices WHERE userId = ? and  service=? `;
      const values = [userId, service];
      const result = await executeQuery(query, values);
      if (result.affectedRows > 0 || result.insertId) {
        return res.status(200).json();
      } else {
        return res
          .status(500)
          .json({ errorMessage: 'Error deleting service to user' });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ errorMessage: 'Error deleting user services.' });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: 'Error deleting user services.' });
  }
}
async function UsersListController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const isSAdmin = req.body.isSAdmin;
    let selectQuery;
    if (isSAdmin) selectQuery = `SELECT * FROM users `;
    else selectQuery = `SELECT * FROM users where role !='Admin' `;
    const selectResult = await executeQuery(selectQuery, []);

    // const serviceNames = selectResult.map((row) => row.service);
    return res.status(200).json(selectResult);
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: 'Error getting user services.' });
  }
}
async function DeleteUserController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const flag = req.body.flag;
    const isSAdmin = req.body.isSAdmin;
    const updateQuery = `UPDATE  users SET  deleted = ? where userId=?`;
    const updateResult = await executeQuery(updateQuery, [flag, userId]);
    let selectQuery;
    if (isSAdmin) selectQuery = `SELECT * FROM users `;
    else selectQuery = `SELECT * FROM users where role !='Admin' `;
    const selectResult = await executeQuery(selectQuery, []);
    // const serviceNames = selectResult.map((row) => row.service);
    return res.status(200).json(selectResult);
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: 'Error getting user services.' });
  }
}
async function UpdateUserActivationStatusController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const flag = req.body.flag;
    const isSAdmin = req.body.isSAdmin;
    const updateQuery = `UPDATE  users SET  active = ? where userId=?`;
    const updateResult = await executeQuery(updateQuery, [flag, userId]);
    let selectQuery;
    if (isSAdmin) selectQuery = `SELECT * FROM users `;
    else selectQuery = `SELECT * FROM users where role !='Admin' `;
    const selectResult = await executeQuery(selectQuery, []);
    // const serviceNames = selectResult.map((row) => row.service);
    return res.status(200).json(selectResult);
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: 'Error getting user services.' });
  }
}
// purchasing a plan for a user:
// make user previous plans inactive
// update user plans and make the plan active
// update user payments
async function purchasePlanController(req, res) {
  const connection = await connectToDatabase();
  try {
    const plan = req.body.plan;
    const payment = req.body.paymentInfo;
    const amount = payment.amount;
    const tax = payment.tax;
    const totalAmount = payment.totalAmount;
    const paymentConfirmation = payment.paymentConfirmation;

    const userId = decryptItem(req.body.userId, webSecretKey);
    await connection.beginTransaction();
    //  const updateQuery = `UPDATE  userPlans JOIN plans ON userPlans.planId = plans.planId SET  userPlans.userPlanActive = 0  WHERE userPlans.userId = ? AND plans.planType != 'free';`;
    const updateQuery = `UPDATE  userPlans   SET  userPlans.userPlanActive = 0  WHERE  userId = ?`;

    const [updateResult] = await connection.execute(updateQuery, [userId]);
    if (updateResult.affectedRows >= 0 || updateResult.insertId) {
      const purchaseDate = new Date();
      const values = [
        plan.planId,
        userId,
        purchaseDate,
        //new Date(purchaseDate.getTime() + plan.duration * 24 * 60 * 60 * 1000),
        addDays(purchaseDate, plan.duration),
        1,
      ];
      const query = `INSERT INTO userPlans ( planId,userId ,purchasedDate,userPlanExpiryDate,userPlanActive) VALUES (?, ?,?,?,?)`;

      const [result] = await connection.execute(query, values);
      if (result.affectedRows > 0 || result.insertId) {
        const values = [
          result.insertId,
          paymentConfirmation,
          amount,
          tax,
          totalAmount,
        ];
        const query = `INSERT INTO userPayments ( userPlanId ,paymentConfirmation ,paymentAmount,tax,totalPayment) VALUES (?, ?,?, ?,?)`;

        const [resultPayment] = await connection.execute(query, values);
        if (resultPayment.affectedRows > 0 || resultPayment.insertId) {
          await connection.commit();
          const selectPlansQuery = `SELECT * FROM userPlans JOIN plans ON userPlans.planId = plans.planId where userPlans.userId=? AND  userPlans.userPlanActive=1 `;
          const selectPlanResult = await executeQuery(selectPlansQuery, [
            userId,
          ]);

          return res.status(200).json({ plan: selectPlanResult[0] });
        } else {
          await connection.rollback();
          return res
            .status(500)
            .json({ errorMessage: 'Error updating Payment' });
        }
      } else {
        await connection.rollback();
        return res
          .status(500)
          .json({ errorMessage: 'Error updating userPlans setting inactive' });
      }
    } else {
      await connection.rollback();
      return res.status(500).json({ errorMessage: 'Error updating Payment' });
    }
  } catch (error) {
    await connection.rollback(); // Rollback the transaction on error
    return res.status(500).json({ errorMessage: 'Error  purchasing' });
  } finally {
    connection.end(); // Close the database connection
  }
}
async function listUserPlansController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const selectQuery = `SELECT * FROM userPlans JOIN plans ON userPlans.planId = plans.planId where userId=?  AND plans.planType != 'free' `;

    const selectResult = await executeQuery(selectQuery, [userId]);
    return res.status(200).json(selectResult);
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error getting settings.' });
  }
}
async function updateUserServiceLocationTypeController(req, res) {
  const connection = await connectToDatabase();
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const type = req.body.type;
    const updateQuery = `UPDATE  users   SET serviceCoverageType = ?  WHERE  userId = ?`;

    const [result] = await connection.execute(updateQuery, [type, userId]);
    if (result.affectedRows > 0 || result.insertId) {
      const deleteQuery = 'DELETE FROM userProvinces WHERE userId = ?';
      const deleteResult = await connection.execute(deleteQuery, [userId]);
      const deleteQueryCity = 'DELETE FROM userServiceCities WHERE userId = ?';
      const [deleteResultCity] = await connection.execute(deleteQueryCity, [
        userId,
      ]);
      await connection.commit();
      return res.status(200).json();
    } else {
      await connection.rollback();
      return res.status(500).json({ errorMessage: 'Error update users.' });
    }
  } catch (error) {
    await connection.rollback(); // Rollback the transaction on error
    return res.status(500).json({ errorMessage: 'Error  updating users' });
  } finally {
    connection.end(); // Close the database connection
  }
}
async function updateUserServiceProvincesController(req, res) {
  const connection = await connectToDatabase();
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const type = req.body.type;
    const provinces = req.body.provinces;
    const updateQuery = `UPDATE  users   SET serviceCoverageType = ?  WHERE  userId = ?`;

    const [result] = await connection.execute(updateQuery, [type, userId]);
    if (result.affectedRows > 0 || result.insertId) {
      const deleteQuery = 'DELETE FROM userProvinces WHERE userId = ?';
      const deleteResult = await connection.execute(deleteQuery, [userId]);
      const deleteQueryCity = 'DELETE FROM userServiceCities WHERE userId = ?';
      const [deleteResultCity] = await connection.execute(deleteQueryCity, [
        userId,
      ]);
      for (const province of provinces) {
        const query = `INSERT INTO userProvinces (userId, province) VALUES (?, ?)`;
        const [resultPayment] = await connection.execute(query, [
          userId,
          province,
        ]);
      }

      await connection.commit();
      return res.status(200).json();
    } else {
      await connection.rollback();
      return res.status(500).json({ errorMessage: 'Error update users.' });
    }
  } catch (error) {
    await connection.rollback(); // Rollback the transaction on error
    return res.status(500).json({ errorMessage: 'Error  updating users' });
  } finally {
    connection.end(); // Close the database connection
  }
}
async function updateUserServiceCitiesController(req, res) {
  const connection = await connectToDatabase();
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const type = req.body.type;
    const locations = req.body.locations;
    console.log(locations);
    const updateQuery = `UPDATE  users   SET serviceCoverageType = ?  WHERE  userId = ?`;

    const [result] = await connection.execute(updateQuery, [type, userId]);
    if (result.affectedRows > 0 || result.insertId) {
      const deleteQueryProv = 'DELETE FROM userProvinces WHERE userId = ?';
      const [deleteResultProv] = await connection.execute(deleteQueryProv, [
        userId,
      ]);
      const deleteQueryCity = 'DELETE FROM userServiceCities WHERE userId = ?';
      const [deleteResultCity] = await connection.execute(deleteQueryCity, [
        userId,
      ]);

      for (const item of locations) {
        const query = `INSERT INTO userServiceCities (userId, province,city) VALUES (?, ?,?)`;

        const [resultPayment] = await connection.execute(query, [
          userId,
          item.province,
          item.city,
        ]);
      }

      await connection.commit();
      return res.status(200).json();
    } else {
      await connection.rollback();
      return res.status(500).json({ errorMessage: 'Error update users.' });
    }
  } catch (error) {
    await connection.rollback(); // Rollback the transaction on error
    return res.status(500).json({ errorMessage: 'Error  updating users' });
  } finally {
    connection.end(); // Close the database connection
  }
}
async function listUserServiceLocationController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const selectQuery = `SELECT serviceCoverageType FROM users WHERE  userId = ?  `;
    const selectResult = await executeQuery(selectQuery, [userId]);

    if (selectResult[0].serviceCoverageType === 'country')
      return res.status(200).json(selectResult[0]);
    else if (selectResult[0].serviceCoverageType === 'province') {
      const selectQueryProv = `SELECT province FROM userProvinces WHERE  userId = ?  `;
      const selectResultProv = await executeQuery(selectQueryProv, [userId]);
      return res.status(200).json({
        serviceCoverageType: selectResult[0].serviceCoverageType,
        provinces: selectResultProv.map((item) => item.province),
      });
    } else if (selectResult[0].serviceCoverageType === 'city') {
      const selectQueryCity = `SELECT province,city FROM userServiceCities WHERE  userId = ?  `;
      const selectResultCity = await executeQuery(selectQueryCity, [userId]);
      return res.status(200).json({
        serviceCoverageType: selectResult[0].serviceCoverageType,
        cities: selectResultCity.map(
          (item) => `${item.city} (${item.province})`
        ),
      });
    }
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error getting settings.' });
  }
}
async function canUserAdvertiseController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const selectQuery1 = `SELECT userPlans.userPlanId,plans.numberOfAdvertisements FROM userPlans JOIN plans ON userPlans.planId  = plans.planId  WHERE  userPlans.userId = ? and userPlans.userPlanActive=1  `;
    const selectResult1 = await executeQuery(selectQuery1, [userId]);
    console.log(selectQuery1, userId);
    if (selectResult1?.length > 0) {
      console.log(selectResult1[0]?.userPlanId);
      const selectQuery = `select count(*) as count from userAdvertisements JOIN userPlans ON userAdvertisements.userPlanId  = userPlans.userPlanId  where userAdvertisements.userPlanId=? `;
      const selectResult = await executeQuery(selectQuery, [
        selectResult1[0]?.userPlanId,
      ]);
      console.log(
        selectResult1[0]?.userPlanId,
        selectResult[0]?.count,
        selectResult1[0]?.numberOfAdvertisements
      );
      if (selectResult[0]?.count >= selectResult1[0]?.numberOfAdvertisements)
        return res.status(200).json({
          result: false,
          usedAdvertisements: selectResult[0]?.count,
          allowedOriginalAdvertisements:
            selectResult1[0]?.numberOfAdvertisements,
          remainedAdvertisements:
            selectResult1[0]?.numberOfAdvertisements - selectResult[0]?.count,
        });
      else
        return res.status(200).json({
          result: true,
          usedAdvertisements: selectResult[0]?.count,
          allowedOriginalAdvertisements:
            selectResult1[0]?.numberOfAdvertisements,
          remainedAdvertisements:
            selectResult1[0]?.numberOfAdvertisements - selectResult[0]?.count,
        });
    } else {
      return res.status(500).json({ errorMessage: 'Error getting info.' });
    }
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error getting info.' });
  }
}
module.exports = {
  logoutController,
  loginController,
  signupController,
  registerFreeUserController,
  resetPasswordController,
  completeResetPasswordController,
  checkUserTokenController,
  editUserProfileController,
  changePasswordController,
  userServicesListController,
  addUserServicesController,
  removeUserServicesController,
  UsersListController,
  DeleteUserController,
  UpdateUserActivationStatusController,
  purchasePlanController,
  registerPaidUserController,
  listUserPlansController,
  updateUserServiceLocationTypeController,
  updateUserServiceProvincesController,
  updateUserServiceCitiesController,
  listUserServiceLocationController,
  canUserAdvertiseController,
};

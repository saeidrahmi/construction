const {
  decryptItem,
  executeQuery,
  encryptItem,
  decryptCredentials,
  verifyToken,
  addDays,
} = require('./utilityService'); // Import necessary helper functions
import { throwError } from 'rxjs';
import { EnvironmentInfo } from '../../../../libs/common/src/models/common';
const connectToDatabase = require('../db');
const { getUserRatings } = require('./common-queries');
const passport = require('passport');
const jwtPromisify = require('jsonwebtoken-promisified');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const env = new EnvironmentInfo();
const webSecretKey = env.webSecretKey();
const dbSecretKey = env.dbSecretKey();
const refreshSecretKey = env.refreshSecretKey();
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

// Generate Access and Refresh Tokens

const generateAccessToken = (userId, role) => {
  return jwt.sign({ subject: { userId: userId, role: role } }, jwtSecretKey, {
    expiresIn: env.userSessionTokenExpiry(),
  });
};

const generateRefreshToken = (userId, role) => {
  return jwt.sign(
    { subject: { userId: userId, role: role } },
    refreshSecretKey,
    {
      expiresIn: env.userSessionRefreshTokenExpiry(),
    }
  );
};

// Logout controller function
async function logoutController(req, res) {
  try {
    const userId = decryptItem(req.body.userId, webSecretKey);
    const result = await executeQuery(
      'UPDATE users SET jwtToken = ?, loggedIn = ? WHERE userId = ?',
      ['', 0, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(401).json({
        errorMessage: 'Failed to complete logout. Please try again.',
      });
    } else {
      return res.status(200).json();
    }
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: 'Failed to complete logout. Please try again.' });
  }
}
async function loginController(req, res) {
  const connection = await connectToDatabase();
  try {
    await connection.beginTransaction();
    const { credentials } = req.body;
    // Decrypt credentials
    const { userId, password } = decryptCredentials(credentials, webSecretKey);
    // Execute the select query
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE userId = ? ',
      [userId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      // User not found or incorrect credentials
      return res.status(402).json({
        errorMessage:
          'The provided user ID or password is incorrect. Please double-check your credentials and try again.',
      });
    } else if (env.multiLoginAllowed() == false && rows[0].loggedIn) {
      await connection.rollback();
      return res.status(402).json({
        errorMessage:
          'User is already logged in. Please log out from other sessions or contact support for assistance.',
      });
    } else if (!rows[0].registered) {
      await connection.rollback();
      return res.status(402).json({
        errorMessage:
          'User is not registered. Please sign up to create an account.',
      });
    } else if (!rows[0].active) {
      await connection.rollback();
      return res.status(402).json({
        errorMessage:
          'User account is currently inactive. Please contact support to activate your account.',
      });
    } else if (rows[0].locked) {
      await connection.rollback();
      return res.status(402).json({
        errorMessage:
          'User account is currently locked. Please contact support team or reset your password.',
      });
    } else if (rows[0].deleted) {
      await connection.rollback();
      return res.status(402).json({
        errorMessage:
          'User account is currently closed. Please contact support to activate your account.',
      });
    } else if (password != decryptItem(rows[0].password, dbSecretKey)) {
      //update password retry failure
      await executeQuery(
        'UPDATE users SET  passFailCount = passFailCount+1 WHERE userId = ?',
        [userId]
      );

      const lockQueryResult = await executeQuery(
        'select  passFailCount from users  WHERE userId = ?',
        [userId]
      );

      if (lockQueryResult[0]?.passFailCount >= 3)
        await executeQuery('UPDATE users SET  locked = 1 WHERE userId = ?', [
          userId,
        ]);
      await connection.rollback();
      return res.status(402).json({
        errorMessage:
          'The provided user ID or password is incorrect. Please double-check your credentials and try again.',
      });
    } else {
      await connection.execute(
        'UPDATE users SET  passFailCount = 0 WHERE userId = ?',
        [userId]
      );

      await connection.execute(
        'UPDATE users SET  locked = 0 WHERE userId = ?',
        [userId]
      );

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
        locked: rows[0].locked,
        registered: rows[0].registered,
        lastLoginDate: new Date(),
        phone: rows[0].phone,
        fax: rows[0].fax,
        website: rows[0].website,
        address: rows[0].address,
        city: rows[0].city,
        province: rows[0].province,
        postalCode: rows[0].postalCode,
        passwordResetRequired:
          rows[0].passwordResetRequired === 1 ? true : false,
        lastPasswordResetDate: rows[0].lastPasswordResetDate,
      };
      const jwtUser = {
        userId: rows[0].userId,
        role: rows[0].role,
      };
      // const payload = { subject: jwtUser };
      const token = generateAccessToken(jwtUser.userId, jwtUser.role);
      const refreshToken = generateRefreshToken(jwtUser.userId, jwtUser.role);

      // const token = jwt.sign(payload, jwtSecretKey, {
      //   expiresIn: env.userSessionTokenExpiry(),
      // });

      Object.assign(user, { jwtToken: token, refreshToken: refreshToken });

      //Object.assign(user, { refreshToken: refreshToken });

      // Update user login info
      const [updateResult] = await connection.execute(
        'UPDATE users SET loginCount = loginCount + 1, jwtToken = ?, loggedIn = ?, lastLoginDate = ? WHERE userId = ?',
        [token, 1, new Date(), userId]
      );
      if (updateResult.affectedRows === 0) {
        await connection.rollback();
        // User not found or update operation failed
        return res.status(500).json({
          errorMessage: 'Failed to login. Please try again.',
        });
      } else {
        const selectPlansQuery = `SELECT * FROM userPlans JOIN plans ON userPlans.planId = plans.planId where userPlans.userId=? AND  userPlans.userPlanActive=1 `;
        const [updateResult] = await connection.execute(selectPlansQuery, [
          userId,
        ]);
        const userMessagesResult = await getUserNumberOfNewMessages(
          connection,
          {
            userId: userId,
          }
        );

        // get password reset days info
        const selectSettingQuery = `SELECT passwordResetDurationAdminUsers,passwordResetDurationGeneralUsers FROM settings   `;
        const [SelectSettingResult] = await connection.execute(
          selectSettingQuery,
          []
        );

        let expirationPeriodInDays;
        if (user.role === 'General') {
          expirationPeriodInDays =
            SelectSettingResult[0].passwordResetDurationGeneralUsers;
        } else if (user.role === 'Admin' || user.role === 'SAdmin') {
          expirationPeriodInDays =
            SelectSettingResult[0].passwordResetDurationAdminUsers;
        }
        const response = {
          newMessagesNbr: userMessagesResult,
          user: user,
          plan: updateResult[0],
          expirationPeriodInDays: expirationPeriodInDays,
        };
        if (user.role === 'Admin') {
          const selectQuery = `SELECT * FROM userPermissions where userId=? `;
          const [selectResult] = await connection.execute(selectQuery, [
            userId,
          ]);
          if (selectResult?.length > 0) {
            response.userPermissions = {
              viewDashboard:
                selectResult[0]?.viewDashboard === 1 ? true : false,
              updateAdminSettings:
                selectResult[0]?.updateAdminSettings === 1 ? true : false,
              createUser: selectResult[0]?.createUser === 1 ? true : false,
              viewUsers: selectResult[0]?.viewUsers === 1 ? true : false,
              createPlan: selectResult[0]?.createPlan === 1 ? true : false,
              listPlans: selectResult[0]?.listPlans === 1 ? true : false,
              viewPendingAdvertisements:
                selectResult[0]?.viewPendingAdvertisements === 1 ? true : false,
              approveAdvertisement:
                selectResult[0]?.approveAdvertisement === 1 ? true : false,
              allowPlanActions:
                selectResult[0]?.allowPlanActions === 1 ? true : false,
              allowUserActions:
                selectResult[0]?.allowUserActions === 1 ? true : false,
              viewSupportRequests:
                selectResult[0]?.viewSupportRequests === 1 ? true : false,
            };
          }

          selectResult[0];
        }
        await connection.commit();
        return res.status(200).json(response);
      }
    }
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ errorMessage: 'Failed to login. Please try again' });
  } finally {
    await connection.end();
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
      `SELECT * FROM users WHERE userId = ? and registered= 1 and active= 1`,
      [userId]
    );

    if (existingUser.length > 0) {
      // User already exists, handle accordingly (return error or update existing user)

      const query =
        'UPDATE  users SET  jwtToken = ?, passwordResetRequired = 1 WHERE userId = ? ';
      const values = [token, userId];

      const result = await executeQuery(query, values);

      if (result.affectedRows > 0 || result.insertId) {
        try {
          await sendPasswordResetEmail(userId, token);
          return res.status(200).json({
            message:
              'Password reset completed successfully. Please check your email for further instructions.',
          });
        } catch (error) {
          return res.status(500).json({
            errorMessage: 'Failed to update information. Please try again.',
          });
        }
      } else {
        return res.status(500).json({
          errorMessage: 'Failed to update information. Please try again.',
        });
      }
    } else
      return res.status(500).json({
        errorMessage: 'Failed to update information. Please try again.',
      });
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
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
        errorMessage: 'Failed to retrieve information. Please try again later.',
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
        // const payload = { subject: userObj };
        // const token = jwt.sign(payload, jwtSecretKey, {
        //   expiresIn: env.userRegistrationTokenExpiry(),
        // });
        const token = generateAccessToken(userObj.userId, userObj.role);
        const refreshToken = generateRefreshToken(userObj.userId, userObj.role);

        const query =
          'UPDATE  users SET lastPasswordResetDate=?, passwordResetRequired=0, loginCount=?, registeredDate=?, lastLoginDate=?, jwtToken = ?, loggedIn = ?, active=?, registered=?,firstName= ?,  lastName= ?, password= ?, previousPassword=?  WHERE userId = ?';
        const values = [
          new Date(),
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
                refreshToken: refreshToken,
                role: user.role,
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                registeredDate: userObj.registeredDate,
                lastLoginDate: userObj.lastLoginDate,
                active: true,
                deleted: false,
                locked: false,
                loggedIn: true,
                registered: true,
                passwordResetRequired: false,
                lastPasswordResetDate: new Date(),
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
            return res.status(500).json({
              errorMessage: 'Failed to update information. Please try again.',
            });
          }
        } else {
          await connection.rollback();
          return res.status(500).json({
            errorMessage: 'Failed to update information. Please try again.',
          });
        }
      } catch (error) {
        await connection.rollback(); // Rollback the transaction on error
        return res.status(500).json({
          errorMessage: 'Failed to update information. Please try again.',
        });
      } finally {
        connection.end(); // Close the database connection
      }
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
  }
}

async function refreshTokenController(req, res) {
  const refreshToken = req.body.refreshToken;

  if (refreshToken == null) {
    return res.status(401).send('Refresh token not provided');
  }

  try {
    const user = await jwtPromisify.verify(refreshToken, refreshSecretKey);

    const accessToken = generateAccessToken(
      user.subject.userId,
      user.subject.role
    );

    const updateResult = await executeQuery(
      'UPDATE users SET jwtToken = ? where userId = ?',
      [accessToken, user.subject.userId]
    );

    if (updateResult.affectedRows > 0 || updateResult.insertId) {
      return res.status(200).json(accessToken);
    } else {
      return res.status(403).send('Failed to update token');
    }
  } catch (error) {
    return res.status(403).send('Invalid or expired refresh token');
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
        errorMessage:
          'Failed to retrieve information. Please try again later..',
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
        // const payload = { subject: userObj };
        // const token = jwt.sign(payload, jwtSecretKey, {
        //   expiresIn: env.userRegistrationTokenExpiry(),
        // });
        const token = generateAccessToken(userObj.userId, userObj.role);
        const refreshToken = generateRefreshToken(userObj.userId, userObj.role);

        const query =
          'UPDATE  users SET lastPasswordResetDate=?, passwordResetRequired=0, loginCount=?, registeredDate=?, lastLoginDate=?, jwtToken = ?, loggedIn = ?, active=?, registered=?,firstName= ?,  lastName= ?, password= ?, previousPassword=?  WHERE userId = ?';
        const values = [
          new Date(),
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
                  refreshToken: refreshToken,
                  role: user.role,
                  firstName: user.firstName,
                  middleName: user.middleName,
                  lastName: user.lastName,
                  registeredDate: userObj.registeredDate,
                  lastLoginDate: userObj.lastLoginDate,
                  active: true,
                  deleted: false,
                  locked: false,
                  loggedIn: true,
                  registered: true,
                  passwordResetRequired: false,
                  lastPasswordResetDate: new Date(),
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
              return res.status(500).json({
                errorMessage: 'Failed to update information. Please try again.',
              });
            }
          } else {
            await connection.rollback();
            return res.status(500).json({
              errorMessage: 'Failed to update information. Please try again.',
            });
          }
        } else {
          await connection.rollback();
          return res.status(500).json({
            errorMessage: 'Failed to update information. Please try again.',
          });
        }
      } catch (error) {
        await connection.rollback(); // Rollback the transaction on error
        return res.status(500).json({
          errorMessage: 'Failed to update information. Please try again.',
        });
      } finally {
        connection.end(); // Close the database connection
      }
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
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

    const existingUser = await executeQuery(
      `SELECT password,previousPassword FROM users WHERE userId = ? and jwtToken = ?`,
      [userId, token]
    );

    if (
      existingUser.length > 0 &&
      existingUser[0].previousPassword &&
      (password ===
        decryptItem(existingUser[0]?.previousPassword, dbSecretKey) ||
        password === decryptItem(existingUser[0]?.password, dbSecretKey))
    ) {
      return res.status(500).json({
        errorMessage: 'Failed to change the password. Please try again.',
      });
    }

    const query =
      'UPDATE  users SET previousPassword=?,lastPasswordResetDate=?, passwordResetRequired=0, password= ?,jwtToken = ?, passwordResetRequired = 0  WHERE userId = ? and jwtToken = ? and passwordResetRequired = 1';
    const values = [
      existingUser[0].password,
      new Date(),
      encryptItem(password, dbSecretKey),
      '',

      userId,
      token,
    ];
    const result = await executeQuery(query, values);

    if (result.affectedRows > 0 || result.insertId) {
      return res.status(200).json(true);
    } else {
      return res.status(500).json({
        errorMessage: 'Failed to update information. Please try again.',
      });
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again..',
    });
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
        return res.status(500).json({
          errorMessage: 'Failed to update information. Please try again.',
        });
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

      const result = await executeQuery(query, values);
      if (result.affectedRows > 0 || result.insertId) {
        const selectQuery = `SELECT * FROM users WHERE userId = ?`;
        const selectResult = await executeQuery(selectQuery, [userId]);
        let userObject = selectResult[0];
        delete userObject.password;
        return res.status(200).json({ user: userObject });
      } else {
        return res.status(500).json({
          errorMessage: 'Failed to update information. Please try again.',
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
  }
}

async function changePasswordController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    let newPassword = decryptItem(req.body.password, webSecretKey);
    let currentPassword = decryptItem(req.body.currentPassword, webSecretKey);
    const existingUser = await executeQuery(
      `SELECT password,previousPassword FROM users WHERE userId = ? `,
      [userId]
    );
    if (
      existingUser.length > 0 &&
      currentPassword === decryptItem(existingUser[0].password, dbSecretKey)
    ) {
      if (
        existingUser[0].previousPassword &&
        (newPassword ===
          decryptItem(existingUser[0]?.previousPassword, dbSecretKey) ||
          newPassword === decryptItem(existingUser[0].password, dbSecretKey))
      ) {
        return res.status(500).json({
          errorMessage: 'Failed to change the password. Please try again.',
        });
      }

      const query =
        'UPDATE  users SET password= ?, lastPasswordResetDate=?, passwordResetRequired=0,previousPassword=? WHERE userId = ? ';
      const values = [
        encryptItem(newPassword, dbSecretKey),
        new Date(),
        existingUser[0].password,
        userId,
      ];

      const result = await executeQuery(query, values);

      if (result.affectedRows > 0 || result.insertId) {
        return res.status(200).json(true);
      } else {
        return res.status(500).json({
          errorMessage: 'Failed to update information. Please try again.',
        });
      }
    } else
      return res.status(400).json({
        errorMessage: 'Failed to update information. Please try again.',
      });
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
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
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
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
      return res.status(500).json({
        errorMessage: 'Failed to update information. Please try again.',
      });
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
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
        return res.status(500).json({
          errorMessage: 'Failed to delete the information. Please try again.',
        });
      }
    } catch (error) {
      return res.status(500).json({
        errorMessage: 'Failed to delete the information. Please try again.',
      });
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to delete the information. Please try again.',
    });
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
    return res.status(500).json({
      errorMessage: 'Failed to delete the information. Please try again.',
    });
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
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
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
          return res.status(500).json({
            errorMessage: 'Failed to update information. Please try again.',
          });
        }
      } else {
        await connection.rollback();
        return res.status(500).json({
          errorMessage: 'Failed to update information. Please try again.',
        });
      }
    } else {
      await connection.rollback();
      return res.status(500).json({
        errorMessage: 'Failed to update information. Please try again.',
      });
    }
  } catch (error) {
    await connection.rollback(); // Rollback the transaction on error
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
  } finally {
    connection.end(); // Close the database connection
  }
}
async function listUserPlansController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const selectQuery = `SELECT * FROM userPlans JOIN plans ON userPlans.planId = plans.planId where userId=?  `;
    // const selectQuery = `SELECT * FROM userPlans JOIN plans ON userPlans.planId = plans.planId where userId=?  AND plans.planType != 'free' `;

    const selectResult = await executeQuery(selectQuery, [userId]);
    return res.status(200).json(selectResult);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
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
      return res.status(500).json({
        errorMessage: 'Failed to update information. Please try again.',
      });
    }
  } catch (error) {
    await connection.rollback(); // Rollback the transaction on error
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
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
      return res.status(500).json({
        errorMessage: 'Failed to update information. Please try again.',
      });
    }
  } catch (error) {
    await connection.rollback(); // Rollback the transaction on error
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
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
      return res.status(500).json({
        errorMessage: 'Failed to update information. Please try again.',
      });
    }
  } catch (error) {
    await connection.rollback(); // Rollback the transaction on error
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
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
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
  }
}
async function canUserAdvertiseController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const selectQuery1 = `SELECT userPlans.userPlanId ,plans.numberOfAdvertisements FROM userPlans JOIN plans ON userPlans.planId  = plans.planId  WHERE  userPlans.userId = ? and userPlans.userPlanActive=1  `;
    const selectResult1 = await executeQuery(selectQuery1, [userId]);

    if (selectResult1?.length > 0) {
      const selectQuery = `select count(*) as count from userAdvertisements JOIN userPlans ON userAdvertisements.userPlanId  = userPlans.userPlanId  where userAdvertisements.userPlanId=? `;
      const selectResult = await executeQuery(selectQuery, [
        selectResult1[0]?.userPlanId,
      ]);

      if (selectResult[0]?.count >= selectResult1[0]?.numberOfAdvertisements)
        return res.status(200).json({
          activePlanId: selectResult1[0].userPlanId,
          result: false,
          usedAdvertisements: selectResult[0]?.count,
          allowedOriginalAdvertisements:
            selectResult1[0]?.numberOfAdvertisements,
          remainedAdvertisements:
            selectResult1[0]?.numberOfAdvertisements - selectResult[0]?.count,
        });
      else
        return res.status(200).json({
          activePlanId: selectResult1[0].userPlanId,
          result: true,
          usedAdvertisements: selectResult[0]?.count,
          allowedOriginalAdvertisements:
            selectResult1[0]?.numberOfAdvertisements,
          remainedAdvertisements:
            selectResult1[0]?.numberOfAdvertisements - selectResult[0]?.count,
        });
    } else {
      return res.status(500).json({
        errorMessage: 'Failed to retrieve information. Please try again later.',
      });
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
async function getApplicationSettingsController(req, res) {
  try {
    const selectQuery = `SELECT * FROM settings`;
    const selectResult = await executeQuery(selectQuery, []);
    return res.status(200).json(selectResult[0]);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}

async function getUserRatingsController(req, res) {
  try {
    let userAdvertisementId = req.body.userAdvertisementId;
    // get userId
    const selectUserQuery = `select userId from userAdvertisements JOIN userPlans ON userAdvertisements.userPlanId  = userPlans.userPlanId where  userAdvertisements.userAdvertisementId=?;`;
    const selectUserResult = await executeQuery(selectUserQuery, [
      userAdvertisementId,
    ]);
    if (selectUserResult?.length === 0)
      return res
        .status(500)
        .json({ errorMessage: 'Error getting user ratings.' });

    const userId = selectUserResult[0]?.userId;
    const selectRatingResult = await getUserRatings(userId);
    console.log('re', selectRatingResult);
    return res.status(200).json(selectRatingResult);
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: 'Error getting user ratings.' });
  }
}
async function getUserRatingsDetailsController(req, res) {
  try {
    let userAdvertisementId = req.body.userAdvertisementId;
    // get userId
    const selectUserQuery = `select userId from userAdvertisements JOIN userPlans ON userAdvertisements.userPlanId  = userPlans.userPlanId where  userAdvertisements.userAdvertisementId=?;`;
    const selectUserResult = await executeQuery(selectUserQuery, [
      userAdvertisementId,
    ]);
    if (selectUserResult?.length === 0)
      return res
        .status(500)
        .json({ errorMessage: 'Error getting user ratings.' });

    const userId = selectUserResult[0]?.userId;
    const selectRatingResult = await getUserRatings(userId);

    const selectDetailsQuery = `select userRatings.dateCreated, userRatings.performance, userRatings.flexibility,
    userRatings.cleanliness, userRatings.qualityOfWork, userRatings.timeliness,
    userRatings.communicationSkills, userRatings.costManagement, userRatings.professionalism, userRatings.safety,
     userRatings.materialsAndEquipment, userRatings.overallCustomerSatisfaction,
    userRatings.feedback, users.firstName  from userRatings
    JOIN users ON userRatings.ratedBy  = users.userId
    where userRatings.userId=? ORDER BY userRatings.dateCreated DESC;`;
    const selectDetailsResult = await executeQuery(selectDetailsQuery, [
      userId,
    ]);

    let response = {
      avgRatings: selectRatingResult,
      details: selectDetailsResult,
    };
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: 'Error getting user ratings.' });
  }
}
async function getAllUserRatingsDetailsBasedOnUserId(req, res) {
  try {
    const userId = decryptItem(req.body.userId, webSecretKey);

    const selectRatingResult = await getUserRatings(userId);

    const selectDetailsQuery = `select userRatings.dateCreated, userRatings.performance, userRatings.flexibility,
    userRatings.cleanliness, userRatings.qualityOfWork, userRatings.timeliness,
    userRatings.communicationSkills, userRatings.costManagement, userRatings.professionalism, userRatings.safety,
     userRatings.materialsAndEquipment, userRatings.overallCustomerSatisfaction,
    userRatings.feedback, users.firstName  from userRatings
    JOIN users ON userRatings.ratedBy  = users.userId
    where userRatings.userId=? ORDER BY userRatings.dateCreated DESC;`;
    const selectDetailsResult = await executeQuery(selectDetailsQuery, [
      userId,
    ]);

    let response = {
      avgRatings: selectRatingResult,
      details: selectDetailsResult,
    };
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: 'Error getting user ratings.' });
  }
}

async function getPreNewAdInfoController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    // get user registered date
    const selectRegDateQuery = `SELECT registeredDate FROM users where userId=?`;
    const selectRegDateResult = await executeQuery(selectRegDateQuery, [
      userId,
    ]);
    // get user rating
    const selectRatingResult = await getUserRatings(userId);

    // get number of active ads
    const selectActiveAdsQuery = `select count(*) as countAds from userAdvertisements JOIN userPlans ON userAdvertisements.userPlanId  = userPlans.userPlanId where  userAdvertisements.expiryDate  > CURDATE() And userPlans.userId =?;`;
    const selectActiveAdsResult = await executeQuery(selectActiveAdsQuery, [
      userId,
    ]);
    // get settings
    const selectSettingQuery = `SELECT * FROM settings`;
    const selectSettingResult = await executeQuery(selectSettingQuery, []);
    // get services

    const selectServicesQuery = `SELECT service FROM userServices WHERE userId = ?`;
    const selectServicesResult = await executeQuery(selectServicesQuery, [
      userId,
    ]);
    const serviceNames = selectServicesResult.map((row) => row.service);
    // get locations

    const selectLocationsQuery = `SELECT serviceCoverageType FROM users WHERE  userId = ?  `;
    const selectLocationsResult = await executeQuery(selectLocationsQuery, [
      userId,
    ]);
    let serviceLocationInfo;
    if (selectLocationsResult[0].serviceCoverageType === 'country') {
      serviceLocationInfo = {
        serviceCoverageType: 'country',
      };
    } else if (selectLocationsResult[0].serviceCoverageType === 'province') {
      const selectQueryProv = `SELECT province FROM userProvinces WHERE  userId = ?  `;
      const selectResultProv = await executeQuery(selectQueryProv, [userId]);
      serviceLocationInfo = {
        serviceCoverageType: selectLocationsResult[0].serviceCoverageType,
        provinces: selectResultProv.map((item) => item.province),
      };
    } else if (selectLocationsResult[0].serviceCoverageType === 'city') {
      const selectQueryCity = `SELECT province,city FROM userServiceCities WHERE  userId = ?  `;
      const selectResultCity = await executeQuery(selectQueryCity, [userId]);
      serviceLocationInfo = {
        serviceCoverageType: selectLocationsResult[0].serviceCoverageType,
        cities: selectResultCity.map(
          (item) => `${item.city} (${item.province})`
        ),
      };
    }

    // info
    const info = {
      registeredDate: selectRegDateResult[0].registeredDate,
      acitveAds: selectActiveAdsResult[0].countAds,
      userRate: selectRatingResult,
      appSettings: selectSettingResult[0],
      services: serviceNames,
      locations: serviceLocationInfo,
    };
    return res.status(200).json(info);
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error getting settings.' });
  }
}

async function getAdvertisementDetailsController(req, res) {
  try {
    let userAdvertisementId = req.body.userAdvertisementId;

    // get userId
    const selectUserQuery = `select userId from userAdvertisements JOIN userPlans ON userAdvertisements.userPlanId  = userPlans.userPlanId where  userAdvertisements.userAdvertisementId=?;`;
    const selectUserResult = await executeQuery(selectUserQuery, [
      userAdvertisementId,
    ]);

    const userId = selectUserResult[0].userId;

    // get user general info
    const selectUserInfoQuery = `select userId,firstName,lastName,registeredDate,phone,fax,address, city, province, postalCode, website,  profileImage from  users where userId=?`;

    const selectUserInfoResult = await executeQuery(selectUserInfoQuery, [
      userId,
    ]);

    // update visits
    const updateQuery = `update  userAdvertisements set numberOfVisits=numberOfVisits+1  where userAdvertisementId=?`;
    const updateResult = await executeQuery(updateQuery, [userAdvertisementId]);

    // get Ad details

    const selectAdQuery = `SELECT userAdvertisements.*,userAdvertisementImages.userAdvertisementImage
                          FROM userAdvertisements
                          JOIN userPlans ON userAdvertisements.userPlanId = userPlans.userPlanId
                          LEFT JOIN userAdvertisementImages ON userAdvertisements.userAdvertisementId = userAdvertisementImages.userAdvertisementId
                          WHERE userAdvertisements.userAdvertisementId=? and userAdvertisements.deleted = 0 and userAdvertisements.active = 1  and userAdvertisements.approvedByAdmin = 1 and  userAdvertisements.expiryDate  > CURDATE() `;
    const selectAdResult = await executeQuery(selectAdQuery, [
      userAdvertisementId,
    ]);

    // get user registered date
    const selectRegDateQuery = `SELECT registeredDate FROM users where userId=?`;
    const selectRegDateResult = await executeQuery(selectRegDateQuery, [
      userId,
    ]);
    // get user rating

    const selectRatingResult = await getUserRatings(userId);

    // get number of active ads
    const selectActiveAdsQuery = `select count(*) as countAds from userAdvertisements JOIN userPlans ON userAdvertisements.userPlanId  = userPlans.userPlanId where
                                  userAdvertisements.active=1 and userAdvertisements.rejected=0 and  userAdvertisements.deleted=0 and userAdvertisements.approvedByAdmin=1  and userAdvertisements.expiryDate  > CURDATE() And userPlans.userId =?;`;
    const selectActiveAdsResult = await executeQuery(selectActiveAdsQuery, [
      userId,
    ]);
    // get settings
    const selectSettingQuery = `SELECT * FROM settings`;
    const selectSettingResult = await executeQuery(selectSettingQuery, []);
    // get services

    const selectServicesQuery = `SELECT service FROM userServices WHERE userId = ?`;
    const selectServicesResult = await executeQuery(selectServicesQuery, [
      userId,
    ]);
    const serviceNames = selectServicesResult.map((row) => row.service);
    // get locations

    const selectLocationsQuery = `SELECT serviceCoverageType FROM users WHERE  userId = ?  `;
    const selectLocationsResult = await executeQuery(selectLocationsQuery, [
      userId,
    ]);
    let serviceLocationInfo;
    if (selectLocationsResult[0].serviceCoverageType === 'country') {
      serviceLocationInfo = {
        serviceCoverageType: 'country',
      };
    } else if (selectLocationsResult[0].serviceCoverageType === 'province') {
      const selectQueryProv = `SELECT province FROM userProvinces WHERE  userId = ?  `;
      const selectResultProv = await executeQuery(selectQueryProv, [userId]);
      serviceLocationInfo = {
        serviceCoverageType: selectLocationsResult[0].serviceCoverageType,
        provinces: selectResultProv.map((item) => item.province),
      };
    } else if (selectLocationsResult[0].serviceCoverageType === 'city') {
      const selectQueryCity = `SELECT province,city FROM userServiceCities WHERE  userId = ?  `;
      const selectResultCity = await executeQuery(selectQueryCity, [userId]);
      serviceLocationInfo = {
        serviceCoverageType: selectLocationsResult[0].serviceCoverageType,
        cities: selectResultCity.map(
          (item) => `${item.city} (${item.province})`
        ),
      };
    }

    // info
    const info = {
      registeredDate: selectRegDateResult[0].registeredDate,
      acitveAds: selectActiveAdsResult[0].countAds,
      userRate: selectRatingResult,
      appSettings: selectSettingResult[0],
      services: serviceNames,
      locations: serviceLocationInfo,
      selectAdResult: selectAdResult,
      userInfo: selectUserInfoResult[0],
    };
    return res.status(200).json(info);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
async function getUserAdvertisementDetailsController(req, res) {
  try {
    let userAdvertisementId = req.body.userAdvertisementId;
    let userId = decryptItem(req.body.userId, webSecretKey);

    // get user general info
    const selectUserInfoQuery = `select userId,firstName,lastName,registeredDate,phone,fax,address, city, province, postalCode, website,  profileImage from  users where userId=?`;

    const selectUserInfoResult = await executeQuery(selectUserInfoQuery, [
      userId,
    ]);

    // get Ad details

    const selectAdQuery = `SELECT userAdvertisements.*, userAdvertisementImages.userAdvertisementImage
                          FROM userAdvertisements
                          JOIN userPlans ON userAdvertisements.userPlanId = userPlans.userPlanId
                          LEFT JOIN userAdvertisementImages ON userAdvertisements.userAdvertisementId = userAdvertisementImages.userAdvertisementId
                          WHERE userAdvertisements.userAdvertisementId=? and userAdvertisements.deleted = 0 and userPlans.userId=? `;
    const selectAdResult = await executeQuery(selectAdQuery, [
      userAdvertisementId,
      userId,
    ]);

    // get user registered date
    const selectRegDateQuery = `SELECT registeredDate FROM users where userId=?`;
    const selectRegDateResult = await executeQuery(selectRegDateQuery, [
      userId,
    ]);
    // get user rating
    const selectRatingResult = await getUserRatings(userId);

    // get number of active ads
    const selectActiveAdsQuery = `select count(*) as countAds from userAdvertisements JOIN userPlans ON userAdvertisements.userPlanId  = userPlans.userPlanId where  userAdvertisements.expiryDate  > CURDATE() And userPlans.userId =?;`;
    const selectActiveAdsResult = await executeQuery(selectActiveAdsQuery, [
      userId,
    ]);
    // get settings
    const selectSettingQuery = `SELECT * FROM settings`;
    const selectSettingResult = await executeQuery(selectSettingQuery, []);
    // get services

    const selectServicesQuery = `SELECT service FROM userServices WHERE userId = ?`;
    const selectServicesResult = await executeQuery(selectServicesQuery, [
      userId,
    ]);
    const serviceNames = selectServicesResult.map((row) => row.service);
    // get locations

    const selectLocationsQuery = `SELECT serviceCoverageType FROM users WHERE  userId = ?  `;
    const selectLocationsResult = await executeQuery(selectLocationsQuery, [
      userId,
    ]);
    let serviceLocationInfo;
    if (selectLocationsResult[0].serviceCoverageType === 'country') {
      serviceLocationInfo = {
        serviceCoverageType: 'country',
      };
    } else if (selectLocationsResult[0].serviceCoverageType === 'province') {
      const selectQueryProv = `SELECT province FROM userProvinces WHERE  userId = ?  `;
      const selectResultProv = await executeQuery(selectQueryProv, [userId]);
      serviceLocationInfo = {
        serviceCoverageType: selectLocationsResult[0].serviceCoverageType,
        provinces: selectResultProv.map((item) => item.province),
      };
    } else if (selectLocationsResult[0].serviceCoverageType === 'city') {
      const selectQueryCity = `SELECT province,city FROM userServiceCities WHERE  userId = ?  `;
      const selectResultCity = await executeQuery(selectQueryCity, [userId]);
      serviceLocationInfo = {
        serviceCoverageType: selectLocationsResult[0].serviceCoverageType,
        cities: selectResultCity.map(
          (item) => `${item.city} (${item.province})`
        ),
      };
    }

    // info
    const info = {
      registeredDate: selectRegDateResult[0].registeredDate,
      acitveAds: selectActiveAdsResult[0].countAds,
      userRate: selectRatingResult,
      appSettings: selectSettingResult[0],
      services: serviceNames,
      locations: serviceLocationInfo,
      selectAdResult: selectAdResult,
      userInfo: selectUserInfoResult[0],
    };
    return res.status(200).json(info);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}

function canUserCreateAdvertisementController(userId) {
  return new Promise(async (resolve, reject) => {
    try {
      const selectQuery1 = `SELECT userPlans.userPlanId, plans.numberOfAdvertisements FROM userPlans JOIN plans ON userPlans.planId = plans.planId WHERE userPlans.userId = ? and userPlans.userPlanActive = 1`;
      const selectResult1 = await executeQuery(selectQuery1, [userId]);

      if (selectResult1?.length > 0) {
        const selectQuery = `select count(*) as count from userAdvertisements JOIN userPlans ON userAdvertisements.userPlanId = userPlans.userPlanId where userAdvertisements.userPlanId = ?`;
        const selectResult = await executeQuery(selectQuery, [
          selectResult1[0]?.userPlanId,
        ]);

        if (selectResult[0]?.count >= selectResult1[0]?.numberOfAdvertisements)
          resolve(false);
        else resolve(true);
      } else {
        reject('server error');
      }
    } catch (error) {
      reject('server error');
    }
  });
}
function canUserEditAdvertisement(userId, advertisementId) {
  return new Promise(async (resolve, reject) => {
    try {
      const selectQuery = `select count(*) as count from userAdvertisements JOIN userPlans ON userAdvertisements.userPlanId = userPlans.userPlanId where userAdvertisements.expiryDate  > CURDATE() and userAdvertisements.active=1 and userAdvertisements.deleted=0 and  userPlans.userId = ? and  userAdvertisements.userAdvertisementId  = ?`;
      const selectResult = await executeQuery(selectQuery, [
        userId,
        advertisementId,
      ]);

      if (selectResult[0]?.count >= 0) resolve(true);
      else resolve(false);
    } catch (error) {
      reject('server error');
    }
  });
}

async function saveUserRegularAdController(req, res) {
  let connection;
  try {
    const info = req.body;
    const userId = decryptItem(info.userId, webSecretKey);
    const dateCreated = new Date();
    const expiryDate = addDays(dateCreated, info.userAdvertisementDuration);
    const canCreate = await canUserCreateAdvertisementController(userId);
    const tags = info.tags;

    if (!canCreate) {
      return res.status(500).json({
        errorMessage: 'Failed to update information. Please try again.',
      });
    }

    connection = await connectToDatabase();
    await connection.beginTransaction();

    const insertResult = await insertUserAdvertisement(connection, {
      userPlanId: info.userPlanId,
      dateCreated,
      expiryDate,
      title: info.title,
      description: info.description,
      active: info.active,
      approvedByAdmin: info.approvedByAdmin,
      topAdvertisement: info.topAdvertisement,
      showPhone: info.showPhone,
      showAddress: info.showAddress,
      showEmail: info.showEmail,
      showPicture: info.showPicture,
      showChat: info.showChat,
      numberOfVisits: info.numberOfVisits,
      tags: tags,
    });

    if (!insertResult) {
      await connection.rollback();
      return res.status(500).json({
        errorMessage: 'Failed to update information. Please try again.',
      });
    }

    if (req.files['headerImage']) {
      const image = req.files['headerImage'][0];
      const { buffer } = image;
      const insertImageResult = await insertHeaderImage(
        connection,
        buffer,
        insertResult.insertId
      );

      if (!insertImageResult) {
        await connection.rollback();
        return res.status(500).json({
          errorMessage: 'Failed to update information. Please try again.',
        });
      }
    }
    if (req.files['sliderImages']) {
      for (const file of req.files['sliderImages']) {
        const { buffer } = file;
        const insertSliderImageResult =
          await insertUserAdvertisementSliderImages(connection, {
            userAdvertisementId: insertResult.insertId,
            userAdvertisementImage: buffer,
          });

        if (!insertSliderImageResult) {
          await connection.rollback();
          return res.status(500).json({
            errorMessage: 'Failed to update information. Please try again.',
          });
        }
      }
    }

    if (info.topAdvertisement == '1') {
      const insertPaymentResult = await insertUserTopAdvertisementPayment(
        connection,
        {
          userAdvertisementId: insertResult.insertId,
          paymentConfirmation: info.paymentConfirmation,
          paymentAmount: info.paymentAmount,
          tax: info.tax,
          totalPayment: info.totalPayment,
        }
      );

      if (!insertPaymentResult) {
        await connection.rollback();
        return res.status(500).json({
          errorMessage: 'Failed to update information. Please try again.',
        });
      }
    }

    await connection.commit();
    return res.status(200).json(true);
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }
}

async function insertUserAdvertisement(connection, data) {
  const selectQuery = `INSERT INTO userAdvertisements (userPlanId, dateCreated, expiryDate, title, description, active,approvedByAdmin, topAdvertisement, showPhone, showAddress, showEmail, showPicture, showChat, numberOfVisits,tags) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  const values = [
    data.userPlanId,
    data.dateCreated,
    data.expiryDate,
    data.title,
    data.description,
    data.active,
    data.approvedByAdmin,
    data.topAdvertisement,
    data.showPhone,
    data.showAddress,
    data.showEmail,
    data.showPicture,
    data.showChat,
    data.numberOfVisits,
    data.tags,
  ];
  const [insertResult] = await connection.execute(selectQuery, values);
  return insertResult.affectedRows > 0 || insertResult.insertId
    ? insertResult
    : null;
}
async function updateUserAdvertisement(connection, data) {
  const selectQuery = `update userAdvertisements set  approvedByAdmin=0, title=? , description=? ,  showPhone=? , showAddress=? , showEmail=? , showPicture=? , showChat=? , tags=? where userAdvertisementId=?   `;
  const values = [
    data.title,
    data.description,
    data.showPhone,
    data.showAddress,
    data.showEmail,
    data.showPicture,
    data.showChat,
    data.tags,
    data.userAdvertisementId,
  ];
  const [insertResult] = await connection.execute(selectQuery, values);
  return insertResult.affectedRows > 0 || insertResult.insertId
    ? insertResult
    : null;
}

async function insertHeaderImage(connection, buffer, insertId) {
  const insertImageQuery =
    'update userAdvertisements set headerImage=? where userAdvertisementId =?';
  const [insertImageResult] = await connection.execute(insertImageQuery, [
    buffer,
    insertId,
  ]);
  return insertImageResult.affectedRows > 0 || insertImageResult.insertId
    ? insertImageResult
    : null;
}
async function insertUserAdvertisementSliderImages(connection, data) {
  const selectQuery = `INSERT INTO userAdvertisementImages (userAdvertisementId , userAdvertisementImage) VALUES (?,?)`;
  const values = [data.userAdvertisementId, data.userAdvertisementImage];
  const [insertResult] = await connection.execute(selectQuery, values);
  return insertResult.affectedRows > 0 || insertResult.insertId
    ? insertResult
    : null;
}
async function deleteUserAdvertisementSliderImages(connection, data) {
  const selectQuery = `DELETE FROM userAdvertisementImages  where userAdvertisementId = ?`;
  const values = [data.userAdvertisementId];
  const [insertResult] = await connection.execute(selectQuery, values);
  return insertResult.affectedRows > 0 || insertResult.insertId
    ? insertResult
    : null;
}
async function updateUserAdvertisementHeaderImages(connection, data) {
  const selectQuery = `Update  userAdvertisements set headerImage= NULL where userAdvertisementId = ?`;
  const values = [data.userAdvertisementId];
  const [insertResult] = await connection.execute(selectQuery, values);
  return insertResult.affectedRows > 0 || insertResult.insertId
    ? insertResult
    : null;
}
async function insertUserTopAdvertisementPayment(connection, data) {
  const selectQuery = `INSERT INTO userTopAdvertisementPayments (userAdvertisementId , paymentConfirmation,paymentAmount,tax,totalPayment) VALUES (?,?,?,?,?)`;

  const values = [
    data.userAdvertisementId,
    data.paymentConfirmation,
    data.paymentAmount,
    data.tax,
    data.totalPayment,
  ];

  const [insertResult] = await connection.execute(selectQuery, values);
  return insertResult.affectedRows > 0 || insertResult.insertId
    ? insertResult
    : null;
}

async function getUserAdvertisementsController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const selectQuery = `SELECT userAdvertisements.*, userAdvertisementImages.userAdvertisementImage
FROM userAdvertisements
JOIN userPlans ON userAdvertisements.userPlanId = userPlans.userPlanId
LEFT JOIN userAdvertisementImages ON userAdvertisements.userAdvertisementId = userAdvertisementImages.userAdvertisementId
WHERE userPlans.userId= ? and   userAdvertisements.deleted = 0 ORDER BY userAdvertisements.dateCreated DESC`;
    const selectResult = await executeQuery(selectQuery, [userId]);

    return res.status(200).json(selectResult);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}

async function updateUserAdvertisementActivateStatusController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const userAdvertisementId = req.body.userAdvertisementId;
    const active = req.body.active ? '1' : '0';
    const updateQuery = `UPDATE  userAdvertisements JOIN userPlans ON userAdvertisements.userPlanId = userPlans.userPlanId  SET userAdvertisements.active = ?  WHERE  userPlans.userId= ? and userAdvertisements.userAdvertisementId = ?`;

    const result = await executeQuery(updateQuery, [
      active,
      userId,
      userAdvertisementId,
    ]);

    if (result.affectedRows > 0 || result.insertId) {
      return res.status(200).json();
    } else {
      return res.status(500).json({
        errorMessage: 'Failed to update information. Please try again.',
      });
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
  }
}
async function updateUserAdvertisementDeleteStatusController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const userAdvertisementId = req.body.userAdvertisementId;
    const deleted = req.body.deleted ? '1' : '0';
    const updateQuery = `UPDATE  userAdvertisements JOIN userPlans ON userAdvertisements.userPlanId = userPlans.userPlanId  SET userAdvertisements.deleted = ?  WHERE  userPlans.userId= ? and userAdvertisements.userAdvertisementId = ?`;

    const result = await executeQuery(updateQuery, [
      deleted,
      userId,
      userAdvertisementId,
    ]);

    if (result.affectedRows > 0 || result.insertId) {
      return res.status(200).json();
    } else {
      return res.status(500).json({
        errorMessage: 'Failed to update information. Please try again.',
      });
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
  }
}
async function addFavoriteAdvertisementsController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);

    const values = [userId, req.body.userAdvertisementId];
    const selectQuery = `select * from userFavoriteAdvertisements  where userId=? and userAdvertisementId=?`;
    const selectResult = await executeQuery(selectQuery, values);

    let result = '';
    if (selectResult?.length === 0) {
      const insertQuery = `INSERT INTO userFavoriteAdvertisements (userId,userAdvertisementId) VALUES (?,?)`;
      const insertResult = await executeQuery(insertQuery, values);
      result = 'inserted';
    } else {
      const deleteQuery = `delete from userFavoriteAdvertisements where userId=? and userAdvertisementId=? `;
      const deleteResult = await executeQuery(deleteQuery, values);
      result = 'deleted';
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
  }
}
async function deleteFavoriteAdvertisementsController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const values = [userId, req.body.userAdvertisementId];
    const selectQuery = `delete from userFavoriteAdvertisements where userId=? and userAdvertisementId=? `;
    const selectResult = await executeQuery(selectQuery, values);
    return res.status(200).json(selectResult);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to delete the information. Please try again.',
    });
  }
}
async function addUserOverallRatingController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    let ratedBy = decryptItem(req.body.ratedBy, webSecretKey);
    const rate = req.body.rate;
    const rateType = req.body.rateType;
    const values = [new Date(), userId, ratedBy, rate];
    if (userId === ratedBy)
      return res.status(500).json({
        errorMessage:
          'Failed to update information. You can not rate yourself.',
      });

    const selectQuery =
      'Select * FROM userRatings WHERE userId = ? and ratedBy = ?;';
    const selectResult = await executeQuery(selectQuery, [userId, ratedBy]);
    if (selectResult?.length > 0) {
      const updateValues = [rate, userId, ratedBy];
      let updateQuery = '';
      if (rateType === 'average_overall_rating')
        updateQuery = `update userRatings set overallCustomerSatisfaction=? WHERE userId = ? and ratedBy = ?; `;
      else if (rateType === 'average_cleanliness')
        updateQuery = `update userRatings set cleanliness=? WHERE userId = ? and ratedBy = ?; `;
      else if (rateType === 'average_flexibility')
        updateQuery = `update userRatings set flexibility=? WHERE userId = ? and ratedBy = ?; `;
      else if (rateType === 'average_communicationSkills')
        updateQuery = `update userRatings set communicationSkills=? WHERE userId = ? and ratedBy = ?; `;
      else if (rateType === 'average_costManagement')
        updateQuery = `update userRatings set costManagement=? WHERE userId = ? and ratedBy = ?; `;
      else if (rateType === 'average_materialsAndEquipment')
        updateQuery = `update userRatings set materialsAndEquipment=? WHERE userId = ? and ratedBy = ?; `;
      else if (rateType === 'average_performance')
        updateQuery = `update userRatings set performance=? WHERE userId = ? and ratedBy = ?; `;
      else if (rateType === 'average_professionalism')
        updateQuery = `update userRatings set professionalism=? WHERE userId = ? and ratedBy = ?; `;
      else if (rateType === 'average_qualityOfWork')
        updateQuery = `update userRatings set qualityOfWork=? WHERE userId = ? and ratedBy = ?; `;
      else if (rateType === 'average_safety')
        updateQuery = `update userRatings set safety=? WHERE userId = ? and ratedBy = ?; `;
      else if (rateType === 'average_timeliness')
        updateQuery = `update userRatings set timeliness=? WHERE userId = ? and ratedBy = ?; `;

      const updateResult = await executeQuery(updateQuery, updateValues);
      if (updateResult.affectedRows > 0) {
        return res.status(200).json(rate);
      } else
        return res.status(500).json({
          errorMessage: 'Failed to update information. Please try again.',
        });

      //update
    } else {
      let insertQuery = '';
      if (rateType === 'average_overall_rating')
        insertQuery = `INSERT INTO userRatings (dateCreated, userId,ratedBy,overallCustomerSatisfaction) VALUES (?,?,?,?)`;
      else if (rateType === 'average_cleanliness')
        insertQuery = `INSERT INTO userRatings (dateCreated,userId,ratedBy,cleanliness) VALUES (?,?,?,?)`;
      else if (rateType === 'average_flexibility')
        insertQuery = `INSERT INTO userRatings (dateCreated,userId,ratedBy,flexibility) VALUES (?,?,?,?)`;
      else if (rateType === 'average_communicationSkills')
        insertQuery = `INSERT INTO userRatings (dateCreated,userId,ratedBy,communicationSkills) VALUES (?,?,?,?)`;
      else if (rateType === 'average_costManagement')
        insertQuery = `INSERT INTO userRatings (dateCreated,userId,ratedBy,costManagement) VALUES (?,?,?,?)`;
      else if (rateType === 'average_materialsAndEquipment')
        insertQuery = `INSERT INTO userRatings (dateCreated,userId,ratedBy,materialsAndEquipment) VALUES (?,?,?,?)`;
      else if (rateType === 'average_performance')
        insertQuery = `INSERT INTO userRatings (dateCreated,userId,ratedBy,performance) VALUES (?,?,?,?)`;
      else if (rateType === 'average_professionalism')
        insertQuery = `INSERT INTO userRatings (dateCreated,userId,ratedBy,professionalism) VALUES (?,?,?,?)`;
      else if (rateType === 'average_qualityOfWork')
        insertQuery = `INSERT INTO userRatings (dateCreated,userId,ratedBy,qualityOfWork) VALUES (?,?,?,?)`;
      else if (rateType === 'average_safety')
        insertQuery = `INSERT INTO userRatings (dateCreated,userId,ratedBy,safety) VALUES (?,?,?,?)`;
      else if (rateType === 'average_timeliness')
        insertQuery = `INSERT INTO userRatings (dateCreated,userId,ratedBy,timeliness) VALUES (?,?,?,?)`;

      const insertResult = await executeQuery(insertQuery, values);
      if (insertResult.insertId || insertResult.affectedRows > 0) {
        // get user rating
        const selectRatingQuery = `SELECT AVG(overallCustomerSatisfaction) AS average_rating FROM userRatings WHERE userId = ?;`;
        const selectRatingResult = await executeQuery(selectRatingQuery, [
          userId,
        ]);
        return res.status(200).json(selectRatingResult[0].average_rating);
      } else return res.status(200).json(rate);
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
  }
}
async function isUserFavoriteAdController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const values = [userId, req.body.userAdvertisementId];
    const selectQuery = `select * from userFavoriteAdvertisements where userId=? and userAdvertisementId=? `;
    const selectResult = await executeQuery(selectQuery, values);
    const result = selectResult?.length > 0 ? true : false;
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
async function postAdvertisementMessageController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    let messageBy = decryptItem(req.body.messageBy, webSecretKey);
    const message = req.body.message;
    const userAdvertisementId = req.body.userAdvertisementId;

    if (userId === messageBy)
      res.status(500).json({
        errorMessage: 'You can not message yourself. Please try again.',
      });

    const values = [
      userId,
      messageBy,
      userAdvertisementId,
      message,
      new Date(),
    ];
    const insertQuery = `INSERT INTO userAdvertisementsMessages (userId,fromUserId,advertisementId,message,dateCreated) VALUES (?,?,?,?,?)`;
    const insertResult = await executeQuery(insertQuery, values);
    if (insertResult.insertId || insertResult.affectedRows > 0) {
      return res.status(200).json();
    } else
      res.status(500).json({
        errorMessage: 'Failed to update information. Please try again.',
      });
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
  }
}

async function postUserFeedbackController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    let feedbackBy = decryptItem(req.body.feedbackBy, webSecretKey);
    const feedback = req.body.feedback;

    if (userId === feedbackBy)
      res.status(500).json({
        errorMessage: 'You can not provide feedback to yourself.',
      });

    const selectQuery =
      'Select * FROM userRatings WHERE userId = ? and ratedBy = ?;';
    const selectResult = await executeQuery(selectQuery, [userId, feedbackBy]);
    if (selectResult?.length > 0) {
      //update

      const updateQuery = `update userRatings set dateCreated=?, feedback=? WHERE userId = ? and ratedBy = ?; `;
      const updateResult = await executeQuery(updateQuery, [
        new Date(),
        feedback,
        userId,
        feedbackBy,
      ]);

      if (updateResult.affectedRows > 0) {
        return res.status(200).json();
      } else
        return res.status(500).json({
          errorMessage: 'Failed to update information. Please try again.',
        });

      //update
    } else {
      const insertQuery = `INSERT INTO userRatings (dateCreated,userId,ratedBy,feedback) VALUES (?,?,?,?)`;

      const insertResult = await executeQuery(insertQuery, [
        new Date(),
        userId,
        feedbackBy,
        feedback,
      ]);
      if (insertResult.affectedRows === 0) {
        return res.status(500).json({
          errorMessage: 'Failed to update information. Please try again.',
        });
      } else return res.status(200).json();
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
  }
}
async function getAdvertisementMessageController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const values = [userId];
    const selectQuery = `select * from userAdvertisementsMessages where deleted=0 and userId=?   ORDER BY dateCreated desc `;
    const selectResult = await executeQuery(selectQuery, values);

    return res.status(200).json(selectResult);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
async function deleteAdvertisementMessageController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    let values = [userId, req.body.messageId];
    const selectQuery = `update userAdvertisementsMessages set deleted=1 where userId=? and messageId=?`;
    const selectResult = await executeQuery(selectQuery, values);
    let fromUserId = decryptItem(req.body.fromUserId, webSecretKey);
    values = [userId, fromUserId, fromUserId, userId, req.body.advertisementId];
    const selectCountQuery = `select count(*) as total, SUM(CASE WHEN deleted = 1 THEN 1 ELSE 0 END) AS deletedTotal from userAdvertisementsMessages where ((userId=? and fromUserId=?) or (userId=? and fromUserId=?)) and
    advertisementId =? `;
    const selectCountResult = await executeQuery(selectCountQuery, values);

    if (selectCountResult[0]?.total == selectCountResult[0]?.deletedTotal) {
      const deleteQuery = `delete from userAdvertisementsMessages where ((userId=? and fromUserId=?) or (userId=? and fromUserId=?)) and
      advertisementId =? and deleted=1`;
      await executeQuery(deleteQuery, values);
    }
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to delete the information. Please try again.',
    });
  }
}
async function getFavoriteAdvertisementsController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const values = [userId];
    const selectQuery = `SELECT userAdvertisements.*
                          FROM userAdvertisements
                          JOIN userFavoriteAdvertisements ON userAdvertisements.userAdvertisementId  = userFavoriteAdvertisements.userAdvertisementId
                          WHERE  userFavoriteAdvertisements.userId=? ORDER BY userFavoriteAdvertisements.dateCreated DESC;`;
    const selectResult = await executeQuery(selectQuery, values);

    return res.status(200).json(selectResult);
  } catch (error) {
    return res.status(500).json({
      errorMessage:
        'Error adding favorite ad. This is already your favorite ad',
    });
  }
}
async function deleteFavoriteAdvertisementController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const values = [userId, req.body.userAdvertisementId];
    const selectQuery = `delete from userFavoriteAdvertisements where userId=? and userAdvertisementId =? `;
    const selectResult = await executeQuery(selectQuery, values);
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to delete the information. Please try again.',
    });
  }
}
async function getAdvertisementMessageThreadsController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    let fromUserId = decryptItem(req.body.fromUserId, webSecretKey);
    const values = [
      userId,
      fromUserId,
      fromUserId,
      userId,
      req.body.userAdvertisementId,
    ];

    const selectQuery = `select * from userAdvertisementsMessages where ((userId=? and fromUserId=?) or (userId=? and fromUserId=?)) and advertisementId =? and deleted=0 ORDER BY dateCreated asc `;
    const selectResult = await executeQuery(selectQuery, values);

    return res.status(200).json(selectResult);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
async function getMessageInfoController(req, res) {
  try {
    const values = [req.body.messageId];

    const selectQuery = `select * from userAdvertisementsMessages where  messageId=? `;
    const selectResult = await executeQuery(selectQuery, values);
    if (selectResult?.length > 0) return res.status(200).json(selectResult[0]);
    else
      return res.status(500).json({
        errorMessage: 'Failed to retrieve information. Please try again later.',
      });
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
async function updateUserMessageViewController(req, res) {
  try {
    const messageId = req.body.messageId;
    const updateQuery = `UPDATE  userAdvertisementsMessages set viewed=1 WHERE messageId = ?`;
    const result = await executeQuery(updateQuery, [messageId]);

    if (result.affectedRows > 0 || result.insertId) {
      return res.status(200).json(messageId);
    } else {
      return res.status(500).json({
        errorMessage: 'Failed to update information. Please try again.',
      });
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
  }
}
async function deleteAllUserMessagesController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const values = [userId];
    const selectQuery = `delete from userAdvertisementsMessages where userId=?`;
    const selectResult = await executeQuery(selectQuery, values);
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to delete the information. Please try again.',
    });
  }
}
async function deleteUserProfilePhotoController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const values = [userId];
    const selectQuery = `update users set profileImage= null where userId=?`;
    const selectResult = await executeQuery(selectQuery, values);
    if (selectResult?.affectedRows > 0) return res.status(200).json(true);
    else
      return res.status(500).json({
        errorMessage: 'Failed to delete the information. Please try again.',
      });
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to delete the information. Please try again.',
    });
  }
}

async function getUserNumberOfNewMessages(connection, data) {
  const selectQuery = `select count(*) as nbr_messages  from userAdvertisementsMessages where userId=? and viewed=0`;
  const values = [data.userId];
  const [result] = await connection.execute(selectQuery, values);
  return result?.length > 0 ? result[0].nbr_messages : 0;
}
async function getUserNumberOfNewMessagesController(req, res) {
  const connection = await connectToDatabase();
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);

    const userMessagesResult = await getUserNumberOfNewMessages(connection, {
      userId: userId,
    });
    return res.status(200).json(userMessagesResult);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  } finally {
    await connection.end();
  }
}

async function canUserEditAdvertisementController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    let advertisementId = req.body.advertisementId;
    const canEdit = await canUserEditAdvertisement(userId, advertisementId);
    return res.status(200).json(canEdit);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}

async function editAdvertisementController(req, res) {
  let connection;
  try {
    const info = req.body;

    const userId = decryptItem(info.userId, webSecretKey);

    const userAdvertisementId = req.body.userAdvertisementId;
    const tags = req.body.tags;

    const canEdit = await canUserEditAdvertisement(userId, userAdvertisementId);

    if (!canEdit) {
      return res.status(500).json({
        errorMessage: 'Failed to update information. Please try again.',
      });
    }

    connection = await connectToDatabase();
    await connection.beginTransaction();

    const insertResult = await updateUserAdvertisement(connection, {
      userAdvertisementId: userAdvertisementId,
      title: info.title,
      description: info.description,
      showPhone: info.showPhone,
      showAddress: info.showAddress,
      showEmail: info.showEmail,
      showPicture: info.showPicture,
      showChat: info.showChat,
      tags: tags,
    });

    if (!insertResult) {
      await connection.rollback();
      return res.status(500).json({
        errorMessage: 'Failed to update information. Please try again.',
      });
    }

    if (req.files['headerImage']) {
      const image = req.files['headerImage'][0];
      const { buffer } = image;
      const insertImageResult = await insertHeaderImage(
        connection,
        buffer,
        userAdvertisementId
      );

      if (!insertImageResult) {
        await connection.rollback();
        return res.status(500).json({
          errorMessage: 'Failed to update information. Please try again.',
        });
      }
    } else {
      const updateImageResult = await updateUserAdvertisementHeaderImages(
        connection,
        {
          userAdvertisementId: userAdvertisementId,
        }
      );
    }
    await deleteUserAdvertisementSliderImages(connection, {
      userAdvertisementId: userAdvertisementId,
    });
    if (req.files['sliderImages']) {
      for (const file of req.files['sliderImages']) {
        const { buffer } = file;
        const insertSliderImageResult =
          await insertUserAdvertisementSliderImages(connection, {
            userAdvertisementId: userAdvertisementId,
            userAdvertisementImage: buffer,
          });

        if (!insertSliderImageResult) {
          await connection.rollback();
          return res.status(500).json({
            errorMessage: 'Failed to update information. Please try again.',
          });
        }
      }
    }

    await connection.commit();
    return res.status(200).json(true);
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }
}
async function getAdvertisementEditInfoController(req, res) {
  try {
    const userId = decryptItem(req.body.userId, webSecretKey);
    const advertisementId = req.body.advertisementId;

    const selectAdQuery = `SELECT userAdvertisements.*, userAdvertisementImages.userAdvertisementImage
                          FROM userAdvertisements
                          JOIN userPlans ON userAdvertisements.userPlanId = userPlans.userPlanId
                          LEFT JOIN userAdvertisementImages ON userAdvertisements.userAdvertisementId = userAdvertisementImages.userAdvertisementId
                          WHERE userAdvertisements.userAdvertisementId=?  and userPlans.userId = ?   `;

    const selectResult = await executeQuery(selectAdQuery, [
      advertisementId,
      userId,
    ]);

    return res.status(200).json(selectResult);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
  }
}
async function repostAdvertisementController(req, res) {
  let connection;
  try {
    const userId = decryptItem(req.body.userId, webSecretKey);
    const { userAdvertisementId } = req.body;
    const activePlanId = req.body.activePlanId;
    const dateCreated = new Date();
    const expiryDate = addDays(dateCreated, req.body.userAdvertisementDuration);
    const values = [activePlanId, dateCreated, expiryDate, userAdvertisementId];
    const canCreate = await canUserCreateAdvertisementController(userId);
    if (!canCreate) {
      return res.status(500).json({
        errorMessage: 'Failed to update information. Please try again.',
      });
    }
    connection = await connectToDatabase();
    await connection.beginTransaction();
    const insertAdQuery = `
    INSERT INTO userAdvertisements (
      userPlanId, title, description, active, deleted, approvedByAdmin, headerImage, topAdvertisement, showPhone, showAddress, showEmail,
      showPicture, showChat, numberOfVisits, dateCreated, expiryDate)
    SELECT ?, title, description, active, deleted, approvedByAdmin, headerImage, topAdvertisement, showPhone, showAddress, showEmail, showPicture, showChat, numberOfVisits, ?, ?
    FROM userAdvertisements WHERE
      userAdvertisementId = ?;
    `;
    const [result] = await connection.execute(insertAdQuery, values);

    if (result.affectedRows === 0 || !result.insertId) {
      await connection.rollback();
      return res.status(500).json({
        errorMessage: 'Failed to insert information. Please try again.',
      });
    }
    const newAdvertisementId = result.insertId;
    const insertImageQuery = `
    INSERT INTO userAdvertisementImages (userAdvertisementId, userAdvertisementImage)
    SELECT ?, userAdvertisementImage
    FROM userAdvertisementImages WHERE
      userAdvertisementId = ?;
    `;
    await connection.execute(insertImageQuery, [
      newAdvertisementId,
      userAdvertisementId,
    ]);
    await connection.commit();
    return res.status(200).json();
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({
      errorMessage: 'Failed to delete the information. Please try again.',
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }
}
async function promoteTopAdvertisementController(req, res) {
  let connection;
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const userAdvertisementId = req.body.userAdvertisementId;
    const paymentInfo = req.body.paymentInfo;
    connection = await connectToDatabase();
    await connection.beginTransaction();
    const updateQuery = `UPDATE  userAdvertisements   SET topAdvertisement = 1  WHERE userAdvertisementId = ?`;
    const [updateResult] = await connection.execute(updateQuery, [
      userAdvertisementId,
    ]);

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(500).json({
        errorMessage: 'Failed to insert information. Please try again.',
      });
    }

    const insertPaymentResult = await insertUserTopAdvertisementPayment(
      connection,
      {
        userAdvertisementId: userAdvertisementId,
        paymentConfirmation: paymentInfo.paymentConfirmation,
        paymentAmount: paymentInfo.paymentAmount,
        tax: paymentInfo.tax,
        totalPayment: paymentInfo.totalPayment,
      }
    );

    if (!insertPaymentResult) {
      await connection.rollback();
      return res.status(500).json({
        errorMessage: 'Failed to update information. Please try again.',
      });
    }

    await connection.commit();
    return res.status(200).json();
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again.',
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }
}
async function submitNewSupportRequestController(req, res) {
  try {
    const userId = decryptItem(req.body.data.userId, webSecretKey);
    const subject = req.body.data.subject;
    const description = req.body.data.description;
    const requestType = req.body.data.requestType;
    const insertQuery = `INSERT INTO userSupportRequests ( userId, subject, type, description) values(?,?,?,?)`;

    const insertResult = await executeQuery(insertQuery, [
      userId,
      subject,
      requestType,
      description,
    ]);

    if (insertResult.affectedRows === 0) {
      return res.status(500).json({
        errorMessage: 'Failed to insert information. Please try again.',
      });
    }
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to insert information. Please try again later.',
    });
  }
}
async function listUserRequestSupportMessagesController(req, res) {
  try {
    const userId = decryptItem(req.body.userId, webSecretKey);
    const selectQuery = `select messageId, dateCreated, userId, subject, type, description, adminResponse, respondedByAdmin, viewedByUser from userSupportRequests where  userId=? ORDER BY dateCreated DESC; `;
    const selectResult = await executeQuery(selectQuery, [userId]);

    return res.status(200).json(selectResult);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to insert information. Please try again later.',
    });
  }
}
async function deleteRequestSupportMessagesController(req, res) {
  try {
    const userId = decryptItem(req.body.userId, webSecretKey);
    const messageId = req.body.messageId;
    const selectQuery = `delete from userSupportRequests where  userId=? and messageId =? `;

    const selectResult = await executeQuery(selectQuery, [userId, messageId]);
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to insert information. Please try again later.',
    });
  }
}
module.exports = {
  deleteRequestSupportMessagesController,
  deleteUserProfilePhotoController,
  promoteTopAdvertisementController,
  repostAdvertisementController,
  getAdvertisementEditInfoController,
  getUserNumberOfNewMessagesController,
  editAdvertisementController,
  deleteAllUserMessagesController,
  updateUserMessageViewController,
  getMessageInfoController,
  getAdvertisementMessageThreadsController,
  getFavoriteAdvertisementsController,
  deleteFavoriteAdvertisementController,
  deleteAdvertisementMessageController,
  getAdvertisementMessageController,
  postAdvertisementMessageController,
  isUserFavoriteAdController,
  deleteFavoriteAdvertisementsController,
  addFavoriteAdvertisementsController,
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
  getApplicationSettingsController,
  getPreNewAdInfoController,
  saveUserRegularAdController,
  updateUserAdvertisementDeleteStatusController,
  getUserAdvertisementsController,
  updateUserAdvertisementActivateStatusController,
  getAdvertisementDetailsController,
  addUserOverallRatingController,
  refreshTokenController,
  canUserEditAdvertisementController,
  getUserAdvertisementDetailsController,
  getUserRatingsController,
  getUserRatingsDetailsController,
  postUserFeedbackController,
  getAllUserRatingsDetailsBasedOnUserId,
  submitNewSupportRequestController,
  listUserRequestSupportMessagesController,
};

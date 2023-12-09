const {
  decryptItem,
  executeQuery,
  encryptItem,
  decryptCredentials,
  verifyToken,
  addDays,
} = require('./utilityService'); // Import necessary helper functions
const connectToDatabase = require('../db');
const { sendTemporaryPasswordEmail } = require('../../nodemailer');
const { getUserRatings } = require('./common-queries');
import { AdminSettingsInterface } from '../../../../libs/common/src/models/admin-settings';
import { EnvironmentInfo } from '../../../../libs/common/src/models/common';
const env = new EnvironmentInfo();
const webSecretKey = env.webSecretKey();
const dbSecretKey = env.dbSecretKey();

async function listAdminSettingsController(req, res) {
  try {
    const selectQuery = `SELECT * FROM settings`;
    const selectResult = await executeQuery(selectQuery, []);
    const setting = {
      freeTiralPeriod: selectResult[0].freeTiralPeriod,
      monthlyPrice: selectResult[0].monthlyPrice,
      monthlyDiscount: selectResult[0].monthlyDiscount,
      quarterlyDiscount: selectResult[0].quarterlyDiscount,
      semiAnualDiscount: selectResult[0].semiAnualDiscount,
      yearlyDiscount: selectResult[0].yearlyDiscount,
      topAdvertisementPrice: selectResult[0].topAdvertisementPrice,
      maxAdvertisementSliderImage: selectResult[0].maxAdvertisementSliderImage,
      tax: selectResult[0].tax,
      userAdvertisementDuration: selectResult[0].userAdvertisementDuration,
      passwordResetDurationGeneralUsers:
        selectResult[0].passwordResetDurationGeneralUsers,
      passwordResetDurationAdminUsers:
        selectResult[0].passwordResetDurationAdminUsers,
    };
    return res.status(200).json(setting);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
async function updateAdminSettingsController(req, res) {
  try {
    const info = req.body.setting;
    const setting = {
      freeTiralPeriod: info.freeTiralPeriod,
      monthlyPrice: info.monthlyPrice,
      monthlyDiscount: info.monthlyDiscount,
      quarterlyDiscount: info.quarterlyDiscount,
      yearlyDiscount: info.yearlyDiscount,
      semiAnualDiscount: info.semiAnualDiscount,
      topAdvertisementPrice: info.topAdvertisementPrice,
      maxAdvertisementSliderImage: info.maxAdvertisementSliderImage,
      tax: info.tax,
      userAdvertisementDuration: info.userAdvertisementDuration,
      passwordResetDurationGeneralUsers: info.passwordResetDurationGeneralUsers,
      passwordResetDurationAdminUsers: info.passwordResetDurationAdminUsers,
    };
    const values = [
      setting.tax,
      setting.freeTiralPeriod,
      setting.monthlyPrice,
      setting.monthlyDiscount,
      setting.quarterlyDiscount,
      setting.semiAnualDiscount,
      setting.yearlyDiscount,
      setting.topAdvertisementPrice,
      setting.maxAdvertisementSliderImage,
      setting.userAdvertisementDuration,
      setting.passwordResetDurationGeneralUsers,
      setting.passwordResetDurationAdminUsers,
    ];
    const selectQuery = `SELECT * FROM settings`;
    const selectResult = await executeQuery(selectQuery, []);

    if (selectResult.length > 0) {
      // There are results
      const query = `UPDATE settings SET tax =? , freeTiralPeriod = ?, monthlyPrice = ?,monthlyDiscount = ?, quarterlyDiscount = ?,semiAnualDiscount=?, yearlyDiscount=?, topAdvertisementPrice=?,
       maxAdvertisementSliderImage=?, userAdvertisementDuration=?,passwordResetDurationGeneralUsers=?, passwordResetDurationAdminUsers=?`;
      const result = await executeQuery(query, values);
      if (result.affectedRows > 0 || result.insertId) {
        return res.status(200).json(setting);
      } else {
        return res.status(500).json({
          errorMessage: 'Failed to update information. Please try again. ',
        });
      }
    } else {
      // No results
      const query = `INSERT INTO settings (freeTiralPeriod, monthlyPrice,quarterlyDiscount, semiAnualDiscount=?,yearlyDiscount,topAdvertisementPrice,maxAdvertisementSliderImage,userAdvertisementDuration,passwordResetDurationGeneralUsers, passwordResetDurationAdminUsers) VALUES ( ?,?,?,?,?, ?, ?,?,?)`;
      const result = await executeQuery(query, values);
      if (result.affectedRows > 0 || result.insertId) {
        return res.status(200).json(setting);
      } else {
        return res.status(500).json({
          errorMessage:
            'Failed to retrieve information. Please try again later. ',
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later. .',
    });
  }
}
async function createNewPlanController(req, res) {
  try {
    const createBidsIncluded = req.body.plan.createBidsIncluded ? 1 : 0;
    const createRfpIncluded = req.body.plan.createRfpIncluded ? 1 : 0;
    const onlineSupportIncluded = req.body.plan.onlineSupportIncluded ? 1 : 0;
    const customProfileIncluded = req.body.plan.customProfileIncluded ? 1 : 0;
    const planActive = req.body.plan.active ? 1 : 0;
    const values = [
      req.body.plan.planName,
      req.body.plan.planType,
      req.body.plan.originalPrice,
      req.body.plan.discountPercentage,
      req.body.plan.priceAfterDiscount,
      new Date(req.body.plan.startDate),
      new Date(req.body.plan.expiryDate),
      req.body.plan.numberOfAdvertisements,
      customProfileIncluded,
      req.body.plan.planDescription,
      new Date(req.body.plan.dateCreated),
      req.body.plan.duration,
      createRfpIncluded,
      planActive,
      createBidsIncluded,
      onlineSupportIncluded,
    ];

    // No results
    const query = `INSERT INTO plans ( planName,planType,originalPrice,discountPercentage,priceAfterDiscount,startDate,expiryDate,numberOfAdvertisements,customProfileIncluded,planDescription,dateCreated,duration,createRfpIncluded,active,createBidsIncluded,onlineSupportIncluded) VALUES (?, ?,?,?,?, ?, ?,?,?, ?, ?,?, ?, ?,?,?)`;

    const result = await executeQuery(query, values);
    if (result.affectedRows > 0 || result.insertId) {
      const plan = {
        planName: req.body.plan.planName,
        planType: req.body.plan.planType,
        originalPrice: req.body.plan.originalPrice,
        discountPercentage: req.body.plan.discountPercentage,
        priceAfterDiscount: req.body.plan.priceAfterDiscount,
        startDate: req.body.plan.startDate,
        expiryDate: req.body.plan.expiryDate,
        numberOfAdvertisements: req.body.plan.numberOfAdvertisements,
        customProfileIncluded: req.body.plan.customProfileIncluded,
        planDescription: req.body.plan.planDescription,
        dateCreated: req.body.plan.dateCreated,
        duration: req.body.plan.duration,
        createRfpIncluded: req.body.plan.createRfpIncluded,
        active: req.body.plan.active,
        createBidsIncluded: req.body.plan.createBidsIncluded,
        onlineSupportIncluded: req.body.plan.onlineSupportIncluded,
      };
      return res.status(200).json(plan);
    } else {
      return res
        .status(500)
        .json({ errorMessage: 'Error creating plan. Please try again.' });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: 'Error creating plan. Please try again.' });
  }
}
async function listPlansController(req, res) {
  try {
    const selectQuery = `SELECT * FROM plans`;
    const selectResult = await executeQuery(selectQuery, []);
    return res.status(200).json(selectResult);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
async function updatePlanStatusController(req, res) {
  try {
    const planId = req.body.planId;
    const flag = req.body.flag;

    // There are results
    const query = `UPDATE plans SET active = ?  where planId = ?`;
    const result = await executeQuery(query, [flag, planId]);
    if (result.affectedRows > 0 || result.insertId) {
      return res.status(200).json();
    } else {
      return res.status(500).json({
        errorMessage: 'Failed to update information. Please try again.',
      });
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again. .',
    });
  }
}
async function deletePlanController(req, res) {
  try {
    const planId = req.body.planId;

    // There are results
    const query = `UPDATE plans SET deleted = 1  where planId = ?`;
    const result = await executeQuery(query, [planId]);
    if (result.affectedRows > 0 || result.insertId) {
      return res.status(200).json();
    } else {
      return res.status(500).json({
        errorMessage: 'Failed to delete the information. Please try again',
      });
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to delete the information. Please try again.',
    });
  }
}
async function dashboardController(req, res) {
  try {
    const selectQuery = `SELECT COUNT(*) AS total_users,
     SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS active_users,
     SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END) AS inactive_users,
     SUM(CASE WHEN deleted = 1 THEN 1 ELSE 0 END) AS deleted_users,
     SUM(CASE WHEN loggedIn = 1 THEN 1 ELSE 0 END) AS loggedIn_users

     FROM users`;
    const selectResult = await executeQuery(selectQuery, []);

    return res.status(200).json(selectResult[0]);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
async function getPlanInfoController(req, res) {
  try {
    const selectQuery = `SELECT *
     FROM plans where planId = ?`;
    const selectResult = await executeQuery(selectQuery, [req.body.planId]);
    if (selectResult?.length > 0) return res.status(200).json(selectResult[0]);
    else return res.status(500).json({ errorMessage: 'Plan does not exist.' });
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
async function updatePlanController(req, res) {
  try {
    const createBidsIncluded = req.body.plan.createBidsIncluded ? 1 : 0;
    const createRfpIncluded = req.body.plan.createRfpIncluded ? 1 : 0;
    const onlineSupportIncluded = req.body.plan.onlineSupportIncluded ? 1 : 0;
    const customProfileIncluded = req.body.plan.customProfileIncluded ? 1 : 0;
    const values = [
      req.body.plan.planName,
      new Date(req.body.plan.startDate),
      new Date(req.body.plan.expiryDate),
      req.body.plan.numberOfAdvertisements,
      customProfileIncluded,
      req.body.plan.planDescription,
      createRfpIncluded,
      createBidsIncluded,
      onlineSupportIncluded,
      req.body.planId,
    ];

    // No results
    const query = `update plans set planName=?,startDate=?,expiryDate=?,numberOfAdvertisements=?,customProfileIncluded=?,planDescription=?,createRfpIncluded=?,createBidsIncluded=?,onlineSupportIncluded=? where planId = ? `;

    const result = await executeQuery(query, values);
    if (result.affectedRows > 0 || result.insertId) {
      const plan = {
        planName: req.body.plan.planName,
        planType: req.body.plan.planType,
        originalPrice: req.body.plan.originalPrice,
        discountPercentage: req.body.plan.discountPercentage,
        priceAfterDiscount: req.body.plan.priceAfterDiscount,
        startDate: req.body.plan.startDate,
        expiryDate: req.body.plan.expiryDate,
        numberOfAdvertisements: req.body.plan.numberOfAdvertisements,
        customProfileIncluded: req.body.plan.customProfileIncluded,
        planDescription: req.body.plan.planDescription,
        dateCreated: req.body.plan.dateCreated,
        duration: req.body.plan.duration,
        createRfpIncluded: req.body.plan.createRfpIncluded,
        active: req.body.plan.active,
        createBidsIncluded: req.body.plan.createBidsIncluded,
        onlineSupportIncluded: req.body.plan.onlineSupportIncluded,
      };
      return res.status(200).json(plan);
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
async function getAllUsersAdvertisementsPendingApproval(req, res) {
  try {
    const selectQuery = `SELECT  * FROM userAdvertisements WHERE   approvedByAdmin = 0 and active=1 and deleted=0 and  userAdvertisements.expiryDate  > CURDATE()  ORDER BY userAdvertisements.dateCreated DESC`;
    const selectResult = await executeQuery(selectQuery, []);
    return res.status(200).json(selectResult);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}

async function approveAdvertisement(req, res) {
  try {
    const userAdvertisementId = req.body.userAdvertisementId;

    const selectQuery = `UPDATE userAdvertisements set   approvedByAdmin = 1,  rejected=0 , rejectedReason='' where userAdvertisementId =?`;
    const selectResult = await executeQuery(selectQuery, [userAdvertisementId]);
    return res.status(200).json(selectResult);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
async function rejectAdvertisement(req, res) {
  try {
    const userAdvertisementId = req.body.userAdvertisementId;
    const reason = req.body.rejectReason;

    const selectQuery = `UPDATE userAdvertisements set   approvedByAdmin = 0,  rejected=1 , rejectedReason=? where userAdvertisementId =?`;
    const selectResult = await executeQuery(selectQuery, [
      reason,
      userAdvertisementId,
    ]);
    return res.status(200).json(selectResult);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
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

    // get Ad details

    const selectAdQuery = `SELECT userAdvertisements.*, userAdvertisementImages.userAdvertisementImage
                          FROM userAdvertisements
                          JOIN userPlans ON userAdvertisements.userPlanId = userPlans.userPlanId
                          LEFT JOIN userAdvertisementImages ON userAdvertisements.userAdvertisementId = userAdvertisementImages.userAdvertisementId
                          WHERE userAdvertisements.userAdvertisementId=? and userAdvertisements.deleted = 0 and userAdvertisements.active = 1  and   userAdvertisements.expiryDate  > CURDATE() `;
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
async function createNewUserController(req, res) {
  let connection;
  try {
    const user = req.body.user;
    const userPermissions = req.body.user.userPermissions;
    const userId = decryptItem(user.userId, webSecretKey);
    const password = decryptItem(user.password, webSecretKey);
    const values = [
      userId,
      user.role,
      user.firstName,
      user.lastName,
      new Date(),
      1,
      1,

      encryptItem(password, dbSecretKey),
      1,
      encryptItem(password, dbSecretKey),
    ];
    connection = await connectToDatabase();
    await connection.beginTransaction();

    // No results
    const query = `INSERT INTO users( userId, role, firstName, lastName, registeredDate,   active, registered,   password, passwordResetRequired,previousPassword)
                   values(?,?,?,?,?,?,?,?,?,?)`;

    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res
        .status(500)
        .json({ errorMessage: 'Error creating user. Please try again.' });
    }

    if (user.role === 'Admin') {
      const query = `INSERT INTO userPermissions(viewDashboard, updateAdminSettings, createUser, viewUsers, createPlan, listPlans, viewPendingAdvertisements, approveAdvertisement,allowUserActions,allowPlanActions,viewRfps,approvedRfps, userId)
                   values(?,?,?,?,?,?,?,?,?,?,?,?,?)`;
      const values = [
        userPermissions.viewDashboard,
        userPermissions.updateAdminSettings,
        userPermissions.createUser,
        userPermissions.viewUsers,
        userPermissions.createPlan,
        userPermissions.listPlans,
        userPermissions.viewPendingAdvertisements,
        userPermissions.approveAdvertisement,
        userPermissions.allowUserActions,
        userPermissions.allowPlanActions,
        userPermissions.viewRfps,
        userPermissions.approvedRfps,
        userId,
      ];

      const [result] = await connection.execute(query, values);

      if (result.affectedRows === 0) {
        await connection.rollback();
        return res
          .status(500)
          .json({ errorMessage: 'Error creating user. Please try again.' });
      }
    }

    await sendTemporaryPasswordEmail(userId, password);

    await connection.commit();
    return res.status(200).json();
  } catch (error) {
    if (connection) await connection.rollback();
    return res
      .status(500)
      .json({ errorMessage: 'Error creating user. Please try again.' });
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
async function getUserPermissionController(req, res) {
  try {
    const userId = decryptItem(req.body.userId, webSecretKey);
    const selectQuery = `select * From userPermissions where userId =?`;
    const selectResult = await executeQuery(selectQuery, [userId]);
    if (selectResult.length > 0) {
      delete selectResult[0].userId;
    }

    return res.status(200).json(selectResult[0]);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
// refactored
async function updateUserPermissionController(req, res) {
  try {
    const userId = decryptItem(req.body.userId, webSecretKey);
    const userPermissions = req.body.userPermissions;
    const selectQuery = `select * From userPermissions where userId =?`;
    const selectResult = await executeQuery(selectQuery, [userId]);
    const values = [
      userPermissions.viewDashboard,
      userPermissions.updateAdminSettings,
      userPermissions.createUser,
      userPermissions.viewUsers,
      userPermissions.createPlan,
      userPermissions.listPlans,
      userPermissions.viewPendingAdvertisements,
      userPermissions.approveAdvertisement,
      userPermissions.allowPlanActions,
      userPermissions.allowUserActions,
      userPermissions.viewRfps,
      userPermissions.approvedRfps,
      userPermissions.viewSupportRequests,
      userId,
    ];
    if (selectResult.length > 0) {
      const updateQuery = `UPDATE userPermissions SET  viewDashboard=?,updateAdminSettings=?,
                            createUser=?,viewUsers=?,createPlan=?,listPlans=?,
                            viewPendingAdvertisements=?,approveAdvertisement=?,allowPlanActions=?,
                            allowUserActions=? , viewRfps=?, approvedRfps=?, viewSupportRequests=? WHERE userId =?`;
      const updateResult = await executeQuery(updateQuery, values);
      if (updateResult.affectedRows < 1) {
        return res.status(500).json({
          errorMessage: 'Failed to update information. Please try again later.',
        });
      }

      return res.status(200).json(userPermissions);
    } else {
      const insertQuery = `INSERT INTO userPermissions(viewDashboard, updateAdminSettings, createUser, viewUsers, createPlan,
        listPlans, viewPendingAdvertisements, approveAdvertisement,allowUserActions,allowPlanActions,viewRfps,approvedRfps, viewSupportRequests,userId)
                   values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

      const insertResult = await executeQuery(insertQuery, values);
      console.log(insertResult);
      if (insertResult.affectedRows === 0) {
        return res
          .status(500)
          .json({ errorMessage: 'Error updating user. Please try again.' });
      }
      return res.status(200).json(userPermissions);
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again later.',
    });
  }
}
async function getUserDetailsController(req, res) {
  try {
    let userId = decryptItem(req.body.userId, webSecretKey);
    const selectAdsQuery = `SELECT userAdvertisements.*
                          FROM userAdvertisements
                          JOIN userPlans ON userAdvertisements.userPlanId = userPlans.userPlanId
                          WHERE userPlans.userId= ?   ORDER BY userAdvertisements.dateCreated DESC`;
    const selectAdsResult = await executeQuery(selectAdsQuery, [userId]);

    const selectPlanQuery = `SELECT * FROM userPlans JOIN plans ON userPlans.planId = plans.planId where userId=?  AND plans.planType != 'free' `;

    const selectPlanResult = await executeQuery(selectPlanQuery, [userId]);

    const selectQuery1 = `SELECT userPlans.userPlanId ,plans.numberOfAdvertisements FROM userPlans JOIN plans ON userPlans.planId  = plans.planId  WHERE  userPlans.userId = ? and userPlans.userPlanActive=1  `;
    const selectResult1 = await executeQuery(selectQuery1, [userId]);
    let planBalance;
    if (selectResult1?.length > 0) {
      const selectQuery = `select count(*) as count from userAdvertisements JOIN userPlans ON userAdvertisements.userPlanId  = userPlans.userPlanId  where userAdvertisements.userPlanId=? `;
      const selectResult = await executeQuery(selectQuery, [
        selectResult1[0]?.userPlanId,
      ]);

      planBalance = {
        activePlanId: selectResult1[0].userPlanId,
        usedAdvertisements: selectResult[0]?.count,
        allowedOriginalAdvertisements: selectResult1[0]?.numberOfAdvertisements,
        remainedAdvertisements:
          selectResult1[0]?.numberOfAdvertisements - selectResult[0]?.count,
      };
    }
    const result = {
      userAds: selectAdsResult,
      plans: selectPlanResult,
      planBalance: planBalance,
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
async function getUsersDetailedDashboard(req, res) {
  try {
    const selectDailyQuery = `SELECT DATE_FORMAT(registeredDate, '%Y-%m-%d') as registeredDate, COUNT(*) as userCount
                        FROM users WHERE role IN ('General')   AND registeredDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                        GROUP BY DATE_FORMAT(registeredDate, '%Y-%m-%d')
                        ORDER BY DATE_FORMAT(registeredDate, '%Y-%m-%d');   `;

    const selectDailyResult = await executeQuery(selectDailyQuery, []);
    const selectMonthlyQuery = `SELECT DATE_FORMAT(registeredDate, '%Y-%m') as registeredMonth, COUNT(*) as userCount
                                FROM users
                                WHERE role IN ('General') AND registeredDate >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                                GROUP BY DATE_FORMAT(registeredDate, '%Y-%m')
                                ORDER BY DATE_FORMAT(registeredDate, '%Y-%m');   `;

    const selectMonthlyResult = await executeQuery(selectMonthlyQuery, []);
    const selectYearlyQuery = `SELECT DATE_FORMAT(registeredDate, '%Y') as registeredYear, COUNT(*) as userCount
                                FROM users
                                WHERE role IN ('General')
                                GROUP BY DATE_FORMAT(registeredDate, '%Y')
                                ORDER BY DATE_FORMAT(registeredDate, '%Y');  `;

    const selectYearlyResult = await executeQuery(selectYearlyQuery, []);

    const response = {
      daily: selectDailyResult,
      monthly: selectMonthlyResult,
      yearly: selectYearlyResult,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
async function getUsersCountBasedOnPlanTypesDashboard(req, res) {
  try {
    const selectDailyQuery = `WITH RecentRegistrations AS (
                            SELECT
                                DATE_FORMAT(registeredDate, '%Y-%m-%d') as registeredDate,
                                COUNT(*) as userCount
                              FROM
                                users
                              WHERE
                                role IN ('General')
                                AND registeredDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                              GROUP BY
                                DATE_FORMAT(registeredDate, '%Y-%m-%d')
                            )
                            SELECT
                              rr.registeredDate,
                              rr.userCount as totalActiveUsers,
                              SUM(CASE WHEN p.planType = 'free' THEN 1 ELSE 0 END) as freeActiveUsers,
                              SUM(CASE WHEN p.planType != 'free' THEN 1 ELSE 0 END) as paidActiveUsers
                            FROM
                              RecentRegistrations rr
                            JOIN
                              users u ON rr.registeredDate = DATE_FORMAT(u.registeredDate, '%Y-%m-%d')
                            JOIN
                              userPlans up ON u.userId = up.userId AND up.userPlanActive = true
                            JOIN
                              plans p ON up.planId = p.planId
                            WHERE
                              u.role IN ('General')
                            GROUP BY
                              rr.registeredDate
                            ORDER BY
                              rr.registeredDate;  `;

    const selectDailyResult = await executeQuery(selectDailyQuery, []);
    const selectMonthlyQuery = `WITH RecentRegistrations AS (
                            SELECT
                                DATE_FORMAT(registeredDate, '%Y-%m') as registeredDate,
                                COUNT(*) as userCount
                              FROM
                                users
                              WHERE
                                role IN ('General')
                                AND registeredDate >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                              GROUP BY
                                DATE_FORMAT(registeredDate, '%Y-%m')
                            )
                            SELECT
                              rr.registeredDate,
                              rr.userCount as totalActiveUsers,
                              SUM(CASE WHEN p.planType = 'free' THEN 1 ELSE 0 END) as freeActiveUsers,
                              SUM(CASE WHEN p.planType != 'free' THEN 1 ELSE 0 END) as paidActiveUsers
                            FROM
                              RecentRegistrations rr
                            JOIN
                              users u ON rr.registeredDate = DATE_FORMAT(u.registeredDate, '%Y-%m')
                            JOIN
                              userPlans up ON u.userId = up.userId AND up.userPlanActive = true
                            JOIN
                              plans p ON up.planId = p.planId
                            WHERE
                              u.role IN ('General')
                            GROUP BY
                              rr.registeredDate
                            ORDER BY
                              rr.registeredDate;    `;

    const selectMonthlyResult = await executeQuery(selectMonthlyQuery, []);
    const selectYearlyQuery = `WITH RecentRegistrations AS (
                            SELECT
                                DATE_FORMAT(registeredDate, '%Y') as registeredDate,
                                COUNT(*) as userCount
                              FROM
                                users
                              WHERE
                                role IN ('General')

                              GROUP BY
                                DATE_FORMAT(registeredDate, '%Y')
                            )
                            SELECT
                              rr.registeredDate,
                              rr.userCount as totalActiveUsers,
                              SUM(CASE WHEN p.planType = 'free' THEN 1 ELSE 0 END) as freeActiveUsers,
                              SUM(CASE WHEN p.planType != 'free' THEN 1 ELSE 0 END) as paidActiveUsers
                            FROM
                              RecentRegistrations rr
                            JOIN
                              users u ON rr.registeredDate = DATE_FORMAT(u.registeredDate, '%Y')
                            JOIN
                              userPlans up ON u.userId = up.userId AND up.userPlanActive = true
                            JOIN
                              plans p ON up.planId = p.planId
                            WHERE
                              u.role IN ('General')
                            GROUP BY
                              rr.registeredDate
                            ORDER BY
                              rr.registeredDate;   `;

    const selectYearlyResult = await executeQuery(selectYearlyQuery, []);

    const response = {
      daily: selectDailyResult,
      monthly: selectMonthlyResult,
      yearly: selectYearlyResult,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
async function UsersListController(req, res) {
  try {
    const selectQuery = `SELECT id, userId, role, firstName, lastName, registeredDate, loggedIn, active, registered,
    lastLoginDate, phone, fax, address, city, province, postalCode, website, middleName, profileImage, logoImage,
     loginCount, company, jobProfileDescription,
     deleted, serviceCoverageType, passwordResetRequired, lastPasswordResetDate FROM users `;
    const selectResult = await executeQuery(selectQuery, []);

    // const serviceNames = selectResult.map((row) => row.service);
    return res.status(200).json(selectResult);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
async function UsersTotalCountBasedOnPlansController(req, res) {
  try {
    const selectQuery = `SELECT
  COUNT(*) as totalActiveUsers,
  SUM(CASE WHEN p.planType = 'free' THEN 1 ELSE 0 END) as freeActiveUsers,
  SUM(CASE WHEN p.planType != 'free' THEN 1 ELSE 0 END) as paidActiveUsers
    FROM users u
    JOIN
      userPlans up ON u.userId = up.userId AND up.userPlanActive = true
    JOIN
      plans p ON up.planId = p.planId
      WHERE u.role ='General';`;
    const selectResult = await executeQuery(selectQuery, []);

    // const serviceNames = selectResult.map((row) => row.service);
    return res.status(200).json(selectResult[0]);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
async function listUserRequestSupportMessagesController(req, res) {
  try {
    const selectQuery = `select * from userSupportRequests where  respondedByAdmin=0 ORDER BY dateCreated DESC; `;
    const selectResult = await executeQuery(selectQuery, []);
    return res.status(200).json(selectResult);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to insert information. Please try again later.',
    });
  }
}

async function sendUserSupportRequestAdminResponse(req, res) {
  try {
    const adminUserId = decryptItem(req.body.adminUserId, webSecretKey);
    const userUserId = decryptItem(req.body.userUserId, webSecretKey);
    const messageId = req.body.messageId;
    const feedback = req.body.feedback;

    const updateQuery = `update userSupportRequests set adminResponse=? , adminUserId=?, respondedByAdmin=1  where  messageId =?  and userId=?`;
    const updateResult = await executeQuery(updateQuery, [
      feedback,
      adminUserId,
      messageId,
      userUserId,
    ]);
    if (updateResult.affectedRows === 0)
      return res.status(500).json({
        errorMessage: 'Failed to update information. Please try again later.',
      });
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to update information. Please try again later.',
    });
  }
}

module.exports = {
  UsersTotalCountBasedOnPlansController,
  getUsersCountBasedOnPlanTypesDashboard,
  UsersListController,
  getUsersDetailedDashboard,
  getUserDetailsController,
  updateUserPermissionController,
  getAdvertisementDetailsController,
  getUserPermissionController,
  rejectAdvertisement,
  approveAdvertisement,
  listAdminSettingsController,
  updateAdminSettingsController,
  createNewPlanController,
  listPlansController,
  updatePlanStatusController,
  deletePlanController,
  dashboardController,
  getPlanInfoController,
  updatePlanController,
  getAllUsersAdvertisementsPendingApproval,
  createNewUserController,
  listUserRequestSupportMessagesController,
  sendUserSupportRequestAdminResponse,
};

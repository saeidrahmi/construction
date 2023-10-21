const { executeQuery } = require('./utilityService'); // Import necessary helper functions

import { AdminSettingsInterface } from '../../../../libs/common/src/models/admin-settings';

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
      tax: selectResult[0].tax,
    };
    return res.status(200).json(setting);
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error getting settings.' });
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
      tax: info.tax,
    };
    const values = [
      setting.tax,
      setting.freeTiralPeriod,
      setting.monthlyPrice,
      setting.monthlyDiscount,
      setting.quarterlyDiscount,
      setting.semiAnualDiscount,
      setting.yearlyDiscount,
    ];
    const selectQuery = `SELECT * FROM settings`;
    const selectResult = await executeQuery(selectQuery, []);

    if (selectResult.length > 0) {
      // There are results
      const query = `UPDATE settings SET tax =? , freeTiralPeriod = ?, monthlyPrice = ?,monthlyDiscount = ?, quarterlyDiscount = ?,semiAnualDiscount=?, yearlyDiscount=?`;
      const result = await executeQuery(query, values);
      if (result.affectedRows > 0 || result.insertId) {
        return res.status(200).json(setting);
      } else {
        return res
          .status(500)
          .json({ errorMessage: 'Error updating settings ' });
      }
    } else {
      // No results
      const query = `INSERT INTO settings (freeTiralPeriod, monthlyPrice,quarterlyDiscount, semiAnualDiscount=?,yearlyDiscount) VALUES ( ?,?, ?, ?)`;
      const result = await executeQuery(query, values);
      if (result.affectedRows > 0 || result.insertId) {
        return res.status(200).json(setting);
      } else {
        return res
          .status(500)
          .json({ errorMessage: 'Error updating settings ' });
      }
    }
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error updating settings .' });
  }
}
async function createNewPlanController(req, res) {
  try {
    const createBidsIncluded = req.body.plan.createBidsIncluded ? 1 : 0;
    const viewBidsIncluded = req.body.plan.viewBidsIncluded ? 1 : 0;
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
      viewBidsIncluded,
      planActive,
      createBidsIncluded,
      onlineSupportIncluded,
    ];

    // No results
    const query = `INSERT INTO plans ( planName,planType,originalPrice,discountPercentage,priceAfterDiscount,startDate,expiryDate,numberOfAdvertisements,customProfileIncluded,planDescription,dateCreated,duration,viewBidsIncluded,active,createBidsIncluded,onlineSupportIncluded) VALUES (?, ?,?,?,?, ?, ?,?,?, ?, ?,?, ?, ?,?,?)`;

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
        viewBidsIncluded: req.body.plan.viewBidsIncluded,
        active: req.body.plan.active,
        createBidsIncluded: req.body.plan.createBidsIncluded,
        onlineSupportIncluded: req.body.plan.onlineSupportIncluded,
      };
      return res.status(200).json(plan);
    } else {
      return res.status(500).json({ errorMessage: 'Error creating plan ' });
    }
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error creating plan.' });
  }
}
async function listPlansController(req, res) {
  try {
    const selectQuery = `SELECT * FROM plans`;
    const selectResult = await executeQuery(selectQuery, []);
    return res.status(200).json(selectResult);
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error getting settings.' });
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
      return res.status(500).json({ errorMessage: 'Error updating plan ' });
    }
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error updating plan .' });
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
      return res.status(500).json({ errorMessage: 'Error deleting plan ' });
    }
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error deleting plan .' });
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
    return res.status(500).json({ errorMessage: 'Error getting dashboard.' });
  }
}

module.exports = {
  listAdminSettingsController,
  updateAdminSettingsController,
  createNewPlanController,
  listPlansController,
  updatePlanStatusController,
  deletePlanController,
  dashboardController,
};

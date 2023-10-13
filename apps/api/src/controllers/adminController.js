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
    };
    const values = [
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
      const query = `UPDATE settings SET freeTiralPeriod = ?, monthlyPrice = ?,monthlyDiscount = ?, quarterlyDiscount = ?,semiAnualDiscount=?, yearlyDiscount=?`;
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
    const viewBidsIncluded = req.body.plan.viewBidsIncluded ? 1 : 0;
    const websiteIncluded = req.body.plan.websiteIncluded ? 1 : 0;
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
      websiteIncluded,
      req.body.plan.planDescription,
      new Date(req.body.plan.dateCreated),
      req.body.plan.duration,
      viewBidsIncluded,
      planActive,
    ];

    // No results
    const query = `INSERT INTO plans ( planName,planType,originalPrice,discountPercentage,priceAfterDiscount,startDate,expiryDate,numberOfAdvertisements,websiteIncluded,planDescription,dateCreated,duration,viewBidsIncluded,active) VALUES (?, ?,?,?,?, ?, ?,?,?, ?, ?,?, ?, ?)`;
    console.log(values);
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
        websiteIncluded: req.body.plan.websiteIncluded,
        planDescription: req.body.plan.planDescription,
        dateCreated: req.body.plan.dateCreated,
        duration: req.body.plan.duration,
        viewBidsIncluded: req.body.plan.viewBidsIncluded,
        active: req.body.plan.active,
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

module.exports = {
  listAdminSettingsController,
  updateAdminSettingsController,
  createNewPlanController,
  listPlansController,
};

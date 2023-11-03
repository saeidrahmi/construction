const { decryptItem, executeQuery } = require('./utilityService'); // Import necessary helper functions

import { EnvironmentInfo } from '../../../../libs/common/src/models/common';

const env = new EnvironmentInfo();
const webSecretKey = env.webSecretKey();

async function freeTrialInfoController(req, res) {
  try {
    const selectQuery = `SELECT freeTiralPeriod FROM settings`;
    const selectResult = await executeQuery(selectQuery, []);
    return res.status(200).json(selectResult[0]);
  } catch (error) {
    return res
      .status(500)
      .json({
        errorMessage: 'Failed to retrieve information. Please try again later.',
      });
  }
}
async function getTaxController(req, res) {
  try {
    const selectQuery = `SELECT tax FROM settings`;
    const selectResult = await executeQuery(selectQuery, []);
    return res.status(200).json(selectResult[0]);
  } catch (error) {
    return res
      .status(500)
      .json({
        errorMessage: 'Failed to retrieve information. Please try again later.',
      });
  }
}
async function getTopAdInfoController(req, res) {
  try {
    const selectQuery = `SELECT topAdvertisementPrice FROM settings`;
    const selectResult = await executeQuery(selectQuery, []);
    return res.status(200).json(selectResult[0]);
  } catch (error) {
    return res
      .status(500)
      .json({
        errorMessage: 'Failed to retrieve information. Please try again later.',
      });
  }
}
async function listPlansController(req, res) {
  try {
    const selectQuery = `SELECT * FROM plans where active = 1 AND deleted=0 AND CURDATE() BETWEEN startDate AND expiryDate`;
    const selectResult = await executeQuery(selectQuery, []);
    return res.status(200).json(selectResult);
  } catch (error) {
    return res
      .status(500)
      .json({
        errorMessage: 'Failed to retrieve information. Please try again later.',
      });
  }
}
async function listPaidPlansController(req, res) {
  try {
    const selectQuery = `SELECT * FROM plans where planType !='free' AND active = 1 AND deleted=0 AND CURDATE() BETWEEN startDate AND expiryDate`;
    const selectResult = await executeQuery(selectQuery, []);
    return res.status(200).json(selectResult);
  } catch (error) {
    return res
      .status(500)
      .json({
        errorMessage: 'Failed to retrieve information. Please try again later.',
      });
  }
}
async function listAdvertisementsController(req, res) {
  try {
    const selectAdQuery = `SELECT userAdvertisements.*, users.city
                          FROM userAdvertisements
                          JOIN userPlans ON userAdvertisements.userPlanId = userPlans.userPlanId
                          JOIN users ON userPlans.userId = users.userId
                          WHERE userAdvertisements.deleted = 0 and userAdvertisements.active = 1  and userAdvertisements.approvedByAdmin = 1 and  userAdvertisements.expiryDate  > CURDATE() `;

    const selectResult = await executeQuery(selectAdQuery, []);

    return res.status(200).json(selectResult);
  } catch (error) {
    return res
      .status(500)
      .json({
        errorMessage: 'Failed to retrieve information. Please try again later.',
      });
  }
}

module.exports = {
  freeTrialInfoController,
  listPlansController,
  listPaidPlansController,
  getTaxController,
  getTopAdInfoController,
  listAdvertisementsController,
};

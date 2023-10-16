const { executeQuery } = require('./utilityService');
async function freeTrialInfoController(req, res) {
  try {
    const selectQuery = `SELECT freeTiralPeriod FROM settings`;
    const selectResult = await executeQuery(selectQuery, []);
    return res.status(200).json(selectResult[0]);
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error getting settings.' });
  }
}
async function getTaxController(req, res) {
  try {
    const selectQuery = `SELECT tax FROM settings`;
    const selectResult = await executeQuery(selectQuery, []);
    return res.status(200).json(selectResult[0]);
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error getting settings.' });
  }
}
async function listPlansController(req, res) {
  try {
    const selectQuery = `SELECT * FROM plans where active = 1 AND deleted=0 AND CURDATE() BETWEEN startDate AND expiryDate`;
    const selectResult = await executeQuery(selectQuery, []);
    return res.status(200).json(selectResult);
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error getting settings.' });
  }
}
async function listPaidPlansController(req, res) {
  try {
    const selectQuery = `SELECT * FROM plans where planType !='free' AND active = 1 AND deleted=0 AND CURDATE() BETWEEN startDate AND expiryDate`;
    const selectResult = await executeQuery(selectQuery, []);
    return res.status(200).json(selectResult);
  } catch (error) {
    return res.status(500).json({ errorMessage: 'Error getting settings.' });
  }
}

module.exports = {
  freeTrialInfoController,
  listPlansController,
  listPaidPlansController,
  getTaxController,
};

const {
  decryptItem,
  executeQuery,
  encryptItem,
  decryptCredentials,
  verifyToken,
  addDays,
} = require('./utilityService'); // Import necessary helper functions
const connectToDatabase = require('../db');

module.exports = { getUserRatings };

async function getUserRatings(userId) {
  const query = `SELECT AVG(overallCustomerSatisfaction) AS average_overall_rating,
                              AVG(cleanliness) AS average_cleanliness,AVG(flexibility) AS average_flexibility,AVG(qualityOfWork) AS average_qualityOfWork,
                              AVG(performance) AS average_performance,
                              AVG(timeliness) AS average_timeliness,AVG(communicationSkills) AS average_communicationSkills,
                              AVG(costManagement) AS average_costManagement,AVG(professionalism) AS average_professionalism,
                              AVG(safety) AS average_safety,AVG(materialsAndEquipment) AS average_materialsAndEquipment
                              FROM userRatings WHERE userId = ?;`;

  const [result] = await executeQuery(query, [userId]);
  return result;
}

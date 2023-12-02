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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
async function listAdvertisementsController(req, res) {
  try {
    const userId = decryptItem(req.body.userId, webSecretKey);
    const loggedIn = req.body.loggedIn;
    if (loggedIn) {
      const selectAdQuery = `SELECT userAdvertisements.*, users.city, users.profileImage as userProfileImage,
                          (SELECT AVG(cleanliness) FROM userRatings WHERE userId = users.userId) as average_cleanliness,
                          (SELECT AVG(flexibility)  FROM userRatings WHERE userId = users.userId) as average_flexibility,
                          (SELECT AVG(qualityOfWork)  FROM userRatings WHERE userId = users.userId) as average_qualityOfWork,
                          (SELECT AVG(performance) FROM userRatings WHERE userId = users.userId) as average_performance,
                          (SELECT AVG(communicationSkills) FROM userRatings WHERE userId = users.userId) as average_communicationSkills,
                          (SELECT AVG(timeliness)   FROM userRatings WHERE userId = users.userId) as average_timeliness,
                          (SELECT AVG(costManagement)   FROM userRatings WHERE userId = users.userId) as average_costManagement,
                          (SELECT AVG(professionalism)   FROM userRatings WHERE userId = users.userId) as average_professionalism,
                          (SELECT AVG(safety)   FROM userRatings WHERE userId = users.userId) as average_safety,
                          (SELECT AVG(materialsAndEquipment)   FROM userRatings WHERE userId = users.userId) as average_materialsAndEquipment,
                          (SELECT AVG(overallCustomerSatisfaction) AS average_rating FROM userRatings WHERE userId = users.userId) as average_userOverallRating,
                          (SELECT count(*) FROM userFavoriteAdvertisements WHERE userId = ? and userAdvertisementId=userAdvertisements.userAdvertisementId ) as isFavorite
                          FROM userAdvertisements
                          JOIN userPlans ON userAdvertisements.userPlanId = userPlans.userPlanId
                          JOIN users ON userPlans.userId = users.userId
                          WHERE userAdvertisements.deleted = 0 and userAdvertisements.active = 1
                           and userAdvertisements.approvedByAdmin = 1 and  userAdvertisements.expiryDate  > CURDATE()
                           ORDER BY userAdvertisements.dateCreated DESC `;

      const selectResult = await executeQuery(selectAdQuery, [userId]);

      return res.status(200).json(selectResult);
    } else {
      const selectAdQuery = `SELECT userAdvertisements.*, users.city, users.profileImage as userProfileImage,
                          (SELECT AVG(cleanliness) FROM userRatings WHERE userId = users.userId) as average_cleanliness,
                          (SELECT AVG(flexibility)  FROM userRatings WHERE userId = users.userId) as average_flexibility,
                          (SELECT AVG(qualityOfWork)  FROM userRatings WHERE userId = users.userId) as average_qualityOfWork,
                          (SELECT AVG(performance) FROM userRatings WHERE userId = users.userId) as average_performance,
                          (SELECT AVG(communicationSkills) FROM userRatings WHERE userId = users.userId) as average_communicationSkills,
                          (SELECT AVG(timeliness)   FROM userRatings WHERE userId = users.userId) as average_timeliness,
                          (SELECT AVG(costManagement)   FROM userRatings WHERE userId = users.userId) as average_costManagement,
                          (SELECT AVG(professionalism)   FROM userRatings WHERE userId = users.userId) as average_professionalism,
                          (SELECT AVG(safety)   FROM userRatings WHERE userId = users.userId) as average_safety,
                          (SELECT AVG(materialsAndEquipment)   FROM userRatings WHERE userId = users.userId) as average_materialsAndEquipment,
                          (SELECT AVG(overallCustomerSatisfaction) AS average_rating FROM userRatings WHERE userId = users.userId) as average_userOverallRating
                           FROM userAdvertisements
                          JOIN userPlans ON userAdvertisements.userPlanId = userPlans.userPlanId
                          JOIN users ON userPlans.userId = users.userId
                          WHERE userAdvertisements.deleted = 0 and userAdvertisements.active = 1
                           and userAdvertisements.approvedByAdmin = 1 and  userAdvertisements.expiryDate  > CURDATE()
                           ORDER BY userAdvertisements.dateCreated DESC `;

      const selectResult = await executeQuery(selectAdQuery, []);

      return res.status(200).json(selectResult);
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
async function searchAdvertisementsController(req, res) {
  try {
    const userId = decryptItem(req.body.userId, webSecretKey);
    const loggedIn = req.body.loggedIn;
    const searchQuery = req.body.data;
    const searchText = searchQuery?.searchText;
    const tagsArray = searchQuery?.tags;
    const placeholders = tagsArray
      .map(
        (tag) =>
          // `FIND_IN_SET('${tag.toLowerCase()}',  LOWER(userAdvertisements.tags)) > 0`
          `LOWER(userAdvertisements.tags) LIKE LOWER('%${tag}%')`
      )
      .join(' OR ');

    const locations = searchQuery?.locations;
    let locationsClause = '';
    if (locations?.includes('Canada-wide') || locations?.length === 0)
      locationsClause = '';
    else {
      const generateConditions = (location) => {
        const parts = location.split(',').map((part) => part.trim());

        if (parts.length === 1) {
          // If there is no comma, it is a province
          return `users.province = '${parts[0]}'`;
        } else {
          // If there is a comma, consider the first part as province and the second as city
          return `users.province = '${parts[0]}' AND users.city = '${parts[1]}'`;
        }
      };

      // Generate the WHERE clause for the SQL query
      locationsClause = locations.map(generateConditions).join(' OR ');
    }

    const sortBy = searchQuery?.sortBy === 'new' ? 'DESC' : 'ASC';

    if (loggedIn) {
      const selectAdQuery = `SELECT userAdvertisements.*, users.city, users.profileImage as userProfileImage,
                          (SELECT AVG(cleanliness) FROM userRatings WHERE userId = users.userId) as average_cleanliness,
                          (SELECT AVG(flexibility)  FROM userRatings WHERE userId = users.userId) as average_flexibility,
                          (SELECT AVG(qualityOfWork)  FROM userRatings WHERE userId = users.userId) as average_qualityOfWork,
                          (SELECT AVG(performance) FROM userRatings WHERE userId = users.userId) as average_performance,
                          (SELECT AVG(communicationSkills) FROM userRatings WHERE userId = users.userId) as average_communicationSkills,
                          (SELECT AVG(timeliness)   FROM userRatings WHERE userId = users.userId) as average_timeliness,
                          (SELECT AVG(costManagement)   FROM userRatings WHERE userId = users.userId) as average_costManagement,
                          (SELECT AVG(professionalism)   FROM userRatings WHERE userId = users.userId) as average_professionalism,
                          (SELECT AVG(safety)   FROM userRatings WHERE userId = users.userId) as average_safety,
                          (SELECT AVG(materialsAndEquipment)   FROM userRatings WHERE userId = users.userId) as average_materialsAndEquipment,
                          (SELECT AVG(overallCustomerSatisfaction) AS average_rating FROM userRatings WHERE userId = users.userId) as average_userOverallRating,
                          (SELECT count(*) FROM userFavoriteAdvertisements WHERE userId = ? and userAdvertisementId=userAdvertisements.userAdvertisementId ) as isFavorite
                          FROM userAdvertisements
                          JOIN userPlans ON userAdvertisements.userPlanId = userPlans.userPlanId
                          JOIN users ON userPlans.userId = users.userId
                          WHERE userAdvertisements.deleted = 0 and userAdvertisements.active = 1
                          and userAdvertisements.approvedByAdmin = 1 and  userAdvertisements.expiryDate  > CURDATE()
                            ${
                              tagsArray.length > 0
                                ? `and (${placeholders})`
                                : ''
                            }
                          and (LOWER(userAdvertisements.description) LIKE LOWER('%${searchText}%') or LOWER(userAdvertisements.title) LIKE LOWER('%${searchText}%') )
                          ${locationsClause ? ` AND ${locationsClause}` : ''}
                          ORDER BY userAdvertisements.dateCreated ${sortBy} `;

      const selectResult = await executeQuery(selectAdQuery, [userId]);

      return res.status(200).json(selectResult);
    } else {
      const selectAdQuery = `SELECT userAdvertisements.*, users.city, users.profileImage as userProfileImage,
                          (SELECT AVG(cleanliness) FROM userRatings WHERE userId = users.userId) as average_cleanliness,
                          (SELECT AVG(flexibility)  FROM userRatings WHERE userId = users.userId) as average_flexibility,
                          (SELECT AVG(qualityOfWork)  FROM userRatings WHERE userId = users.userId) as average_qualityOfWork,
                          (SELECT AVG(performance) FROM userRatings WHERE userId = users.userId) as average_performance,
                          (SELECT AVG(communicationSkills) FROM userRatings WHERE userId = users.userId) as average_communicationSkills,
                          (SELECT AVG(timeliness)   FROM userRatings WHERE userId = users.userId) as average_timeliness,
                          (SELECT AVG(costManagement)   FROM userRatings WHERE userId = users.userId) as average_costManagement,
                          (SELECT AVG(professionalism)   FROM userRatings WHERE userId = users.userId) as average_professionalism,
                          (SELECT AVG(safety)   FROM userRatings WHERE userId = users.userId) as average_safety,
                          (SELECT AVG(materialsAndEquipment)   FROM userRatings WHERE userId = users.userId) as average_materialsAndEquipment,
                          (SELECT AVG(overallCustomerSatisfaction) AS average_rating FROM userRatings WHERE userId = users.userId) as average_userOverallRating
                           FROM userAdvertisements
                          JOIN userPlans ON userAdvertisements.userPlanId = userPlans.userPlanId
                          JOIN users ON userPlans.userId = users.userId
                          WHERE userAdvertisements.deleted = 0 and userAdvertisements.active = 1
                           and userAdvertisements.approvedByAdmin = 1 and  userAdvertisements.expiryDate  > CURDATE()
                              ${
                                tagsArray.length > 0
                                  ? `and (${placeholders})`
                                  : ''
                              }
                               and (  LOWER(userAdvertisements.description) LIKE LOWER('%${searchText}%') or LOWER(userAdvertisements.title) LIKE LOWER('%${searchText}%') )
                           ${locationsClause ? ` AND ${locationsClause}` : ''}
                               ORDER BY userAdvertisements.dateCreated ${sortBy} `;

      const selectResult = await executeQuery(selectAdQuery, []);

      return res.status(200).json(selectResult);
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}
async function listUserActiveAdvertisementsController(req, res) {
  try {
    // let userId = decryptItem(req.body.userId, webSecretKey);
    let userAdvertisementId = req.body.userAdvertisementId;
    const selectUserQuery = `select userPlans.userId as userId from userAdvertisements
                           JOIN userPlans ON userAdvertisements.userPlanId = userPlans.userPlanId
                           where userAdvertisements.userAdvertisementId = ? `;
    const selectUserResult = await executeQuery(selectUserQuery, [
      userAdvertisementId,
    ]);

    if (selectUserResult.length === 0)
      return res.status(500).json({
        errorMessage: 'Failed to retrieve information. Please try again later.',
      });

    const selectAdQuery = `SELECT userAdvertisements.*, users.city, users.profileImage as userProfileImage,
                           (SELECT AVG(cleanliness) FROM userRatings WHERE userId = users.userId) as average_cleanliness,
                          (SELECT AVG(flexibility)  FROM userRatings WHERE userId = users.userId) as average_flexibility,
                          (SELECT AVG(qualityOfWork)  FROM userRatings WHERE userId = users.userId) as average_qualityOfWork,
                          (SELECT AVG(performance) FROM userRatings WHERE userId = users.userId) as average_performance,
                          (SELECT AVG(communicationSkills) FROM userRatings WHERE userId = users.userId) as average_communicationSkills,
                          (SELECT AVG(timeliness)   FROM userRatings WHERE userId = users.userId) as average_timeliness,
                          (SELECT AVG(costManagement)   FROM userRatings WHERE userId = users.userId) as average_costManagement,
                          (SELECT AVG(professionalism)   FROM userRatings WHERE userId = users.userId) as average_professionalism,
                          (SELECT AVG(safety)   FROM userRatings WHERE userId = users.userId) as average_safety,
                          (SELECT AVG(materialsAndEquipment)   FROM userRatings WHERE userId = users.userId) as average_materialsAndEquipment,
                          (SELECT AVG(overallCustomerSatisfaction) AS average_rating FROM userRatings WHERE userId = users.userId) as average_userOverallRating
                          FROM userAdvertisements
                          JOIN userPlans ON userAdvertisements.userPlanId = userPlans.userPlanId
                          JOIN users ON userPlans.userId = users.userId
                          WHERE users.userId = ? and userAdvertisements.deleted = 0 and userAdvertisements.active = 1
                           and userAdvertisements.approvedByAdmin = 1 and  userAdvertisements.expiryDate  > CURDATE()
                           ORDER BY userAdvertisements.dateCreated DESC `;

    const selectActiveAdsResult = await executeQuery(selectAdQuery, [
      selectUserResult[0].userId,
    ]);

    return res.status(200).json(selectActiveAdsResult);
  } catch (error) {
    return res.status(500).json({
      errorMessage: 'Failed to retrieve information. Please try again later.',
    });
  }
}

module.exports = {
  listUserActiveAdvertisementsController,
  freeTrialInfoController,
  listPlansController,
  listPaidPlansController,
  getTaxController,
  getTopAdInfoController,
  listAdvertisementsController,
  searchAdvertisementsController,
};

const express = require('express');

const router = express.Router();
const {
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
  approveAdvertisement,
  rejectAdvertisement,
  getAdvertisementDetailsController,
  createNewUserController,
} = require('../controllers/adminController');
const {
  verifySAdminToken,
  verifyAdminToken,
  verifyGeneralToken,
  verifyAdminAndSAdminToken,
  verifyAllToken,
} = require('../controllers/utilityService');
router.get('/list-admin-settings', verifyAllToken, listAdminSettingsController);
router.post(
  '/update-admin-settings',
  verifySAdminToken,

  updateAdminSettingsController
);
router.post('/create-new-plan', verifySAdminToken, createNewPlanController);
router.get('/list-plans', verifyAdminAndSAdminToken, listPlansController);
router.post(
  '/update-plan-status',
  verifySAdminToken,
  updatePlanStatusController
);
router.post('/delete-plan', verifySAdminToken, deletePlanController);
router.get('/dashboard', verifySAdminToken, dashboardController);
router.post('/plan-info', verifyAdminAndSAdminToken, getPlanInfoController);
router.get(
  '/list-advertisements-pending-approval',
  verifyAdminAndSAdminToken,
  getAllUsersAdvertisementsPendingApproval
);
router.post(
  '/approve-advertisement',
  verifyAdminAndSAdminToken,
  approveAdvertisement
);
router.post(
  '/reject-advertisement',
  verifyAdminAndSAdminToken,
  rejectAdvertisement
);
router.post('/update-plan', verifySAdminToken, updatePlanController);
router.post(
  '/get-advertisement-details',
  verifyAdminAndSAdminToken,
  getAdvertisementDetailsController
);
router.post(
  '/create-new-user',
  verifyAdminAndSAdminToken,
  createNewUserController
);
module.exports = router;

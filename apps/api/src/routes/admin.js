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
  getUserPermissionController,
  updateUserPermissionController,
  getUserDetailsController,
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
  verifyAdminAndSAdminToken,

  updateAdminSettingsController
);
router.post(
  '/create-new-plan',
  verifyAdminAndSAdminToken,
  createNewPlanController
);
router.get('/list-plans', verifyAdminAndSAdminToken, listPlansController);
router.post(
  '/update-plan-status',
  verifyAdminAndSAdminToken,
  updatePlanStatusController
);
router.post('/delete-plan', verifyAdminAndSAdminToken, deletePlanController);
router.get('/dashboard', verifyAdminAndSAdminToken, dashboardController);
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
router.post(
  '/get-user-permissions',
  verifyAdminAndSAdminToken,
  getUserPermissionController
);
router.post(
  '/update-user-permissions',
  verifyAdminAndSAdminToken,
  updateUserPermissionController
);
router.post(
  '/get-user-details',
  verifyAdminAndSAdminToken,
  getUserDetailsController
);
module.exports = router;

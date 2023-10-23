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
} = require('../controllers/adminController');
const { verifyToken } = require('../controllers/utilityService');
router.get('/list-admin-settings', verifyToken, listAdminSettingsController);
router.post(
  '/update-admin-settings',
  verifyToken,
  updateAdminSettingsController
);

router.post('/create-new-plan', verifyToken, createNewPlanController);
router.get('/list-plans', verifyToken, listPlansController);
router.post('/update-plan-status', verifyToken, updatePlanStatusController);
router.post('/delete-plan', verifyToken, deletePlanController);
router.get('/dashboard', verifyToken, dashboardController);
router.post('/plan-info', verifyToken, getPlanInfoController);
router.post('/update-plan', verifyToken, updatePlanController);
module.exports = router;

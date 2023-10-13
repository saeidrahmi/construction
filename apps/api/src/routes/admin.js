const express = require('express');

const router = express.Router();
const {
  listAdminSettingsController,
  updateAdminSettingsController,
  createNewPlanController,
  listPlansController,
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
module.exports = router;

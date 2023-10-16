const express = require('express');

const router = express.Router();
const {
  freeTrialInfoController,
  listPlansController,
  listPaidPlansController,
  getTaxController,
} = require('../controllers/publicController');

//router.post('/delete-plan', deletePlanController);
router.get('/get-free-trial-info', freeTrialInfoController);
router.get('/list-plans', listPlansController);
router.get('/list-paid-plans', listPaidPlansController);
router.get('/get-tax', getTaxController);

module.exports = router;

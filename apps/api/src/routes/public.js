const express = require('express');

const router = express.Router();
const {
  freeTrialInfoController,
  listPlansController,
  listPaidPlansController,
  getTaxController,
  getTopAdInfoController,
  listAdvertisementsController,
} = require('../controllers/publicController');

//router.post('/delete-plan', deletePlanController);
router.get('/get-free-trial-info', freeTrialInfoController);
router.get('/get-top-ad-info', getTopAdInfoController);
router.get('/list-plans', listPlansController);
router.get('/list-paid-plans', listPaidPlansController);
router.get('/get-tax', getTaxController);
router.get('/list-advertisements', listAdvertisementsController);

module.exports = router;

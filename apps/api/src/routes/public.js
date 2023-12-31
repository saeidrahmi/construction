const express = require('express');

const router = express.Router();
const {
  freeTrialInfoController,
  listPlansController,
  listPaidPlansController,
  getTaxController,
  getTopAdInfoController,
  listAdvertisementsController,
  listUserActiveAdvertisementsController,
  searchAdvertisementsController,
  listRfpsController,
  searchRfpsController,
} = require('../controllers/publicController');

//router.post('/delete-plan', deletePlanController);
router.get('/get-free-trial-info', freeTrialInfoController);
router.get('/get-top-ad-info', getTopAdInfoController);
router.get('/list-plans', listPlansController);
router.get('/list-paid-plans', listPaidPlansController);
router.get('/get-tax', getTaxController);
router.post('/list-advertisements', listAdvertisementsController);
router.post('/list-rfps', listRfpsController);
router.post('/search-advertisements', searchAdvertisementsController);
router.post('/search-rfps', searchRfpsController);
router.post(
  '/list-user-active-advertisements',
  listUserActiveAdvertisementsController
);

module.exports = router;

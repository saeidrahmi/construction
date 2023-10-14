const express = require('express');

const router = express.Router();
const {
  freeTrialInfoController,
  listPlansController,
} = require('../controllers/publicController');

//router.post('/delete-plan', deletePlanController);
router.get('/get-free-trial-info', freeTrialInfoController);
router.get('/list-plans', listPlansController);

module.exports = router;

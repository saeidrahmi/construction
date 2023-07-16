const express = require('express');
const router = express.Router();
const {
  logoutController,
  loginController,
  signupController,
  registerController,
} = require('../controllers/usersController');
router.post('/logout', logoutController);
router.post('/login', loginController);
router.post('/signup', signupController);
router.post('/register', registerController);
module.exports = router;

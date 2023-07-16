const express = require('express');
const router = express.Router();
const {
  logoutController,
  loginController,
  signupController,
  registerController,
  resetPasswordController,
} = require('../controllers/usersController');
router.post('/logout', logoutController);
router.post('/login', loginController);
router.post('/signup', signupController);
router.post('/register', registerController);
router.post('/reset-password', resetPasswordController);
module.exports = router;

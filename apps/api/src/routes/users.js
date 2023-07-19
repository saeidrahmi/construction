const express = require('express');
const router = express.Router();
const {
  logoutController,
  loginController,
  signupController,
  registerController,
  resetPasswordController,
  completeResetPasswordController,
  checkUserTokenController,
  editUserProfileController,
} = require('../controllers/usersController');
const { verifyToken } = require('../controllers/utilityService');
router.post('/logout', logoutController);
router.post('/checkUserToken', checkUserTokenController);
router.post('/login', loginController);
router.post('/signup', signupController);
router.post('/register', registerController);
router.post('/reset-password', resetPasswordController);
router.post('/edit-user-profile', verifyToken, editUserProfileController);
router.post(
  '/complete-reset-password',
  verifyToken,
  completeResetPasswordController
);
module.exports = router;

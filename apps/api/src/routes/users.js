const express = require('express');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
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
  changePasswordController,
  userServicesListController,
  addUserServicesController,
  removeUserServicesController,
} = require('../controllers/usersController');
const { verifyToken } = require('../controllers/utilityService');
router.post('/logout', logoutController);
router.post('/checkUserToken', checkUserTokenController);
router.post('/login', loginController);
router.post('/signup', signupController);
router.post('/register', registerController);
router.post('/reset-password', resetPasswordController);
router.post(
  '/edit-user-profile',
  verifyToken,
  upload.single('profileImage'),
  editUserProfileController
);
router.post(
  '/complete-reset-password',
  verifyToken,
  completeResetPasswordController
);
router.post('/change-password', verifyToken, changePasswordController);
router.post('/list-user-services', verifyToken, userServicesListController);
router.post('/add-user-services', verifyToken, addUserServicesController);
router.post('/remove-user-services', verifyToken, removeUserServicesController);

module.exports = router;

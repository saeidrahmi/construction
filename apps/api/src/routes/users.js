const express = require('express');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();
const {
  logoutController,
  loginController,
  signupController,
  registerFreeUserController,
  resetPasswordController,
  completeResetPasswordController,
  checkUserTokenController,
  editUserProfileController,
  changePasswordController,
  userServicesListController,
  addUserServicesController,
  removeUserServicesController,
  UsersListController,
  DeleteUserController,
  UpdateUserActivationStatusController,
  purchasePlanController,
  registerPaidUserController,
  listUserPlansController,
  updateUserServiceLocationTypeController,
  updateUserServiceProvincesController,
  updateUserServiceCitiesController,
  listUserServiceLocationController,
  canUserAdvertiseController,
} = require('../controllers/usersController');
const { verifyToken } = require('../controllers/utilityService');
router.post('/logout', logoutController);
router.post('/checkUserToken', checkUserTokenController);
router.post('/login', loginController);
router.post('/signup', signupController);
router.post('/register-free', registerFreeUserController);
router.post('/register-paid', registerPaidUserController);
router.post('/reset-password', resetPasswordController);
router.post(
  '/edit-user-profile',
  verifyToken,
  // upload.single('profileImage'),
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'logoImage', maxCount: 1 },
  ]),

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
router.post('/users', verifyToken, UsersListController);
router.post('/delete-user', verifyToken, DeleteUserController);
router.post(
  '/update-user-activation-status',
  verifyToken,
  UpdateUserActivationStatusController
);
router.post('/purchase-plan', verifyToken, purchasePlanController);
router.post('/list-user-plans', verifyToken, listUserPlansController);
router.post(
  '/update-user-service-location-type',
  verifyToken,
  updateUserServiceLocationTypeController
);
router.post(
  '/update-user-service-provinces',
  verifyToken,
  updateUserServiceProvincesController
);
router.post(
  '/update-user-service-cities',
  verifyToken,
  updateUserServiceCitiesController
);
router.post(
  '/list-user-service-location',
  verifyToken,
  listUserServiceLocationController
);
router.post('/can-user-advertise', verifyToken, canUserAdvertiseController);
module.exports = router;

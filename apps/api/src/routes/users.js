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
  getApplicationSettingsController,
  getPreNewAdInfoController,
  saveUserRegularAdController,
  updateUserAdvertisementActivateStatusController,
  getUserAdvertisementsController,
  updateUserAdvertisementDeleteStatusController,
  getAdvertisementDetailsController,
  deleteFavoriteAdvertisementsController,
  addFavoriteAdvertisementsController,
  addUserRatingController,
  isUserFavoriteAdController,
  postAdvertisementMessageController,
  getAdvertisementMessageController,
  deleteAdvertisementMessageController,
  getAdvertisementMessageThreadsController,
  getFavoriteAdvertisementsController,
  deleteFavoriteAdvertisementController,
  getMessageInfoController,
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
router.get(
  '/get-application-settings',
  verifyToken,
  getApplicationSettingsController
);
router.post('/get-pre-new-ad-info', verifyToken, getPreNewAdInfoController);
router.post(
  '/save-user-regular-ad',
  verifyToken,
  upload.fields([
    { name: 'headerImage', maxCount: 1 },
    { name: 'sliderImages', maxCount: 30 }, // You can adjust the number of allowed files
  ]),
  saveUserRegularAdController
);

router.post(
  '/get-user-advertisements',
  verifyToken,
  getUserAdvertisementsController
);
router.post(
  '/updateAd-active-status',
  verifyToken,
  updateUserAdvertisementActivateStatusController
);
router.post(
  '/updateAd-delete-status',
  verifyToken,
  updateUserAdvertisementDeleteStatusController
);
router.post(
  '/get-advertisement-details',

  getAdvertisementDetailsController
);
router.post(
  '/add-favorite-advertisement',
  verifyToken,
  addFavoriteAdvertisementsController
);
router.post(
  '/delete-favorite-advertisement',
  verifyToken,
  deleteFavoriteAdvertisementsController
);
router.post('/add-user-rating', verifyToken, addUserRatingController);
router.post('/is-user-favorite-ad', verifyToken, isUserFavoriteAdController);
router.post(
  '/post-advertisement-message',
  verifyToken,
  postAdvertisementMessageController
);
router.post(
  '/get-user-advertisement-messages',
  verifyToken,
  getAdvertisementMessageController
);
router.post(
  '/delete-user-advertisement-messages',
  verifyToken,
  deleteAdvertisementMessageController
);
router.post(
  '/get-user-favorite-advertisements',
  verifyToken,
  getFavoriteAdvertisementsController
);
router.post(
  '/delete-user-favorite-advertisement',
  verifyToken,
  deleteFavoriteAdvertisementController
);
router.post(
  '/get-user-advertisement-message-threads',
  verifyToken,
  getAdvertisementMessageThreadsController
);
router.post('/get-user-message-info', verifyToken, getMessageInfoController);

module.exports = router;

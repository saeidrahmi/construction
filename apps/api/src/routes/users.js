const express = require('express');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();
const {
  promoteTopAdvertisementController,
  getUserAdvertisementDetailsController,
  getAdvertisementEditInfoController,
  refreshTokenController,
  updateUserMessageViewController,
  getUserNumberOfNewMessagesController,
  deleteAllUserMessagesController,
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
  canUserEditAdvertisementController,
  editAdvertisementController,
  repostAdvertisementController,
} = require('../controllers/usersController');
const {
  verifyAllToken,
  verifySAdminToken,
  verifyAdminToken,
  verifyGeneralToken,
  verifyAdminAndSAdminToken,
} = require('../controllers/utilityService');
router.post('/logout', logoutController);
router.post('/checkUserToken', checkUserTokenController);
router.post('/login', loginController);
router.post('/signup', signupController);
router.post('/register-free', registerFreeUserController);
router.post('/register-paid', registerPaidUserController);
router.post('/reset-password', resetPasswordController);
router.post(
  '/edit-user-profile',
  verifyAllToken,
  // upload.single('profileImage'),
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'logoImage', maxCount: 1 },
  ]),

  editUserProfileController
);
router.post(
  '/complete-reset-password',
  verifyAllToken,
  completeResetPasswordController
);
router.post('/token', refreshTokenController);
router.post('/change-password', verifyAllToken, changePasswordController);
router.post(
  '/list-user-services',
  verifyGeneralToken,
  userServicesListController
);
router.post(
  '/add-user-services',
  verifyGeneralToken,
  addUserServicesController
);
router.post(
  '/remove-user-services',
  verifyGeneralToken,
  removeUserServicesController
);
router.post('/users', verifyAdminAndSAdminToken, UsersListController);
router.post('/delete-user', verifyAdminAndSAdminToken, DeleteUserController);
router.post(
  '/update-user-activation-status',
  verifyAdminAndSAdminToken,
  UpdateUserActivationStatusController
);
router.post('/purchase-plan', verifyGeneralToken, purchasePlanController);
router.post('/list-user-plans', verifyGeneralToken, listUserPlansController);
router.post(
  '/update-user-service-location-type',
  verifyGeneralToken,
  updateUserServiceLocationTypeController
);
router.post(
  '/update-user-service-provinces',
  verifyGeneralToken,
  updateUserServiceProvincesController
);
router.post(
  '/update-user-service-cities',
  verifyGeneralToken,
  updateUserServiceCitiesController
);
router.post(
  '/list-user-service-location',
  verifyGeneralToken,
  listUserServiceLocationController
);
router.post(
  '/can-user-advertise',
  verifyGeneralToken,
  canUserAdvertiseController
);
router.get(
  '/get-application-settings',
  verifyAllToken,
  getApplicationSettingsController
);
router.post(
  '/get-pre-new-ad-info',
  verifyGeneralToken,
  getPreNewAdInfoController
);
router.post(
  '/save-user-regular-ad',
  verifyGeneralToken,
  upload.fields([
    { name: 'headerImage', maxCount: 1 },
    { name: 'sliderImages', maxCount: 30 }, // You can adjust the number of allowed files
  ]),
  saveUserRegularAdController
);

router.post(
  '/get-user-advertisements',
  verifyGeneralToken,
  getUserAdvertisementsController
);
router.post(
  '/updateAd-active-status',
  verifyGeneralToken,
  updateUserAdvertisementActivateStatusController
);
router.post(
  '/updateAd-delete-status',
  verifyGeneralToken,
  updateUserAdvertisementDeleteStatusController
);
router.post(
  '/get-advertisement-details',

  getAdvertisementDetailsController
);
router.post(
  '/get-user-advertisement-details',
  verifyGeneralToken,
  getUserAdvertisementDetailsController
);
router.post(
  '/add-favorite-advertisement',
  verifyGeneralToken,
  addFavoriteAdvertisementsController
);
router.post(
  '/delete-favorite-advertisement',
  verifyGeneralToken,
  deleteFavoriteAdvertisementsController
);
router.post('/add-user-rating', verifyAllToken, addUserRatingController);
router.post(
  '/is-user-favorite-ad',
  verifyGeneralToken,
  isUserFavoriteAdController
);
router.post(
  '/post-advertisement-message',
  verifyAllToken,
  postAdvertisementMessageController
);
router.post(
  '/get-user-advertisement-messages',
  verifyGeneralToken,
  getAdvertisementMessageController
);
router.post(
  '/delete-user-advertisement-messages',
  verifyGeneralToken,
  deleteAdvertisementMessageController
);
router.post(
  '/get-user-favorite-advertisements',
  verifyGeneralToken,
  getFavoriteAdvertisementsController
);
router.post(
  '/delete-user-favorite-advertisement',
  verifyGeneralToken,
  deleteFavoriteAdvertisementController
);
router.post(
  '/get-user-advertisement-message-threads',
  verifyGeneralToken,
  getAdvertisementMessageThreadsController
);
router.post(
  '/get-user-message-info',
  verifyGeneralToken,
  getMessageInfoController
);
router.post(
  '/delete-user-messages',
  verifyGeneralToken,
  deleteAllUserMessagesController
);
router.post(
  '/update-user-message-view',
  verifyGeneralToken,
  updateUserMessageViewController
);

router.post(
  '/get-user-new-message-nbr',
  verifyGeneralToken,
  getUserNumberOfNewMessagesController
);
router.post(
  '/can-user-edit-advertisement',
  verifyGeneralToken,
  canUserEditAdvertisementController
);
router.post(
  '/edit-advertisement',
  verifyGeneralToken,
  upload.fields([
    { name: 'headerImage', maxCount: 1 },
    { name: 'sliderImages', maxCount: 30 }, // You can adjust the number of allowed files
  ]),
  editAdvertisementController
);
router.post(
  '/advertisement-general-edit-info',
  verifyGeneralToken,
  getAdvertisementEditInfoController
);
router.post(
  '/advertisement-repost',
  verifyGeneralToken,
  repostAdvertisementController
);
router.post(
  '/promote-top-ad',
  verifyGeneralToken,
  promoteTopAdvertisementController
);

module.exports = router;

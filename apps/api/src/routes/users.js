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
  saveUserRFPController,
  updateUserAdvertisementActivateStatusController,
  getUserAdvertisementsController,
  updateUserAdvertisementDeleteStatusController,
  getAdvertisementDetailsController,
  deleteFavoriteAdvertisementsController,
  addFavoriteAdvertisementsController,
  addUserOverallRatingController,
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
  deleteUserProfilePhotoController,
  getUserRatingsController,
  getUserRatingsDetailsController,
  postUserFeedbackController,
  getAllUserRatingsDetailsBasedOnUserId,
  submitNewSupportRequestController,
  listUserRequestSupportMessagesController,
  deleteRequestSupportMessagesController,
  updateUserRFPActivateStatusController,
  getUserRFPsController,
  updateUserRFPDeleteStatusController,
  getUserRfpDetailsController,
  isRfpUserFavoriteAdController,
  addFavoriteRfpController,
  getRfpEditInfoController,
  editRfpController,
  getRfpDetailsController,
  getUserRatingsByUserIdController,
  getAdvertisementItemsController,
} = require('../controllers/usersController');
const {
  verifyAllToken,
  verifySAdminToken,
  verifyAdminToken,
  verifyGeneralToken,
  verifyAdminAndSAdminToken,
  verifyTokenWithNoRole,
} = require('../controllers/utilityService');
router.post('/logout', logoutController);
router.post('/checkUserToken', checkUserTokenController);
router.post('/login', loginController);
router.post('/signup', signupController);
router.post('/register-free', registerFreeUserController);
router.post('/register-paid', registerPaidUserController);
router.post('/reset-password', resetPasswordController);
router.post('/user-ratings', getUserRatingsController);
router.post('/user-ratings-byId', getUserRatingsByUserIdController);
router.post(
  '/user-ratings-info',
  verifyGeneralToken,
  getAllUserRatingsDetailsBasedOnUserId
);
router.post('/user-ratings-details', getUserRatingsDetailsController);
router.post(
  '/advertisement-items',
  verifyAllToken,
  getAdvertisementItemsController
);
router.post('/post-user-feedback', verifyAllToken, postUserFeedbackController);
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
  verifyTokenWithNoRole(),
  completeResetPasswordController
);
router.post('/token', refreshTokenController);
router.post('/change-password', verifyAllToken, changePasswordController);
router.post(
  '/remove-user-profile-photo',
  verifyAllToken,
  deleteUserProfilePhotoController
);
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
router.post(
  '/get-support-request-messages',
  verifyGeneralToken,
  listUserRequestSupportMessagesController
);
router.post(
  '/delete-support-request-messages',
  verifyAllToken,
  deleteRequestSupportMessagesController
);

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
    { name: 'itemImages', maxCount: 30 },
  ]),
  saveUserRegularAdController
);
router.post(
  '/save-user-rfp',
  verifyGeneralToken,
  upload.fields([
    { name: 'headerImage', maxCount: 1 },
    { name: 'sliderImages', maxCount: 30 }, // You can adjust the number of allowed files
  ]),
  saveUserRFPController
);

router.post(
  '/get-user-advertisements',
  verifyGeneralToken,
  getUserAdvertisementsController
);
router.post('/get-user-rfps', verifyGeneralToken, getUserRFPsController);
router.post(
  '/updateAd-active-status',
  verifyGeneralToken,
  updateUserAdvertisementActivateStatusController
);
router.post(
  '/updateRfp-active-status',
  verifyGeneralToken,
  updateUserRFPActivateStatusController
);
router.post(
  '/updateAd-delete-status',
  verifyGeneralToken,
  updateUserAdvertisementDeleteStatusController
);
router.post(
  '/updateRfp-delete-status',
  verifyGeneralToken,
  updateUserRFPDeleteStatusController
);
router.post(
  '/get-advertisement-details',

  getAdvertisementDetailsController
);
router.post(
  '/get-rfp-details',

  getRfpDetailsController
);
router.post(
  '/get-user-advertisement-details',
  verifyGeneralToken,
  getUserAdvertisementDetailsController
);
router.post(
  '/get-user-rfp-details',
  verifyAllToken,
  getUserRfpDetailsController
);
router.post(
  '/add-favorite-advertisement',
  verifyGeneralToken,
  addFavoriteAdvertisementsController
);
router.post('/add-favorite-rfp', verifyGeneralToken, addFavoriteRfpController);
router.post(
  '/delete-favorite-advertisement',
  verifyGeneralToken,
  deleteFavoriteAdvertisementsController
);
router.post(
  '/add-user-overall-rating',
  verifyAllToken,
  addUserOverallRatingController
);
router.post('/is-user-favorite-ad', verifyAllToken, isUserFavoriteAdController);
router.post(
  '/is-rfp-user-favorite',
  verifyAllToken,
  isRfpUserFavoriteAdController
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
    { name: 'sliderImages', maxCount: 30 },
    { name: 'itemImages', maxCount: 30 },
  ]),
  editAdvertisementController
);
router.post(
  '/edit-rfp',
  verifyGeneralToken,
  upload.fields([
    { name: 'headerImage', maxCount: 1 },
    { name: 'sliderImages', maxCount: 30 }, // You can adjust the number of allowed files
  ]),
  editRfpController
);
router.post(
  '/advertisement-general-edit-info',
  verifyGeneralToken,
  getAdvertisementEditInfoController
);
router.post(
  '/rfp-general-edit-info',
  verifyGeneralToken,
  getRfpEditInfoController
);
router.post(
  '/new-support-request',
  verifyGeneralToken,
  submitNewSupportRequestController
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

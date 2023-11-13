export interface UserPermissionsInterface {
  viewDashboard?: boolean;
  updateAdminSettings?: boolean;
  createUser?: boolean;
  viewUsers?: boolean;
  createPlan?: boolean;
  listPlans?: boolean;
  viewPendingAdvertisements?: boolean;
  approveAdvertisement?: boolean;
  allowUserActions?: boolean;
  allowPlanActions?: boolean;
}

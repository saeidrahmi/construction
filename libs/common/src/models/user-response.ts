export interface UserApiResponseInterface {
  userId?: string;
  jwtToken?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  registeredDate?: Date | null | undefined;
  active?: boolean;
  loggedIn?: boolean;
  registered?: boolean;
  lastLoginDate?: Date | null | undefined;
}

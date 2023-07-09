export interface UserApiResponseInterface {
  userId?: string;
  jwtToken?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  registeredDate?: Date | null | undefined;
}

export interface UserInterface {
  loggedIn?: boolean;
  userId?: string;
  password?: string;
  purpose?: string;
  jwtToken?: string;
  role?: string;
  error?: string;
  firstName?: string;
  lastName?: string;
  registeredDate?: Date | null | undefined;
  active?: boolean;
  registered?: boolean;
  lastLoginDate?: Date | null | undefined;
}

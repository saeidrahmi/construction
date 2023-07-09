export interface UserInterface {
  loggedIn?: boolean;
  userId?: string;
  jwtToken?: string;
  role?: string;
  error?: string;
  firstName?: string;
  lastName?: string;
  registeredDate?: Date | null | undefined;
}

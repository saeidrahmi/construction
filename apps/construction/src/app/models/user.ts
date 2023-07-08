export interface UserInterface {
  loggedIn?: boolean;
  loaded?: boolean;
  userId?: string;
  jwtToken?: string;
  role?: string;
  error?: string;
  firstName?: string;
  lastName?: string;
}

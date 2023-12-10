import { UserPermissionsInterface } from './user-permissions';

export interface UserInterface {
  loggedIn?: boolean;
  profileImage?: { type: string; data: number[] };
  logoImage?: { type: string; data: number[] };
  userId?: string;
  password?: string;
  purpose?: string;
  jwtToken?: string;
  refreshToken?: string;
  role?: string;
  error?: string;
  firstName?: string;
  middleName?: string;
  jobProfileDescription?: string;
  lastName?: string;
  registeredDate?: Date | null | undefined;
  active?: boolean;
  locked?: boolean;
  registered?: boolean;
  lastLoginDate?: Date | null | undefined;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  fax?: string;
  website?: string;
  company?: string;
  passwordResetRequired?: boolean;
  lastPasswordResetDate?: Date | null | undefined;
  userPermissions?: UserPermissionsInterface;
}

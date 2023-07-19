import { AddressInterface } from './address';

export interface UserApiResponseInterface {
  userId?: string;
  jwtToken?: string;
  role?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  fax?: string;
  firstName?: string;
  lastName?: string;
  registeredDate?: Date | null | undefined;
  active?: boolean;
  loggedIn?: boolean;
  registered?: boolean;
  lastLoginDate?: Date | null | undefined;
}

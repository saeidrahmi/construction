import { AddressInterface } from './address';

export interface UserApiResponseInterface {
  userId?: string;
  profileImage?: Blob;
  jwtToken?: string;
  role?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  fax?: string;
  website?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  registeredDate?: Date | null | undefined;
  active?: boolean;
  loggedIn?: boolean;
  registered?: boolean;
  lastLoginDate?: Date | null | undefined;
}

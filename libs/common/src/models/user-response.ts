import { AddressInterface } from './address';

export interface UserApiResponseInterface {
  userId?: string;
  profileImage?: { type: string; data: number[] };
  jwtToken?: string;
  role?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  fax?: string;
  website?: string;
  company?: string;
  jobProfileDescription?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  registeredDate?: Date | null | undefined;
  active?: boolean;
  deleted?: boolean;
  loggedIn?: boolean;
  registered?: boolean;
  lastLoginDate?: Date | null | undefined;
}

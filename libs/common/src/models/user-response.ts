export interface UserApiResponseInterface {
  user: {
    userId?: string;
    profileImage?: { type: string; data: number[] };
    logoImage?: { type: string; data: number[] };
    jwtToken?: string;
    refreshToken?: string;
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
  };
  plan?: any;
  newMessagesNbr?: number;
}

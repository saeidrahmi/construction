export interface AdvertisementInterface {
  userAdvertisementId?: any;
  userPlanId?: any;
  userId?: string;
  title?: string;
  city?: string;
  headerImage?: string;
  headerImageUrl?: string;
  active?: boolean;
  deleted?: boolean;
  description?: string;
  dateCreated?: Date;
  expiryDate?: Date;
  topAdvertisement?: boolean;
  approvedByAdmin?: boolean;
  showPhone?: boolean;
  showAddress?: boolean;
  showEmail?: boolean;
  showPicture?: boolean;
  showChat?: boolean;
  numberOfVisits?: number;
  userRating?: number;
  userProfileImage?: any;
  sliderImages?: string[];
  sliderImageFiles?: File[];
}

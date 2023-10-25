export interface AdvertisementInterface {
  userAdvertisementId?: any;
  userPlanId?: any;
  title?: string;
  headerImage?: string;
  active?: boolean;
  description?: string;
  dateCreated?: Date;
  expiryDate?: Date;
  topAdvertisement?: boolean;
  showPhone?: boolean;
  showAddress?: boolean;
  showEmail?: boolean;
  showPicture?: boolean;
  showChat?: boolean;
  // sliderImages?: {
  //   imageTitle: string;
  //   imageDescription: string;
  //   sliderImage: { type: string; data: number[] };
  // }[];
  sliderImages?: string[];
}
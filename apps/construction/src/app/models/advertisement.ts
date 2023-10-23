export interface AdvertisementInterface {
  userAdvertisementId?: any;
  userPlanId?: any;
  title?: string;
  headerImage?: { type: string; data: number[] };
  active?: boolean;
  description?: string;
  dateCreated?: Date;
  expiryDate?: Date;
}

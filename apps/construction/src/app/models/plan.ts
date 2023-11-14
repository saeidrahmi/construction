export interface PlanInterface {
  planName?: string;
  planType?: string;
  customProfileIncluded?: boolean;
  active?: boolean;
  deleted?: boolean;
  planDescription?: string;
  numberOfAdvertisements?: number;
  // createRfpIncluded?: boolean;
  createRfpIncluded?: boolean;
  createBidsIncluded?: boolean;
  onlineSupportIncluded?: boolean;
  originalPrice?: number;
  priceAfterDiscount?: number;
  discountPercentage?: number;
  dateCreated?: Date;
  startDate?: Date;
  expiryDate?: Date;
  duration?: number;
}

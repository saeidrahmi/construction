export interface PlanInterface {
  planName?: string;
  planType?: string;
  customProfileIncluded?: boolean;
  active?: boolean;
  deleted?: boolean;
  planDescription?: string;
  numberOfAdvertisements?: number;
  viewBidsIncluded?: boolean;
  createBidsIncluded?: boolean;
  originalPrice?: number;
  priceAfterDiscount?: number;
  discountPercentage?: number;
  dateCreated?: Date;
  startDate?: Date;
  expiryDate?: Date;
  duration?: number;
}

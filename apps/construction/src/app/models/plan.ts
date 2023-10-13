export interface PlanInterface {
  planName?: string;
  planType?: string;
  websiteIncluded?: boolean;
  active?: boolean;
  planDescription?: string;
  numberOfAdvertisements?: number;
  viewBidsIncluded?: boolean;
  originalPrice?: number;
  priceAfterDiscount?: number;
  discountPercentage?: number;
  dateCreated?: Date;
  startDate?: Date;
  expiryDate?: Date;
  duration?: number;
}

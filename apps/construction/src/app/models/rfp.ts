export interface RFPInterface {
  rfpId?: any;
  userId?: any;
  title?: string;
  city?: string;
  tags?: string;
  headerImage?: string;
  headerImageUrl?: string;
  active?: boolean;
  isTurnkey?: boolean;
  deleted?: boolean;
  description?: string;

  budgetInformation?: string;
  showPicture?: boolean;
  dateCreated?: Date;
  startDate?: Date;
  projectStartDate?: Date;
  endDate?: Date;
  expiryDate?: Date;
  approvedByAdmin?: boolean;
  isFavorite?: number;
  numberOfVisits?: number;
  userProfileImage?: any;
  sliderImages?: string[];
  sliderImageFiles?: File[];
  contractorQualifications?: string;
  insuranceRequirements?: string;
  milestones?: string;
}
export interface RFPInterface {
  rfpId?: any;
  userId?: any;
  title?: string;
  city?: string;
  tags?: string;
  headerImage?: string;
  headerImageUrl?: string;
  active?: boolean;
  deleted?: boolean;
  description?: string;
  showPicture?: boolean;
  dateCreated?: Date;
  startDate?: Date;
  endDate?: Date;
  approvedByAdmin?: boolean;
  isFavorite?: number;
  numberOfVisits?: number;
  userProfileImage?: any;
  sliderImages?: string[];
  sliderImageFiles?: File[];
}

import { AdvertisementStateInterface } from './advertisement-state';
import { GeneralInfoInterface } from './general';
import { AdvertisementSearchFilterInterface } from './advertisementSearchFilterInterface';
import { UserInterface } from './user';

export interface StoreInterface {
  general?: GeneralInfoInterface;
  user: UserInterface;
  plan: any;
  isLoading?: boolean;
  advertisement?: AdvertisementStateInterface;
  userIdEdited?: string;
  userSelected?: any;
  userIdSelected?: string;
  mapSearchSelectedCities?: string[];
  advertisementSearchFilters?: AdvertisementSearchFilterInterface;
}

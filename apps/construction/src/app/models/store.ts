import { RFPStateInterface } from './rfp-state';
import { AdvertisementStateInterface } from './advertisement-state';
import { GeneralInfoInterface } from './general';

import { UserInterface } from './user';

export interface StoreInterface {
  general?: GeneralInfoInterface;
  user: UserInterface;
  plan: any;
  isLoading?: boolean;
  advertisement?: AdvertisementStateInterface;
  rfp?: RFPStateInterface;
  userIdEdited?: string;
  userSelected?: any;
  userIdSelected?: string;
  mapSearchSelectedCities?: string[];
  advertisementSearchFilters?: string[];
}

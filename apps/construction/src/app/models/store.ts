import { AdvertisementStateInterface } from './advertisement-state';
import { GeneralInfoInterface } from './general';
import { UserInterface } from './user';

export interface StoreInterface {
  general?: GeneralInfoInterface;
  user: UserInterface;
  plan: any;
  isLoading?: boolean;
  advertisement?: AdvertisementStateInterface;
}

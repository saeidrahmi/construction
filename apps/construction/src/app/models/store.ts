import { GeneralInfoInterface } from './general';
import { UserInterface } from './user';

export interface StoreInterface {
  general?: GeneralInfoInterface;
  user: UserInterface;
  isLoading?: boolean;
}

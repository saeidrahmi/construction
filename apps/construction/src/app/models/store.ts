import { UserInterface } from './user';

export interface StoreInterface {
  user: UserInterface;
  isLoading?: boolean;
}

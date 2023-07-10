import { UserInterface } from './user';

export interface StoreInterface {
  theme?: string;
  user: UserInterface;
  isLoading?: boolean;
}

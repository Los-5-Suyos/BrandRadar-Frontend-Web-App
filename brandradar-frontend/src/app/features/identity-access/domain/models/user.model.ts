import { AccountType } from '../enums/account-type.enum';
import { UserStatus } from '../enums/user-status.enum';

export interface UserModel {
  id: string;
  fullName: string;
  email: string;
  accountType: AccountType;
  status: UserStatus;
  token?: string;
}

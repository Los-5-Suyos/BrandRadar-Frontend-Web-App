import { AccountType } from '../enums/account-type.enum';
import { UserStatus } from '../enums/user-status.enum';

export interface UserModel {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  accountType: AccountType;
  assignedBrandIds?: string[];   // marcas visibles para este usuario
  failedAttempts?: number;
  createdAt?: string;
}

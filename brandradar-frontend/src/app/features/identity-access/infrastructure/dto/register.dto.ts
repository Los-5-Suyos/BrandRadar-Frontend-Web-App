import { AccountType } from '../../domain/enums/account-type.enum';

export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
  accountType: AccountType;
}

export interface RegisterResponseDto {
  id: string;
  email: string;
  name: string;
  status: string;
  accountType: string;
  token?: string;
}

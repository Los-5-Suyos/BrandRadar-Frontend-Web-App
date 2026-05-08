import { AccountType } from '../../domain/enums/account-type.enum';

export interface RegisterRequestDto {
  fullName: string;
  email: string;
  password: string;
  accountType: AccountType;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  id: string;
  fullName: string;
  email: string;
  accountType: AccountType;
  status: string;
  token: string;
}

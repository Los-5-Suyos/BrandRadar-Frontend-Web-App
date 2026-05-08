import { AccountType } from '../enums/account-type.enum';

export class AccountTypeVO {
  private readonly _value: AccountType;

  constructor(value: AccountType) {
    if (!Object.values(AccountType).includes(value)) {
      throw new Error(`Invalid account type: ${value}`);
    }
    this._value = value;
  }

  get value(): AccountType { return this._value; }

  isIndividual(): boolean { return this._value === AccountType.INDIVIDUAL; }
  isBusiness(): boolean   { return this._value === AccountType.BUSINESS; }

  /** A non-verified user has no operational access */
  hasWorkspaceAccess(): boolean { return false; }

  toString(): string { return this._value; }
}

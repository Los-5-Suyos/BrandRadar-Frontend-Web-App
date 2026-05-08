export interface AccountRegistered {
  readonly type: 'AccountRegistered';
  userId: string;
  email: string;
  accountType: string;
  occurredAt: Date;
}

export interface AccountActivated {
  readonly type: 'AccountActivated';
  userId: string;
  occurredAt: Date;
}

export interface AccountLocked {
  readonly type: 'AccountLocked';
  userId: string;
  reason: string;
  attemptCount: number;
  occurredAt: Date;
}

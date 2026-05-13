export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    status: string;
    accountType: string;
    assignedBrandIds?: string[];
    failedAttempts?: number;
  };
}

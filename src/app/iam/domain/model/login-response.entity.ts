export interface LoginResponse {
  token: string;
  refreshToken: string;
  userId: number;
  email: string;
  role: string;
}

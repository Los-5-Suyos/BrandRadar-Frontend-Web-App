import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterRequestDto, LoginRequestDto, AuthResponseDto } from '../dto/auth.dto';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class AuthAdapter {
  constructor(private http: HttpClient) {}

  register(dto: RegisterRequestDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${API}/auth/register`, dto);
  }

  login(dto: LoginRequestDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${API}/auth/login`, dto);
  }

  verifyEmail(token: string): Observable<{ verified: boolean }> {
    return this.http.get<{ verified: boolean }>(`${API}/auth/verify-email?token=${token}`);
  }

  resendVerification(email: string): Observable<void> {
    return this.http.post<void>(`${API}/auth/resend-verification`, { email });
  }
}

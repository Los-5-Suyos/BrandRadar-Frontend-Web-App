import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserAccount } from '../domain/model/user-account.entity';
import { LoginResponse } from '../domain/model/login-response.entity';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private baseUrl = environment.apiBaseUrl;
  private http = inject(HttpClient);

  register(email: string, password: string, role: string, description: string): Observable<UserAccount> {
    return this.http.post<UserAccount>(`${this.baseUrl}/auth/register`, {
      email, password, role, description
    });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, {
      email, password
    });
  }

  getAll(): Observable<UserAccount[]> {
    return this.http.get<UserAccount[]>(`${this.baseUrl}/user-accounts`);
  }
}

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
  status: string;
  accountType: string;
  assignedBrandIds: string[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:3000';
  private _currentUser = signal<User | null>(this.loadUser());
  private _token = signal<string | null>(localStorage.getItem('br_token'));

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token() && !!this._currentUser());

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/auth/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('br_token', res.token);
        localStorage.setItem('br_user', JSON.stringify(res.user));
        this._token.set(res.token);
        this._currentUser.set(res.user);
      })
    );
  }

  register(data: { name: string; email: string; password: string; accountType: string }): Observable<any> {
    return this.http.post(`${this.API}/auth/register`, data);
  }

  logout(): void {
    localStorage.removeItem('br_token');
    localStorage.removeItem('br_user');
    localStorage.removeItem('br_workspace');
    this._token.set(null);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem('br_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

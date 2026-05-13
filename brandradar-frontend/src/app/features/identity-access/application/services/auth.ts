import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AccountType } from '../../domain/enums/account-type.enum';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { UserModel } from '../../domain/models/user.model';
import { RegisterRequestDto } from '../../infrastructure/dto/register.dto';
import { LoginRequestDto, LoginResponseDto } from '../../infrastructure/dto/login.dto';

const API_BASE = 'http://localhost:3000';

export interface AuthState {
  user: UserModel | null;
  token: string | null;
  isAuthenticated: boolean;
  failedAttempts: number;
  isBlocked: boolean;
}

/**
 * AuthService — Application Service (T-04, T21)
 *
 * Centraliza toda la lógica de autenticación:
 * - register() → llama POST /auth/register (fake API: json-server + auth-middleware.js)
 * - login()    → llama POST /auth/login, maneja intentos fallidos y bloqueo
 * - El bloqueo NO es lógica de UI: vive aquí (DDD)
 * - Emite Domain Events conceptuales: AccountRegistered, AccountLocked
 *
 * Fake API: npx json-server db.json --middlewares auth-middleware.js --port 3000
 * Usuario de prueba: luis@upc.edu.pe / password123
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly TOKEN_KEY   = 'brandradar_token';
  private readonly USER_KEY    = 'brandradar_user';
  private readonly MAX_ATTEMPTS = 3;

  private _failedAttempts = 0;
  private _isBlocked      = false;

  // ── Registro ────────────────────────────────────────────────
  register(payload: RegisterRequestDto): Observable<{ email: string }> {
    return this.http.post<any>(`${API_BASE}/auth/register`, payload).pipe(
      tap((res) => {
        // Domain Event: AccountRegistered
        console.info('[DomainEvent] AccountRegistered', {
          email: res.email,
          accountType: payload.accountType,
        });
        const user: UserModel = {
          id: res.id ?? 'pending',
          name: payload.name,
          email: payload.email,
          status: UserStatus.PENDING_VERIFICATION,
          accountType: payload.accountType as AccountType,
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        if (res.token) localStorage.setItem(this.TOKEN_KEY, res.token);
      }),
      map((res) => ({ email: res.email ?? payload.email })),
      catchError((err: HttpErrorResponse) => throwError(() => err)),
    );
  }

  // ── Login ────────────────────────────────────────────────────
  login(credentials: LoginRequestDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${API_BASE}/auth/login`, credentials).pipe(
      tap((res) => {
        this._failedAttempts = 0;
        this._isBlocked      = false;
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 || err.status === 403) {
          this._failedAttempts++;
          if (this._failedAttempts >= this.MAX_ATTEMPTS) {
            this._isBlocked = true;
            // Domain Event: AccountLocked
            console.info('[DomainEvent] AccountLocked', {
              reason: 'MAX_FAILED_ATTEMPTS',
              attemptCount: this._failedAttempts,
            });
          }
        }
        return throwError(() => err);
      }),
    );
  }

  get failedAttempts(): number  { return this._failedAttempts; }
  get isBlocked(): boolean       { return this._isBlocked; }
  get remainingAttempts(): number {
    return Math.max(0, this.MAX_ATTEMPTS - this._failedAttempts);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('brandradar_workspace');
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): UserModel | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as UserModel; } catch { return null; }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}

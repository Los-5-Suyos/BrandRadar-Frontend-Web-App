import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthAdapter } from '../../infrastructure/adapters/auth.adapter';
import { RegisterRequestDto, LoginRequestDto } from '../../infrastructure/dto/auth.dto';
import { UserModel } from '../../domain/models/user.model';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { AccountType } from '../../domain/enums/account-type.enum';
import { AccountRegistered, AccountActivated, AccountLocked } from '../../domain/events/domain-events';

export const MAX_LOGIN_ATTEMPTS = 3;

export interface SessionState {
  user: UserModel | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // ── In-memory token (never localStorage) ──
  private _token: string | null = null;

  // ── Session State ──
  private readonly _session$ = new BehaviorSubject<SessionState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  // ── Account lock state ──
  private readonly _failedAttempts$ = new BehaviorSubject<number>(0);
  private readonly _accountLocked$  = new BehaviorSubject<boolean>(false);

  // ── Public streams ──
  readonly session$        = this._session$.asObservable();
  readonly failedAttempts$ = this._failedAttempts$.asObservable();
  readonly accountLocked$  = this._accountLocked$.asObservable();

  constructor(
    private readonly adapter: AuthAdapter,
    private readonly router: Router
  ) {}

  // ──────────────────────────────────────────────
  // REGISTER
  // ──────────────────────────────────────────────
  register(dto: RegisterRequestDto): Observable<any> {
    this._setLoading(true);
    return this.adapter.register(dto).pipe(
      tap(res => {
        this._setLoading(false);
        // Emit domain event (logically)
        const event: AccountRegistered = {
          type: 'AccountRegistered',
          userId: res.id,
          email: res.email,
          accountType: res.accountType,
          occurredAt: new Date()
        };
        console.log('[DomainEvent]', event);
        this.router.navigate(['/auth/verify-email'], { state: { email: dto.email } });
      }),
      catchError((err: HttpErrorResponse) => {
        this._setLoading(false);
        return throwError(() => err);
      })
    );
  }

  // ──────────────────────────────────────────────
  // LOGIN
  // ──────────────────────────────────────────────
  login(dto: LoginRequestDto): Observable<any> {
    if (this._accountLocked$.value) {
      return throwError(() => new Error('Account is locked'));
    }

    this._setLoading(true);
    return this.adapter.login(dto).pipe(
      tap(res => {
        this._token = res.token;
        this._failedAttempts$.next(0);
        this._accountLocked$.next(false);

        const user: UserModel = {
          id: res.id,
          fullName: res.fullName,
          email: res.email,
          accountType: res.accountType as AccountType,
          status: res.status as UserStatus,
          token: res.token
        };

        this._session$.next({ user, isAuthenticated: true, isLoading: false, error: null });
        this.router.navigate(['/workspace/select']);
      }),
      catchError((err: HttpErrorResponse) => {
        this._setLoading(false);
        this._handleLoginFailure(dto.email);
        return throwError(() => err);
      })
    );
  }

  // ──────────────────────────────────────────────
  // VERIFY EMAIL
  // ──────────────────────────────────────────────
  verifyEmail(token: string): Observable<any> {
    return this.adapter.verifyEmail(token).pipe(
      tap(() => {
        const event: AccountActivated = {
          type: 'AccountActivated',
          userId: 'unknown',
          occurredAt: new Date()
        };
        console.log('[DomainEvent]', event);
      })
    );
  }

  resendVerification(email: string): Observable<any> {
    return this.adapter.resendVerification(email);
  }

  // ──────────────────────────────────────────────
  // LOGOUT
  // ──────────────────────────────────────────────
  logout(): void {
    this._token = null;
    this._session$.next({ user: null, isAuthenticated: false, isLoading: false, error: null });
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null { return this._token; }

  isAuthenticated(): boolean { return !!this._token; }

  isVerified(): boolean {
    const user = this._session$.value.user;
    return user?.status === UserStatus.ACTIVE;
  }

  // ──────────────────────────────────────────────
  // PRIVATE
  // ──────────────────────────────────────────────
  private _setLoading(isLoading: boolean): void {
    this._session$.next({ ...this._session$.value, isLoading });
  }

  private _handleLoginFailure(userId: string): void {
    const attempts = this._failedAttempts$.value + 1;
    this._failedAttempts$.next(attempts);

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      this._accountLocked$.next(true);
      const event: AccountLocked = {
        type: 'AccountLocked',
        userId,
        reason: 'MAX_ATTEMPTS_REACHED',
        attemptCount: attempts,
        occurredAt: new Date()
      };
      console.log('[DomainEvent]', event);
    }
  }
}

import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApi } from '../infrastructure/auth-api';
import { UserAccount } from '../domain/model/user-account.entity';
import { LoginResponse } from '../domain/model/login-response.entity';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private currentUserSignal = signal<UserAccount | null>(null);
  private tokenSignal = signal<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  );
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly token = computed(() => this.tokenSignal());
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly isLoading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());

  private authApi = inject(AuthApi);
  private router = inject(Router);

  login(email: string, password: string) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.authApi.login(email, password).subscribe({
      next: (response: LoginResponse) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.token);
          localStorage.setItem('refreshToken', response.refreshToken);
          localStorage.setItem('userId', response.userId.toString());
          localStorage.setItem('userEmail', email);
        }
        this.tokenSignal.set(response.token);
        setTimeout(() => {
          this.loadingSignal.set(false);
          this.router.navigate(['/home']);
        }, 2000);
      },
      error: (err) => {
        this.errorSignal.set('Credenciales incorrectas');
        this.loadingSignal.set(false);
      },
    });
  }

  register(email: string, password: string, role: string, description: string) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.authApi.register(email, password, role, description).subscribe({
      next: () => {
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set('Error al registrar usuario');
        this.loadingSignal.set(false);
      },
    });
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
    }
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, MAX_LOGIN_ATTEMPTS } from '../../../application/services/auth';
import { InlineFieldError } from '../../../../../shared/components/inline-field-error/inline-field-error';
import { LoadingSpinner } from '../../../../../shared/components/loading-spinner/loading-spinner';
import { AccountBlockedBanner } from '../../../../../shared/components/account-blocked-banner/account-blocked-banner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InlineFieldError, LoadingSpinner, AccountBlockedBanner],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit, OnDestroy {
  form!: FormGroup;
  isLoading = false;
  isLocked  = false;
  failedAttempts = 0;
  networkError: string | null = null;
  showPassword = false;
  readonly maxAttempts = MAX_LOGIN_ATTEMPTS;

  private readonly destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.authService.accountLocked$.pipe(takeUntil(this.destroy$)).subscribe(locked => {
      this.isLocked = locked;
      if (locked) this.form.disable();
    });

    this.authService.failedAttempts$.pipe(takeUntil(this.destroy$)).subscribe(n => {
      this.failedAttempts = n;
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  get attemptsLeft(): number { return Math.max(0, this.maxAttempts - this.failedAttempts); }

  onSubmit(): void {
    if (this.form.invalid || this.isLoading || this.isLocked) return;
    this.form.markAllAsTouched();
    this.networkError = null;
    this.isLoading = true;

    this.authService.login(this.form.value).subscribe({
      next: () => { this.isLoading = false; },
      error: (err) => {
        this.isLoading = false;
        if (err?.status === 401) { /* handled by service */ }
        else { this.networkError = 'Error de conexión. Intenta de nuevo.'; }
      }
    });
  }
}

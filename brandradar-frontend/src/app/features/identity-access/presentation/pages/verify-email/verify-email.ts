import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subject, interval, takeUntil, take } from 'rxjs';
import { AuthService } from '../../../application/services/auth';

export type VerifyState = 'PENDING' | 'VERIFIED' | 'INVALID_TOKEN';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css'
})
export class VerifyEmail implements OnInit, OnDestroy {
  state: VerifyState = 'PENDING';
  email: string = '';
  cooldown = 0;
  isResending = false;
  redirectCountdown = 3;

  private readonly destroy$ = new Subject<void>();

  constructor(private authService: AuthService, private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.email = nav?.extras?.state?.['email'] || '';
  }

  ngOnInit(): void {
    // Check if token in URL (e.g. ?token=xxx)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) this.verifyToken(token);
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  verifyToken(token: string): void {
    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.state = 'VERIFIED';
        this.startRedirectCountdown();
      },
      error: () => { this.state = 'INVALID_TOKEN'; }
    });
  }

  resendEmail(): void {
    if (this.cooldown > 0 || this.isResending) return;
    this.isResending = true;
    this.authService.resendVerification(this.email).subscribe({
      next: () => {
        this.isResending = false;
        this.startCooldown();
      },
      error: () => { this.isResending = false; }
    });
  }

  private startCooldown(): void {
    this.cooldown = 60;
    interval(1000).pipe(
      take(60),
      takeUntil(this.destroy$)
    ).subscribe(() => { this.cooldown--; });
  }

  private startRedirectCountdown(): void {
    this.redirectCountdown = 3;
    interval(1000).pipe(take(3), takeUntil(this.destroy$)).subscribe({
      next: () => { this.redirectCountdown--; },
      complete: () => { this.router.navigate(['/auth/login']); }
    });
  }
}

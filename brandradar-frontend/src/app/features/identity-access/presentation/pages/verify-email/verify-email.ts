import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

/**
 * T-03 / T22 · US07 — Pantalla de Verificación de Email
 *
 * 3 estados de dominio:
 *  1. WAITING  — email enviado, esperando verificación (cooldown 60s para reenvío)
 *  2. VERIFIED — token válido, redirige a /auth/login en 3s (AccountActivated)
 *  3. EXPIRED  — token inválido/expirado, puede pedir nuevo correo
 *
 * DDD: UserStatus.PENDING_VERIFICATION → ACTIVE se refleja en JWT y authGuard (Victor)
 */
type VerifyState = 'waiting' | 'verified' | 'expired';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail implements OnInit, OnDestroy {
  private readonly router = inject(Router);

  state: VerifyState = 'waiting';
  email = '';
  cooldown = 0;
  redirectIn = 3;
  private cooldownInterval?: ReturnType<typeof setInterval>;
  private redirectInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    // Email pasado por navigation state desde register o login
    const nav = this.router.getCurrentNavigation();
    const stateEmail = nav?.extras?.state?.['email'];
    this.email = stateEmail ?? history.state?.['email'] ?? 'tu correo';

    // Simular verificación automática si hay token en URL (T22)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      this.handleToken(token);
    }
  }

  private handleToken(token: string): void {
    // Fake: token "valid" → VERIFIED, cualquier otro → EXPIRED
    setTimeout(() => {
      if (token === 'valid') {
        this.state = 'verified';
        // Domain Event: AccountActivated → estado pasa a ACTIVE
        const userRaw = localStorage.getItem('brandradar_user');
        if (userRaw) {
          try {
            const user = JSON.parse(userRaw);
            user.status = 'ACTIVE';
            localStorage.setItem('brandradar_user', JSON.stringify(user));
            console.info('[DomainEvent] AccountActivated', { email: user.email });
          } catch { /* ignore */ }
        }
        this.startRedirect();
      } else {
        this.state = 'expired';
      }
    }, 800);
  }

  resend(): void {
    if (this.cooldown > 0) return;
    // Simulación de reenvío
    console.info('[API] POST /auth/resend-verification', { email: this.email });
    this.cooldown = 60;
    this.cooldownInterval = setInterval(() => {
      this.cooldown--;
      if (this.cooldown <= 0) {
        clearInterval(this.cooldownInterval);
        this.cooldown = 0;
      }
    }, 1000);
    // Reset state a waiting si estaba en expired
    this.state = 'waiting';
  }

  private startRedirect(): void {
    this.redirectIn = 3;
    this.redirectInterval = setInterval(() => {
      this.redirectIn--;
      if (this.redirectIn <= 0) {
        clearInterval(this.redirectInterval);
        this.router.navigate(['/auth/login']);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.cooldownInterval);
    clearInterval(this.redirectInterval);
  }
}

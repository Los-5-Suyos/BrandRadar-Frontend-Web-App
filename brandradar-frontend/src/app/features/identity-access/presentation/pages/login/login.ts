import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../application/services/auth';
import { InlineFieldError } from '../../../../../shared/components/inline-field-error/inline-field-error';
import { AccountBlockedBanner } from '../../../../../shared/components/account-blocked-banner/account-blocked-banner';
import { LoadingSpinner } from '../../../../../shared/components/loading-spinner/loading-spinner';
import { SnackbarComponent } from '../../../../../shared/components/snackbar/snackbar';
import { UserStatus } from '../../../domain/enums/user-status.enum';

/**
 * T-04 / T24 · US08 — Login con bloqueo automático
 *
 * - Validación reactiva: email + contraseña
 * - Contador de intentos fallidos: "Te quedan N intentos"
 * - Al 3er fallo: muestra AccountBlockedBannerComponent, deshabilita formulario
 * - Login exitoso → /workspace/select
 * - La lógica de bloqueo vive en AuthService (DDD), aquí solo reacciona al estado
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    InlineFieldError, AccountBlockedBanner, LoadingSpinner, SnackbarComponent
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  @ViewChild(SnackbarComponent) snackbar!: SnackbarComponent;

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isLoading = false;
  loginError: string | null = null;  // mensaje de error inline en email/pass

  get isBlocked(): boolean { return this.auth.isBlocked; }
  get remainingAttempts(): number { return this.auth.remainingAttempts; }
  get failedAttempts(): number { return this.auth.failedAttempts; }

  get emailCtrl() { return this.form.get('email')!; }
  get passCtrl()  { return this.form.get('password')!; }

  get emailError(): string | null {
    if (!this.emailCtrl.touched) return null;
    if (this.emailCtrl.hasError('required')) return 'El correo es requerido.';
    if (this.emailCtrl.hasError('email'))    return 'Ingresa un correo válido.';
    return null;
  }
  get passError(): string | null {
    if (!this.passCtrl.touched) return null;
    if (this.passCtrl.hasError('required'))   return 'La contraseña es requerida.';
    if (this.passCtrl.hasError('minlength'))  return 'Mínimo 6 caracteres.';
    return null;
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.form.invalid || this.isBlocked || this.isLoading) return;
    this.loginError = null;
    this.isLoading = true;

    const { email, password } = this.form.value;
    this.auth.login({ email: email!, password: password! }).subscribe({
      next: (res) => {
        this.isLoading = false;
        // Redirigir según estado del usuario
        if (res.user.status === UserStatus.PENDING_VERIFICATION) {
          this.router.navigate(['/auth/verify-email'], { state: { email: res.user.email } });
        } else {
          this.router.navigate(['/workspace/select']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          if (this.auth.isBlocked) {
            // El banner de bloqueo se muestra automáticamente
          } else {
            this.loginError = `Credenciales incorrectas. Te quedan ${this.auth.remainingAttempts} intento(s).`;
          }
        } else {
          this.snackbar?.show('Error de conexión. Intenta de nuevo.', true);
        }
      }
    });
  }
}

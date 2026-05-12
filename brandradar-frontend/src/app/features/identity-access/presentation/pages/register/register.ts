import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../application/services/auth';
import { AccountType } from '../../../domain/enums/account-type.enum';
import { InlineFieldError } from '../../../../../shared/components/inline-field-error/inline-field-error';
import { PasswordStrengthMeter } from '../../../../../shared/components/password-strength-meter/password-strength-meter';
import { LoadingSpinner } from '../../../../../shared/components/loading-spinner/loading-spinner';
import { SnackbarComponent } from '../../../../../shared/components/snackbar/snackbar';

/**
 * Validador personalizado: al menos 1 número en la contraseña
 */
function hasNumberValidator(ctrl: AbstractControl): ValidationErrors | null {
  return /\d/.test(ctrl.value ?? '') ? null : { noNumber: true };
}

/**
 * T-01 / T21 / US06 — Pantalla de Registro con validación de dominio
 *
 * - 4 campos: nombre, email, contraseña, tipo de cuenta
 * - Validación reactiva con errores inline
 * - PasswordStrengthMeter con barra débil/media/fuerte
 * - AccountType mapea al Value Object del dominio (determina permisos de workspace)
 * - Submit → POST /auth/register → redirige a /auth/verify-email con email en state
 * - Error 409 → error inline "Este email ya está registrado"
 * - Domain Event: AccountRegistered emitido en AuthService
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    InlineFieldError, PasswordStrengthMeter, LoadingSpinner, SnackbarComponent
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  @ViewChild(SnackbarComponent) snackbar!: SnackbarComponent;

  accountTypes = [
    { value: AccountType.INDIVIDUAL, label: 'Individual — uso personal' },
    { value: AccountType.EMPRESA,    label: 'Empresa — acceso organizacional' },
  ];

  form = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(3)]],
    email:       ['', [Validators.required, Validators.email]],
    password:    ['', [Validators.required, Validators.minLength(8), hasNumberValidator]],
    accountType: [AccountType.INDIVIDUAL, Validators.required],
  });

  isLoading      = false;
  emailTakenError: string | null = null;

  get nameCtrl()    { return this.form.get('name')!; }
  get emailCtrl()   { return this.form.get('email')!; }
  get passCtrl()    { return this.form.get('password')!; }
  get accountCtrl() { return this.form.get('accountType')!; }

  get passwordValue(): string { return this.passCtrl.value ?? ''; }

  get nameError(): string | null {
    if (!this.nameCtrl.touched) return null;
    if (this.nameCtrl.hasError('required'))   return 'El nombre es requerido.';
    if (this.nameCtrl.hasError('minlength'))  return 'Mínimo 3 caracteres.';
    return null;
  }
  get emailError(): string | null {
    if (this.emailTakenError) return this.emailTakenError;
    if (!this.emailCtrl.touched) return null;
    if (this.emailCtrl.hasError('required')) return 'El correo es requerido.';
    if (this.emailCtrl.hasError('email'))    return 'Ingresa un correo electrónico válido.';
    return null;
  }
  get passError(): string | null {
    if (!this.passCtrl.touched) return null;
    if (this.passCtrl.hasError('required'))  return 'La contraseña es requerida.';
    if (this.passCtrl.hasError('minlength')) return 'Mínimo 8 caracteres.';
    if (this.passCtrl.hasError('noNumber'))  return 'Debe incluir al menos 1 número.';
    return null;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isLoading) return;

    this.emailTakenError = null;
    this.isLoading = true;

    const { name, email, password, accountType } = this.form.value;

    this.auth.register({
      name: name!,
      email: email!,
      password: password!,
      accountType: accountType as AccountType,
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.router.navigate(['/auth/verify-email'], { state: { email: res.email } });
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409) {
          this.emailTakenError = 'Este email ya está registrado.';
        } else {
          this.snackbar?.show('Error de conexión. Intenta de nuevo.', true);
        }
      }
    });
  }
}

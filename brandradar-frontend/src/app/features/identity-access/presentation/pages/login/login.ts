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

type Lang = 'es' | 'en';

const I18N = {
  es: {
    heroTitle:   'Hola, ¡Bienvenido!',
    heroDesc:    'Inicia sesión para gestionar tu monitoreo en tiempo real.',
    formTitle:   'Login',
    labelEmail:  'Correo electrónico',
    labelPass:   'Contraseña',
    forgot:      '¿Olvidaste tu contraseña?',
    submit:      'Iniciar sesión',
    submitting:  'Iniciando sesión…',
    noAccount:   '¿No tienes una cuenta?',
    register:    'Regístrate',
    errReqEmail: 'El correo es requerido.',
    errEmail:    'Ingresa un correo válido.',
    errReqPass:  'La contraseña es requerida.',
    errMinPass:  'Mínimo 6 caracteres.',
    attempts:    'Te quedan',
    attemptsEnd: 'intento(s).',
  },
  en: {
    heroTitle:   'Hello, Welcome!',
    heroDesc:    'Sign in to manage your real-time monitoring.',
    formTitle:   'Login',
    labelEmail:  'Email address',
    labelPass:   'Password',
    forgot:      'Forgot your password?',
    submit:      'Sign in',
    submitting:  'Signing in…',
    noAccount:   "Don't have an account?",
    register:    'Sign up',
    errReqEmail: 'Email is required.',
    errEmail:    'Enter a valid email.',
    errReqPass:  'Password is required.',
    errMinPass:  'Minimum 6 characters.',
    attempts:    'You have',
    attemptsEnd: 'attempt(s) left.',
  },
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink,
    InlineFieldError, AccountBlockedBanner, LoadingSpinner, SnackbarComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  @ViewChild(SnackbarComponent) snackbar!: SnackbarComponent;

  lang: Lang = 'es';
  t = I18N.es;

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isLoading = false;
  loginError: string | null = null;

  get isBlocked(): boolean        { return this.auth.isBlocked; }
  get remainingAttempts(): number { return this.auth.remainingAttempts; }
  get failedAttempts(): number    { return this.auth.failedAttempts; }
  get emailCtrl() { return this.form.get('email')!; }
  get passCtrl()  { return this.form.get('password')!; }

  get emailError(): string | null {
    if (!this.emailCtrl.touched) return null;
    if (this.emailCtrl.hasError('required')) return this.t.errReqEmail;
    if (this.emailCtrl.hasError('email'))    return this.t.errEmail;
    return null;
  }
  get passError(): string | null {
    if (!this.passCtrl.touched) return null;
    if (this.passCtrl.hasError('required'))  return this.t.errReqPass;
    if (this.passCtrl.hasError('minlength')) return this.t.errMinPass;
    return null;
  }

  ngOnInit(): void {
    const saved = (localStorage.getItem('br_lang') as Lang) || 'es';
    this.setLang(saved);
  }

  setLang(lang: Lang): void {
    this.lang = lang;
    this.t = I18N[lang];
    localStorage.setItem('br_lang', lang);
  }

  onSubmit(): void {
    if (this.form.invalid || this.isBlocked || this.isLoading) return;
    this.loginError = null;
    this.isLoading = true;
    const { email, password } = this.form.value;
    this.auth.login({ email: email!, password: password! }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.user.status === UserStatus.PENDING_VERIFICATION) {
          this.router.navigate(['/auth/verify-email'], { state: { email: res.user.email } });
        } else {
          this.router.navigate(['/workspace/select']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          if (!this.auth.isBlocked) {
            this.loginError = `Credenciales incorrectas. ${this.t.attempts} ${this.auth.remainingAttempts} ${this.t.attemptsEnd}`;
          }
        } else {
          this.snackbar?.show('Error de conexión. Intenta de nuevo.', true);
        }
      }
    });
  }
}

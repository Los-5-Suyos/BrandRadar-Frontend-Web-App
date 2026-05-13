import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../application/services/auth';
import { AccountType } from '../../../domain/enums/account-type.enum';
import { InlineFieldError } from '../../../../../shared/components/inline-field-error/inline-field-error';
import { PasswordStrengthMeter } from '../../../../../shared/components/password-strength-meter/password-strength-meter';
import { LoadingSpinner } from '../../../../../shared/components/loading-spinner/loading-spinner';
import { SnackbarComponent } from '../../../../../shared/components/snackbar/snackbar';

type Lang = 'es' | 'en';

const I18N = {
  es: {
    heroTitle:   'Crea tu cuenta',
    heroDesc:    'Regístrate para empezar a monitorear tu marca en tiempo real.',
    formTitle:   'Sign up',
    labelName:   'Nombre completo',
    labelEmail:  'Correo electrónico',
    labelPass:   'Contraseña',
    labelType:   'Tipo de cuenta',
    typeIndiv:   'Individual — uso personal',
    typeEmpresa: 'Empresa — acceso organizacional',
    submit:      'Registrarse',
    submitting:  'Registrando…',
    haveAccount: '¿Ya tienes una cuenta?',
    login:       'Iniciar sesión',
    errReqName:  'El nombre es requerido.',
    errMinName:  'Mínimo 3 caracteres.',
    errReqEmail: 'El correo es requerido.',
    errEmail:    'Ingresa un correo electrónico válido.',
    errTaken:    'Este email ya está registrado.',
    errReqPass:  'La contraseña es requerida.',
    errMinPass:  'Mínimo 8 caracteres.',
    errNumPass:  'Debe incluir al menos 1 número.',
  },
  en: {
    heroTitle:   'Create your account',
    heroDesc:    'Sign up to start monitoring your brand in real time.',
    formTitle:   'Sign up',
    labelName:   'Full name',
    labelEmail:  'Email address',
    labelPass:   'Password',
    labelType:   'Account type',
    typeIndiv:   'Individual — personal use',
    typeEmpresa: 'Company — organizational access',
    submit:      'Sign up',
    submitting:  'Signing up…',
    haveAccount: 'Already have an account?',
    login:       'Sign in',
    errReqName:  'Name is required.',
    errMinName:  'Minimum 3 characters.',
    errReqEmail: 'Email is required.',
    errEmail:    'Enter a valid email address.',
    errTaken:    'This email is already registered.',
    errReqPass:  'Password is required.',
    errMinPass:  'Minimum 8 characters.',
    errNumPass:  'Must include at least 1 number.',
  },
};

function hasNumberValidator(ctrl: AbstractControl): ValidationErrors | null {
  return /\d/.test(ctrl.value ?? '') ? null : { noNumber: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink,
    InlineFieldError, PasswordStrengthMeter, LoadingSpinner, SnackbarComponent],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);
  @ViewChild(SnackbarComponent) snackbar!: SnackbarComponent;

  lang: Lang = 'es';
  t = I18N.es;

  form = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(3)]],
    email:       ['', [Validators.required, Validators.email]],
    password:    ['', [Validators.required, Validators.minLength(8), hasNumberValidator]],
    accountType: [AccountType.INDIVIDUAL, Validators.required],
  });

  isLoading = false;
  emailTakenError: string | null = null;

  get accountTypes() {
    return [
      { value: AccountType.INDIVIDUAL, label: this.t.typeIndiv },
      { value: AccountType.EMPRESA,    label: this.t.typeEmpresa },
    ];
  }

  get nameCtrl()    { return this.form.get('name')!; }
  get emailCtrl()   { return this.form.get('email')!; }
  get passCtrl()    { return this.form.get('password')!; }
  get accountCtrl() { return this.form.get('accountType')!; }
  get passwordValue(): string { return this.passCtrl.value ?? ''; }

  get nameError(): string | null {
    if (!this.nameCtrl.touched) return null;
    if (this.nameCtrl.hasError('required'))  return this.t.errReqName;
    if (this.nameCtrl.hasError('minlength')) return this.t.errMinName;
    return null;
  }
  get emailError(): string | null {
    if (this.emailTakenError) return this.t.errTaken;
    if (!this.emailCtrl.touched) return null;
    if (this.emailCtrl.hasError('required')) return this.t.errReqEmail;
    if (this.emailCtrl.hasError('email'))    return this.t.errEmail;
    return null;
  }
  get passError(): string | null {
    if (!this.passCtrl.touched) return null;
    if (this.passCtrl.hasError('required'))  return this.t.errReqPass;
    if (this.passCtrl.hasError('minlength')) return this.t.errMinPass;
    if (this.passCtrl.hasError('noNumber'))  return this.t.errNumPass;
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
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isLoading) return;
    this.emailTakenError = null;
    this.isLoading = true;
    const { name, email, password, accountType } = this.form.value;
    this.auth.register({ name: name!, email: email!, password: password!, accountType: accountType as AccountType }).subscribe({
      next: (res) => { this.isLoading = false; this.router.navigate(['/auth/verify-email'], { state: { email: res.email } }); },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409) { this.emailTakenError = 'taken'; }
        else { this.snackbar?.show('Error de conexión. Intenta de nuevo.', true); }
      }
    });
  }
}

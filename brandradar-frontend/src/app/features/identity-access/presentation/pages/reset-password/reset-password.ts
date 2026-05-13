import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { InlineFieldError } from '../../../../../shared/components/inline-field-error/inline-field-error';
import { LoadingSpinner } from '../../../../../shared/components/loading-spinner/loading-spinner';

function passwordsMatchValidator(ctrl: AbstractControl): ValidationErrors | null {
  const pass = ctrl.get('password')?.value;
  const confirm = ctrl.get('confirmPassword')?.value;
  return pass === confirm ? null : { mismatch: true };
}

/**
 * T-06 / US10 — Restablecimiento de contraseña
 * Lee token de la URL → permite ingresar nueva contraseña.
 */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, InlineFieldError, LoadingSpinner],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  private fb     = inject(FormBuilder);
  private router = inject(Router);

  token: string | null = null;
  isInvalidToken = false;
  isLoading = false;
  success = false;

  form = this.fb.group({
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: passwordsMatchValidator });

  get passCtrl()    { return this.form.get('password')!; }
  get confirmCtrl() { return this.form.get('confirmPassword')!; }

  get passError(): string | null {
    if (!this.passCtrl.touched) return null;
    if (this.passCtrl.hasError('required'))  return 'La contraseña es requerida.';
    if (this.passCtrl.hasError('minlength')) return 'Mínimo 8 caracteres.';
    return null;
  }
  get confirmError(): string | null {
    if (!this.confirmCtrl.touched) return null;
    if (this.confirmCtrl.hasError('required')) return 'Confirma tu contraseña.';
    if (this.form.hasError('mismatch'))        return 'Las contraseñas no coinciden.';
    return null;
  }

  ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);
    this.token = params.get('token');
    if (!this.token) this.isInvalidToken = true;
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isLoading) return;
    this.isLoading = true;
    setTimeout(() => {
      console.info('[API] POST /auth/reset-password', { token: this.token, newPassword: this.passCtrl.value });
      this.isLoading = false;
      this.success = true;
      setTimeout(() => this.router.navigate(['/auth/login']), 3000);
    }, 900);
  }
}

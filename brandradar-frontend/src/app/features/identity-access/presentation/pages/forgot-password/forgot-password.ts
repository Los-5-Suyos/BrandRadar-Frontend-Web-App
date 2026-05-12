import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InlineFieldError } from '../../../../../shared/components/inline-field-error/inline-field-error';
import { LoadingSpinner } from '../../../../../shared/components/loading-spinner/loading-spinner';

/**
 * T-05 / US09 — Recuperación de contraseña
 * Solicita email → simula envío de enlace de recuperación.
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, InlineFieldError, LoadingSpinner],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  sent = false;
  isLoading = false;

  get emailCtrl() { return this.form.get('email')!; }

  get emailError(): string | null {
    if (!this.emailCtrl.touched) return null;
    if (this.emailCtrl.hasError('required')) return 'El correo es requerido.';
    if (this.emailCtrl.hasError('email'))    return 'Ingresa un correo válido.';
    return null;
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.sent) return;
    this.isLoading = true;
    // Simular llamada a POST /auth/forgot-password
    setTimeout(() => {
      console.info('[API] POST /auth/forgot-password', this.form.value);
      this.isLoading = false;
      this.sent = true;
    }, 800);
  }
}

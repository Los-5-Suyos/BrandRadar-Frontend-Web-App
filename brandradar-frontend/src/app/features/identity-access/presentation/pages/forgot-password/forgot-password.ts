import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InlineFieldError } from '../../../../../shared/components/inline-field-error/inline-field-error';
import { LoadingSpinner } from '../../../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InlineFieldError, LoadingSpinner],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  form!: ReturnType<FormBuilder['group']>;
  isLoading = false;
  sent = false;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  }
  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.isLoading = true;
    setTimeout(() => { this.isLoading = false; this.sent = true; }, 1200);
  }
}

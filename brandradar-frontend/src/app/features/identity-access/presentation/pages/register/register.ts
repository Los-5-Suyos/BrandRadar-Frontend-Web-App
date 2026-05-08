import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../application/services/auth';
import { AccountType } from '../../../domain/enums/account-type.enum';
import { passwordStrengthValidator } from '../../../../../shared/utilities/validator.util';
import { InlineFieldError } from '../../../../../shared/components/inline-field-error/inline-field-error';
import { PasswordStrengthMeter } from '../../../../../shared/components/password-strength-meter/password-strength-meter';
import { LoadingSpinner } from '../../../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InlineFieldError, PasswordStrengthMeter, LoadingSpinner],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  form!: FormGroup;
  isLoading = false;
  emailTaken = false;
  networkError: string | null = null;
  showPassword = false;
  readonly AccountType = AccountType;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName:    ['', [Validators.required, Validators.minLength(3)]],
      email:       ['', [Validators.required, Validators.email]],
      password:    ['', [Validators.required, passwordStrengthValidator()]],
      accountType: [AccountType.INDIVIDUAL, Validators.required]
    });
  }

  get passwordValue(): string { return this.form.get('password')?.value || ''; }

  selectAccountType(type: AccountType): void {
    this.form.patchValue({ accountType: type });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isLoading) return;
    this.isLoading = true;
    this.emailTaken = false;
    this.networkError = null;

    this.authService.register(this.form.value).subscribe({
      next: () => { this.isLoading = false; },
      error: (err) => {
        this.isLoading = false;
        if (err?.status === 409) {
          this.emailTaken = true;
          this.form.get('email')?.setErrors({ emailTaken: true });
        } else {
          this.networkError = 'Error de conexión. Intenta de nuevo.';
        }
      }
    });
  }
}

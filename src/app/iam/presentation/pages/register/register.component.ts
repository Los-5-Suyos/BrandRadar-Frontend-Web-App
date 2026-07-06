import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApi } from '../../../infrastructure/auth-api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  router = inject(Router);
  authApi = inject(AuthApi);

  fullName = '';
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  accountType = '';
  loading = false;
  error = '';

  get passwordStrength(): 'weak' | 'medium' | 'strong' | '' {
    if (!this.password) return '';
    if (this.password.length < 6) return 'weak';
    if (this.password.length < 10) return 'medium';
    return 'strong';
  }

  onSubmit() {
    this.error = '';

    if (!this.email.trim()) {
      this.error = 'Ingresa tu correo electrónico';
      return;
    }
    if (!this.password) {
      this.error = 'Ingresa una contraseña';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }
    if (!this.accountType) {
      this.error = 'Selecciona un tipo de cuenta';
      return;
    }

    this.loading = true;
    this.authApi.register(this.email, this.password, this.accountType, this.fullName).subscribe({
      next: (response) => {
        this.loading = false;
        if (typeof window !== 'undefined') {
          localStorage.setItem('pendingEmail', this.email);
          sessionStorage.setItem('pendingPassword', this.password);
        }
        this.router.navigate(['/verify-email']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.error = 'Este correo ya está registrado. ¿Ya tienes cuenta? Inicia sesión.';
        } else if (err.status === 400) {
          this.error =
            'Revisa los datos ingresados: el correo debe ser válido y la contraseña cumplir los requisitos mínimos.';
        } else {
          this.error = 'No se pudo completar el registro. Intenta nuevamente.';
        }
      },
    });
  }
}

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
    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }
    if (!this.accountType) {
      this.error = 'Selecciona un tipo de cuenta';
      return;
    }
    this.loading = true;
    this.error = '';
    this.authApi.register(this.email, this.password, this.accountType, this.fullName).subscribe({
      next: (response) => {
        this.loading = false;
        if (typeof window !== 'undefined') {
          localStorage.setItem('pendingEmail', this.email);
          // Guardado solo temporalmente para poder iniciar sesión automáticamente
          // apenas se verifique el correo. Se borra inmediatamente después de usarse.
          sessionStorage.setItem('pendingPassword', this.password);
        }
        this.router.navigate(['/verify-email']);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al registrar usuario';
      },
    });
  }
}

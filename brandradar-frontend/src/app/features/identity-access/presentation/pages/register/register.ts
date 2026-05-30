import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  name = '';
  email = '';
  password = '';
  accountType = 'empresa';
  showPassword = signal(false);
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  togglePassword() { this.showPassword.update(v => !v); }

  onSubmit() {
    if (!this.name || !this.email || !this.password) {
      this.error.set('Por favor completa todos los campos.'); return;
    }
    if (this.password.length < 8) {
      this.error.set('La contraseña debe tener al menos 8 caracteres.'); return;
    }
    this.loading.set(true);
    this.error.set('');

    this.auth.register({ name: this.name, email: this.email, password: this.password, accountType: this.accountType }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/auth/verify-email'], { queryParams: { email: this.email } });
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al registrar. Intenta nuevamente.');
      }
    });
  }
}

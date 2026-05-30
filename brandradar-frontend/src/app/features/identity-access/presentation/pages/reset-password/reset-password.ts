import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  newPassword = '';
  confirmPassword = '';
  showNew = signal(false);
  loading = signal(false);
  success = signal(false);
  error = signal('');

  hasMinLength = computed(() => this.newPassword.length >= 8);
  hasUpperAndNumber = computed(() => /[A-Z]/.test(this.newPassword) && /[0-9]/.test(this.newPassword));
  hasSpecial = computed(() => /[^a-zA-Z0-9]/.test(this.newPassword));

  constructor(private router: Router) {}

  toggleNew() { this.showNew.update(v => !v); }

  onSubmit() {
    this.error.set('');
    if (!this.newPassword || !this.confirmPassword) {
      this.error.set('Por favor completa todos los campos.'); return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Las contraseñas no coinciden.'); return;
    }
    if (!this.hasMinLength() || !this.hasUpperAndNumber()) {
      this.error.set('La contraseña no cumple los requisitos.'); return;
    }
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.success.set(true);
    }, 1500);
  }
}

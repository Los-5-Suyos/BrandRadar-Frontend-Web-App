import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  email = '';
  loading = signal(false);
  sent = signal(false);
  error = signal('');

  onSubmit() {
    if (!this.email) {
      this.error.set('Por favor ingresa tu email corporativo.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    // Fake API call delay
    setTimeout(() => {
      this.loading.set(false);
      this.sent.set(true);
    }, 1500);
  }
}

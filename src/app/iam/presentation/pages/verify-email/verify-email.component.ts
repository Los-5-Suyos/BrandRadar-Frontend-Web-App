import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../../../environments/environment';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent {
  router = inject(Router);
  http = inject(HttpClient);
  otp = ['', '', '', '', '', ''];
  error = '';
  loading = false;

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.value && index < 5) {
      const next = document.querySelectorAll('.otp-input')[index + 1] as HTMLInputElement;
      next?.focus();
    }
  }

  onKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.otp[index] && index > 0) {
      const prev = document.querySelectorAll('.otp-input')[index - 1] as HTMLInputElement;
      prev?.focus();
    }
  }

  verify() {
    const code = this.otp.join('');
    if (code.length < 6) {
      this.error = 'Ingresa el código completo';
      return;
    }
    this.loading = true;
    const email = localStorage.getItem('pendingEmail') || '';
    this.http.post(`${environment.apiBaseUrl}/auth/verify?email=${email}&code=${code}`, {}).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/subscription']);
      },
      error: () => {
        this.loading = false;
        this.error = 'Código incorrecto';
      }
    });
  }
}

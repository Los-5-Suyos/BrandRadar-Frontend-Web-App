import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  router = inject(Router);
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  email = '';
  sent = false;
  sending = false;

  send() {
    if (!this.email) return;
    this.sending = true;
    this.http.post(`${this.baseUrl}/auth/forgot-password`, { email: this.email }).subscribe({
      next: () => {
        this.sending = false;
        this.sent = true;
      },
      error: () => {
        this.sending = false;
        this.sent = true;
      }, // el backend siempre responde 200 por seguridad, así que igual mostramos "enviado"
    });
  }
}

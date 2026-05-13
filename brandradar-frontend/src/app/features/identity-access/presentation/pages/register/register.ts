import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { API_BASE_URL } from '../../../../../infrastructure/api/api-endpoints';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  name        = '';
  email       = '';
  password    = '';
  accountType = 'freelance'; // 'freelance' = Individual, 'empresa' = Empresa

  isLoading = false;
  error     = '';
  success   = false;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  selectAccountType(type: 'freelance' | 'empresa'): void {
    this.accountType = type;
  }

  register(): void {
    this.error = '';

    if (!this.name.trim()) {
      this.error = 'El nombre completo es requerido.';
      return;
    }
    if (!this.email.trim()) {
      this.error = 'El correo electrónico es requerido.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.isLoading = true;

    this.http.post<any>(`${API_BASE_URL}/auth/register`, {
      name:        this.name.trim(),
      email:       this.email.trim(),
      password:    this.password,
      accountType: this.accountType,
    }).pipe(
      catchError((err) => {
        const msg = err?.error?.message ?? 'Error al conectar con el servidor.';
        return of({ error: msg });
      }),
    ).subscribe((res) => {
      this.isLoading = false;

      if (res?.error) {
        this.error = res.error;
        return;
      }

      this.success = true;
      setTimeout(() => this.router.navigate(['/auth/login']), 2500);
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}

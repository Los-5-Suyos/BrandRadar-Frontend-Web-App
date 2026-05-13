import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { ENDPOINTS } from '../../../../../infrastructure/api/api-endpoints';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email     = '';
  password  = '';
  error     = '';
  isLoading = false;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  login(): void {
    if (!this.email || !this.password) {
      this.error = 'Por favor ingresa tu email y contraseña.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.http.post<any>(ENDPOINTS.AUTH_LOGIN, { email: this.email, password: this.password }).pipe(
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

      localStorage.setItem('brandradar_token', res.token);
      localStorage.setItem('brandradar_user', JSON.stringify(res.user));

      const defaultWorkspace = { id: 'w-001', name: 'BrandRadar Agency', status: 'ACTIVA', ownerId: res.user.id };
      localStorage.setItem('brandradar_workspace', JSON.stringify(defaultWorkspace));

      this.router.navigate(['/dashboard']);
    });
  }
}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="min-height:100vh;background:#0d0d14;display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;">
      <div style="text-align:center;">
        <div style="font-size:4rem;margin-bottom:16px;">🚫</div>
        <h1 style="font-family:Syne,sans-serif;color:#f1f5f9;margin-bottom:8px;">Acceso Denegado</h1>
        <p style="color:#64748b;margin-bottom:24px;">No tienes permisos para acceder a esta sección.</p>
        <a routerLink="/auth/login" style="background:linear-gradient(135deg,#7C3AED,#6D28D9);color:white;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.85rem;">
          Volver al inicio
        </a>
      </div>
    </div>
  `
})
export class AccessDeniedComponent {}

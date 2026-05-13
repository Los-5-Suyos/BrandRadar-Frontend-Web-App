import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div style="text-align: center; padding: 50px; font-family: sans-serif;">
      <h1 style="color: #e74c3c;">Acceso Restringido</h1>
      <p>Lo sentimos, este Workspace no se encuentra activo o ha sido bloqueado.</p>
      <p>Por favor, contacta con el administrador de BrandRadar.</p>
      <a routerLink="/" style="color: #3498db; text-decoration: none; font-weight: bold;"
        >Volver al inicio</a
      >
    </div>
  `,
})
export class AccessDeniedComponent {}

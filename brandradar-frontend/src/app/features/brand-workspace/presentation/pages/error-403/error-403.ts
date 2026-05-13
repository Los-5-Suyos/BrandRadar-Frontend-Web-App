import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-error-403',
  imports: [CommonModule, RouterLink],
  templateUrl: './error-403.html',
  styleUrl: './error-403.css',
})
export class Error403 implements OnInit {
  // Usamos inject() que es más moderno, como en tus otros archivos
  private http = inject(HttpClient);

  ngOnInit() {
    this.recordUnauthorizedAttempt();
  }

  private recordUnauthorizedAttempt() {
    const auditEvent = {
      event: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      timestamp: new Date().toISOString(),
      path: window.location.pathname,
      details: 'Intento de acceso a zona restringida (403) detectado en Brand-Workspace.',
    };

    // Mantenemos tu llamada de auditoría
    this.http.post('https://api.brandradar.com/audit/unauthorized-access', auditEvent).subscribe({
      next: () => console.log('[DDD Audit] Intento no autorizado registrado en BrandRadar.'),
      error: (err) => console.warn('Falla de infraestructura al auditar acceso:', err),
    });
  }
}

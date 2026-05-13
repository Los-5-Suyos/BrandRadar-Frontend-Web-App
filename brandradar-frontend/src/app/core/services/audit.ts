import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Audit {
  private http = inject(HttpClient);

  // POST /audit/brand-deactivated solicitado en el requerimiento
  logBrandDeactivation(brandId: string) {
    const payload = {
      brandId,
      action: 'DEACTIVATE',
      performedBy: 'ADMIN_USER', // Esto idealmente vendría de session.ts
      createdAt: new Date().toISOString(),
    };

    console.log('[AUDIT] Enviando evento de trazabilidad...', payload);

    // Aquí se hace el POST a la Fake API
    return this.http.post('/audit/brand-deactivated', payload);
  }
}

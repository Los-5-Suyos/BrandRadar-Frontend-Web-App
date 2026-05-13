import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENDPOINTS } from '../api/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  constructor(private http: HttpClient) {}

  // Registrar una acción automáticamente
  logAction(action: string, details: any): Observable<any> {
    const log = {
      action,
      ...details,
      userId: 'u-001', // Esto vendrá luego del servicio de sesión
      timestamp: new Date().toISOString(),
    };
    return this.http.post(ENDPOINTS.AUDIT_LOGS, log);
  }

  getLogs(): Observable<any[]> {
    return this.http.get<any[]>(ENDPOINTS.AUDIT_LOGS);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';
import { Observable, timer, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MonitoringService {
  private baseUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient) {}

  // PUNTO 4 Y 7: Obtener menciones con Polling (se actualiza solo)
  getMentionsWithPolling(brandId: string, sentiment?: string): Observable<any[]> {
    // timer(0, 30000) hace que se ejecute al inicio y luego cada 30 segundos
    return timer(0, 30000).pipe(
      switchMap(() => {
        let url = `${this.baseUrl}${API_CONFIG.endpoints.mentions}?brandId=${brandId}`;
        if (sentiment) url += `&sentimentType=${sentiment}`;
        return this.http.get<any[]>(url);
      }),
    );
  }

  // PUNTO 5: Obtener patrones sospechosos
  getPatterns(brandId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}${API_CONFIG.endpoints.patterns}?brandId=${brandId}`,
    );
  }

  // PUNTO 9: Registrar Eventos (Audit Logs) usando los nombres de tu imagen
  // Ejemplo: 'NegativeMentionDetected', 'ReputationSpikeDetected'
  logDomainEvent(action: string, data: any): Observable<any> {
    const payload = {
      action,
      timestamp: new Date().toISOString(),
      ...data,
    };
    return this.http.post(`${this.baseUrl}${API_CONFIG.endpoints.auditLogs}`, payload);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { ENDPOINTS } from '../api/api-endpoints';

@Injectable({ providedIn: 'root' })
export class AlertService {
  constructor(private http: HttpClient) {}
  // En src/app/infrastructure/services/alert.service.ts

  resolverAlerta(alertaId: string): Observable<any> {
    // Cambiamos el estado de TRIGGERED a RESOLVED en el db.json
    return this.http.patch(`${ENDPOINTS.ALERTS}/${alertaId}`, { status: 'RESOLVED' });
  }
  // Polling de alertas (5-10s) para el banner flotante
  getActiveAlerts(): Observable<any[]> {
    return timer(0, 5000).pipe(
      switchMap(() => this.http.get<any[]>(ENDPOINTS.ALERTS)),
      map((alerts) => alerts.filter((a) => a.status === 'TRIGGERED')), // Solo las activas
    );
  }
}

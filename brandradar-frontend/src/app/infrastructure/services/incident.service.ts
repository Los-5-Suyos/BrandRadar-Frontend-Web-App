import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ENDPOINTS } from '../api/api-endpoints';

@Injectable({ providedIn: 'root' })
export class IncidentService {
  constructor(private http: HttpClient) {}

  // Polling de incidentes para detectar crisis rápido
  getIncidentsWithPolling(): Observable<any[]> {
    return timer(0, 8000).pipe(
      // Cada 8 segundos
      switchMap(() => this.http.get<any[]>(ENDPOINTS.INCIDENTS)),
    );
  }
}

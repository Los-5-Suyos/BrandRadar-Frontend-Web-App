import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ENDPOINTS } from '../api/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class IncidentService {
  private readonly brandId = 'b-001'; // ID por defecto

  constructor(private http: HttpClient) {}

  /**
   * Punto 7: Polling de incidentes/crisis
   */
  getIncidentsWithPolling(): Observable<any[]> {
    return timer(0, 8000).pipe(
      switchMap(() => {
        // CORRECCIÓN: Ahora pasamos el brandId como función
        return this.http.get<any[]>(ENDPOINTS.INCIDENTS(this.brandId));
      }),
      catchError((error) => {
        console.error('Error en polling de incidentes:', error);
        return of([]);
      }),
    );
  }
}

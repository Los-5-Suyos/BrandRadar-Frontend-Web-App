import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENDPOINTS } from '../api/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class PatternService {
  constructor(private http: HttpClient) {}

  /**
   * Punto 5: Obtiene patrones por marca
   */
  getPatterns(brandId: string): Observable<any[]> {
    return this.http.get<any[]>(ENDPOINTS.PATTERNS(brandId));
  }

  /**
   * Punto 5 & 3: Actualiza el estado del patrón en el db.json
   */
  dismissPattern(id: string): Observable<any> {
    // Cambia el status a DISMISSED de forma permanente
    return this.http.patch(ENDPOINTS.PATTERNS_DISMISS(id), { status: 'DISMISSED' });
  }
}

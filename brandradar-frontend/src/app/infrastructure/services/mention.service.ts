import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { ENDPOINTS } from '../api/api-endpoints';
import { MentionAdapter } from '../../features/reputation-monitoring/infrastructure/adapters/mention.adapter';
import { Mention } from '../../features/reputation-monitoring/domain/models/mention.entity';

@Injectable({
  providedIn: 'root',
})
export class MentionService {
  constructor(
    private http: HttpClient,
    private adapter: MentionAdapter,
  ) {}

  getMentionsWithPolling(): Observable<Mention[]> {
    // Usamos un ID por defecto para el brandId ya que el endpoint lo requiere
    const brandId = 'b-001';

    return timer(0, 10000).pipe(
      switchMap((): Observable<any[]> => {
        // CORRECCIÓN: Llamamos a la función MENTIONS pasando el brandId
        return this.http.get<any[]>(ENDPOINTS.MENTIONS(brandId));
      }),
      map((apiData: any[]): Mention[] => {
        // Transformamos y ordenamos
        const mentions = this.adapter.adaptResponse(apiData);
        return this.ordenarPorCriticidad(mentions);
      }),
      catchError((error) => {
        console.error('Error cargando menciones:', error);
        return of([]); // Si falla, devolvemos una lista vacía para no romper el flujo
      }),
    );
  }

  private ordenarPorCriticidad(lista: Mention[]): Mention[] {
    const orden: Record<string, number> = { NEGATIVO: 1, NEUTRO: 2, POSITIVO: 3 };
    return lista.sort((a, b) => (orden[a.sentiment] || 4) - (orden[b.sentiment] || 4));
  }
}

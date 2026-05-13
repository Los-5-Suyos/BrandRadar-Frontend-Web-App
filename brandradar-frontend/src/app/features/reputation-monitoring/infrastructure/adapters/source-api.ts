import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SourceApi {
  // Datos simulados para la US15
  private mockSources = [
    { id: 1, name: 'Twitter / X', status: 'CONECTADA', icon: 'bi-twitter-x' },
    { id: 2, name: 'Instagram', status: 'ERROR', icon: 'bi-instagram' },
    { id: 3, name: 'Google Maps', status: 'CRÍTICA', icon: 'bi-google' },
    { id: 4, name: 'Facebook', status: 'DESCONECTADA', icon: 'bi-facebook' },
  ];

  getSources(): Observable<any[]> {
    return of(this.mockSources);
  }

  // Lógica de Dominio: Notificar fallas críticas
  reportCriticalFailure(sourceName: string) {
    console.warn(`InfrastructureFailureDetected for ${sourceName}`);
    // Aquí iría el POST a la API de auditoría
  }
}

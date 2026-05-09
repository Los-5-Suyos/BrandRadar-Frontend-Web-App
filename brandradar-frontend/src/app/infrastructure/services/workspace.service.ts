import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
// Asegúrate de que esta ruta a tus endpoints sea la correcta según tu imagen f2de93
import { ENDPOINTS } from '../api/api-endpoints';

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  constructor(private http: HttpClient) {}

  /**
   * Obtiene el estado de un workspace específico
   * Basado en la estructura de tu db.json
   */
  getWorkspaceStatus(id: string): Observable<string> {
    // ENDPOINTS.WORKSPACES debería apuntar a 'http://localhost:3000/workspaces'
    return this.http.get<any[]>(ENDPOINTS.WORKSPACES).pipe(
      map((workspaces) => {
        const ws = workspaces.find((w) => w.id === id);
        return ws ? ws.status : 'INEXISTENTE';
      }),
    );
  }
}

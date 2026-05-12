import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { ENDPOINTS } from '../api/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  constructor(private http: HttpClient) {}

  /**
   * Punto 8: Verifica el estado del workspace para seguridad
   */
  getWorkspaceStatus(id: string): Observable<string> {
    // Apunta a http://localhost:3000/workspaces/w-001
    return this.http.get<any>(`${ENDPOINTS.WORKSPACES}/${id}`).pipe(
      map((ws) => ws.status),
      catchError(() => of('ERROR')),
    );
  }
}

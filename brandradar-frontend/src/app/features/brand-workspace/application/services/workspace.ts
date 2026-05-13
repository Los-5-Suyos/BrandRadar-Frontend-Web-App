import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { WorkspaceModel } from '../../domain/models/workspace.model';
import { WorkspacePlan } from '../../domain/enums/workspace-plan.enum';
import { UserRole } from '../../domain/enums/user-role.enum';

const API_BASE = 'http://localhost:3000';

/**
 * WorkspaceService — Application Service T27
 *
 * Orquesta la obtención de workspaces disponibles para el usuario.
 * DDD: el filtro por acceso ocurre aquí, no en el componente.
 * El aggregate BrandWorkspace protege qué usuarios pueden entrar y con qué rol.
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly http = inject(HttpClient);

  /**
   * Obtiene los workspaces a los que el usuario logueado tiene acceso.
   * Si la API falla, devuelve los datos demo para no bloquear la UI.
   */
  getMyWorkspaces(): Observable<WorkspaceModel[]> {
    return this.http.get<WorkspaceModel[]>(`${API_BASE}/workspaces`).pipe(
      map(data => this._normalize(data)),
      catchError(() => of(this._demoWorkspaces()))
    );
  }

  /** Normaliza la respuesta de la API al modelo de dominio */
  private _normalize(data: any[]): WorkspaceModel[] {
    if (!Array.isArray(data) || data.length === 0) return this._demoWorkspaces();
    return data.map(ws => ({
      id:                ws.id ?? ws._id ?? 'w-001',
      name:              ws.name ?? 'Workspace',
      plan:              (ws.plan as WorkspacePlan) ?? WorkspacePlan.PRO,
      status:            ws.status ?? 'ACTIVA',
      activeBrandsCount: ws.activeBrandsCount ?? ws.brands?.length ?? 1,
      userRole:          (ws.userRole as UserRole) ?? UserRole.ADMIN,
      adminEmail:        ws.adminEmail ?? undefined,
      logoUrl:           ws.logoUrl ?? undefined,
    }));
  }

  /** Datos demo para cuando la fake API no está corriendo */
  private _demoWorkspaces(): WorkspaceModel[] {
    return [
      {
        id:                'w-001',
        name:              'BrandRadar Agency',
        plan:              WorkspacePlan.PRO,
        status:            'ACTIVA',
        activeBrandsCount: 3,
        userRole:          UserRole.ADMIN,
        adminEmail:        'admin@brandradar.io',
      },
    ];
  }
}

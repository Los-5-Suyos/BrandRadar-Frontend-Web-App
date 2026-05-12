import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { WorkspaceService } from '../../infrastructure/services/workspace.service';
import { map, catchError, of } from 'rxjs';

/**
 * T18 — WorkspaceGuard
 * Verifica que el usuario tiene acceso al workspace activo.
 * Si no hay workspace → redirige a /workspace/select.
 * Si la API falla → permite acceso (offline-first, workspace guardado en localStorage).
 */
export const workspaceGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const workspaceService = inject(WorkspaceService);

  const workspaceRaw = localStorage.getItem('brandradar_workspace');

  if (!workspaceRaw) {
    router.navigate(['/workspace/select']);
    return false;
  }

  let workspaceId: string;
  try {
    const workspace = JSON.parse(workspaceRaw);
    workspaceId = workspace.id;
  } catch {
    localStorage.removeItem('brandradar_workspace');
    router.navigate(['/workspace/select']);
    return false;
  }

  return workspaceService.getWorkspaceStatus(workspaceId).pipe(
    map((status: string) => {
      if (status === 'ACTIVA' || status === 'ACTIVE') {
        return true;
      }
      // Si el status no es activo pero el workspace existe
      // (puede ser offline o dato incompleto) → permitir acceso
      if (status === 'ERROR') {
        return true; // API no disponible → offline-first
      }
      console.warn(`[WorkspaceGuard] Workspace ${workspaceId} estado: ${status}`);
      router.navigate(['/workspace/select']);
      return false;
    }),
    catchError(() => {
      // API caída → permitir acceso con workspace de localStorage
      console.warn('[WorkspaceGuard] API no disponible, usando workspace local');
      return of(true);
    }),
  );
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { WorkspaceService } from '../../infrastructure/services/workspace.service';
import { AuditLogService } from '../../infrastructure/services/audit-log.service';
import { map, catchError, of } from 'rxjs';

/**
 * T18 — WorkspaceGuard
 * Victor
 *
 * Verifica que el usuario tiene acceso al workspace activo.
 * Si no tiene acceso → redirige a /access-denied y registra el intento en auditoría.
 *
 * Se aplica en app.routes.ts sobre: /dashboard, /brands, /incidents, /mentions
 */
export const workspaceGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const workspaceService = inject(WorkspaceService);
  const auditLogService = inject(AuditLogService);

  // Leer el workspace activo guardado en localStorage
  const workspaceRaw = localStorage.getItem('brandradar_workspace');

  if (!workspaceRaw) {
    // No hay workspace seleccionado → ir a seleccionar uno
    router.navigate(['/workspace/select']);
    return false;
  }

  let workspaceId: string;

  try {
    const workspace = JSON.parse(workspaceRaw);
    workspaceId = workspace.id;
  } catch {
    // JSON corrupto → limpiar y redirigir
    localStorage.removeItem('brandradar_workspace');
    router.navigate(['/workspace/select']);
    return false;
  }

  // Verificar el estado del workspace contra la API
  return workspaceService.getWorkspaceStatus(workspaceId).pipe(
    map((status: string) => {
      if (status === 'ACTIVA') {
        return true;
      }

      // Workspace no está activo → registrar intento fallido en auditoría (DDD: trazabilidad)
      const userRaw = localStorage.getItem('brandradar_user');
      const userId = userRaw ? (JSON.parse(userRaw)?.id ?? 'unknown') : 'unknown';

      auditLogService
        .logAction('UnauthorizedAccessAttempted', {
          workspaceId,
          userId,
          attemptedUrl: state.url,
          workspaceStatus: status,
        })
        .subscribe();

      console.warn(
        `[WorkspaceGuard] Acceso denegado al workspace ${workspaceId} (estado: ${status})`,
      );
      router.navigate(['/access-denied']);
      return false;
    }),
    catchError((error) => {
      // Si la API falla → por seguridad bloqueamos el acceso
      console.error('[WorkspaceGuard] Error verificando workspace:', error);
      router.navigate(['/access-denied']);
      return of(false);
    }),
  );
};

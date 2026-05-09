import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { WorkspaceService } from '../../infrastructure/services/workspace.service';
import { AuditLogService } from '../../infrastructure/services/audit-log.service'; // Inyectamos auditoría
import { map, tap } from 'rxjs';

export const workspaceGuard: CanActivateFn = (route, state) => {
  const workspaceService = inject(WorkspaceService);
  const auditLogService = inject(AuditLogService); // <--- Lo inyectamos aquí
  const router = inject(Router);

  const workspaceId = 'w-001';

  return workspaceService.getWorkspaceStatus(workspaceId).pipe(
    map((status) => {
      if (status === 'ACTIVA') {
        return true;
      }

      // Si el acceso es denegado, registramos el evento (Punto 9)
      auditLogService
        .logAction('UnauthorizedAccessAttempted', {
          workspaceId: workspaceId,
          attemptedUrl: state.url,
          currentStatus: status,
        })
        .subscribe();

      console.warn(`Acceso denegado: El workspace está ${status}`);
      router.navigate(['/access-denied']);
      return false;
    }),
  );
};

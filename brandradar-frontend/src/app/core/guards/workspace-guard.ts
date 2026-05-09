import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { WorkspaceService } from '../../infrastructure/services/workspace.service';
import { map } from 'rxjs';

export const workspaceGuard: CanActivateFn = (route, state) => {
  const workspaceService = inject(WorkspaceService);
  const router = inject(Router);

  // Usamos el ID de tu db.json para la validación
  const workspaceId = 'w-001';

  return workspaceService.getWorkspaceStatus(workspaceId).pipe(
    map((status) => {
      // Solo permitimos el acceso si el estado es ACTIVA
      if (status === 'ACTIVA') {
        return true;
      }

      // Si el estado es BLOQUEADA o PENDIENTE, redirigimos a la página de error
      console.warn(`Acceso denegado: El workspace está ${status}`);
      router.navigate(['/access-denied']);
      return false;
    }),
  );
};

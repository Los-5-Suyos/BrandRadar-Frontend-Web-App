import { Routes } from '@angular/router';
import { DashboardComponent } from './features/reputation-monitoring/presentation/pages/dashboard/dashboard';
// Importamos el guard que acabas de actualizar
import { workspaceGuard } from './core/guards/workspace-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    // AQUÍ es donde le dices a Angular que use el Guard
    canActivate: [workspaceGuard],
  },
  {
    path: 'access-denied',
    // Esta ruta es a donde el Guard mandará al usuario si el workspace está BLOQUEADA
    loadComponent: () =>
      import('./shared/components/access-denied/access-denied.component').then(
        (m) => m.AccessDeniedComponent,
      ),
  },
];

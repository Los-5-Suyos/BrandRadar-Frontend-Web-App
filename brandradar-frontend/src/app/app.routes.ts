import { Routes } from '@angular/router';
import { DashboardComponent } from './features/reputation-monitoring/presentation/pages/dashboard/dashboard';
import { workspaceGuard } from './core/guards/workspace-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'access-denied',
    loadComponent: () =>
      import('./shared/components/access-denied/access-denied.component').then(
        (m) => m.AccessDeniedComponent,
      ),
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [workspaceGuard],
  },
  {
    path: '**',
    redirectTo: 'access-denied',
  },
];

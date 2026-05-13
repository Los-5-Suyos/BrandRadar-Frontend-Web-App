import { Routes } from '@angular/router';
import { DashboardComponent } from './features/reputation-monitoring/presentation/pages/dashboard/dashboard';
import { workspaceGuard } from './core/guards/workspace-guard';

export const routes: Routes = [
  {
    path: 'source-connection',
    loadComponent: () =>
      import('./features/reputation-monitoring/presentation/pages/source-connection/source-connection.page').then(
        (m) => m.SourceConnectionPage,
      ),
  },
  {
    path: 'error-403',
    loadComponent: () =>
      import('./features/brand-workspace/presentation/pages/error-403/error-403').then(
        (m) => m.Error403,
      ),
  },
  {
    path: 'brand-management',
    loadComponent: () =>
      import('./features/brand-workspace/presentation/pages/brand-management/brand-management').then(
        (m) => m.BrandManagement,
      ),
  // Root redirect
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

import { Routes } from '@angular/router';

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
  },
];

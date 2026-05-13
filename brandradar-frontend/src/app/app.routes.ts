import { Routes } from '@angular/router';
import { DashboardComponent } from './features/reputation-monitoring/presentation/pages/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';
import { workspaceGuard } from './core/guards/workspace-guard';

export const routes: Routes = [
  // Root redirect → login
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  // ── Rutas públicas (sin auth) ──────────────────────────────────────────────
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/identity-access/presentation/pages/login/login').then(
        (m) => m.Login,
      ),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/identity-access/presentation/pages/register/register').then(
        (m) => m.Register,
      ),
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () =>
      import('./features/identity-access/presentation/pages/forgot-password/forgot-password').then(
        (m) => m.ForgotPassword,
      ),
  },
  {
    path: 'auth/verify-email',
    loadComponent: () =>
      import('./features/identity-access/presentation/pages/verify-email/verify-email').then(
        (m) => m.VerifyEmail,
      ),
  },
  {
    path: 'auth/reset-password',
    loadComponent: () =>
      import('./features/identity-access/presentation/pages/reset-password/reset-password').then(
        (m) => m.ResetPassword,
      ),
  },
  {
    path: 'access-denied',
    loadComponent: () =>
      import('./shared/components/access-denied/access-denied.component').then(
        (m) => m.AccessDeniedComponent,
      ),
  },
  {
    path: 'error-403',
    loadComponent: () =>
      import('./features/brand-workspace/presentation/pages/error-403/error-403').then(
        (m) => m.Error403,
      ),
  },

  // ── Rutas protegidas (requieren auth) ─────────────────────────────────────
  {
    path: 'workspace/select',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/brand-workspace/presentation/pages/workspace-select/workspace-select').then(
        (m) => m.WorkspaceSelect,
      ),
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, workspaceGuard],
  },
  {
    path: 'incidents',
    canActivate: [authGuard, workspaceGuard],
    loadComponent: () =>
      import('./features/crisis-detection/presentation/pages/incidents/incidents').then(
        (m) => m.Incidents,
      ),
  },
  {
    path: 'source-connection',
    canActivate: [authGuard, workspaceGuard],
    loadComponent: () =>
      import('./features/reputation-monitoring/presentation/pages/source-connection/source-connection.page').then(
        (m) => m.SourceConnectionPage,
      ),
  },
  {
    path: 'brand-management',
    canActivate: [authGuard, workspaceGuard],
    loadComponent: () =>
      import('./features/brand-workspace/presentation/pages/brand-management/brand-management').then(
        (m) => m.BrandManagement,
      ),
  },

  // Fallback
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];

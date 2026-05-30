import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { workspaceGuard } from './core/guards/workspace-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // ── Auth routes (public) ──
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./features/identity-access/presentation/pages/login/login').then(m => m.Login) },
      { path: 'register', loadComponent: () => import('./features/identity-access/presentation/pages/register-wizard/register-wizard').then(m => m.RegisterWizardComponent) },
      { path: 'verify-email', loadComponent: () => import('./features/identity-access/presentation/pages/verify-email/verify-email').then(m => m.VerifyEmail) },
      { path: 'forgot-password', loadComponent: () => import('./features/identity-access/presentation/pages/forgot-password/forgot-password').then(m => m.ForgotPassword) },
      { path: 'reset-password', loadComponent: () => import('./features/identity-access/presentation/pages/reset-password/reset-password').then(m => m.ResetPassword) },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // ── Workspace selection (requires auth) ──
  {
    path: 'workspace',
    canActivate: [authGuard],
    children: [
      { path: 'select', loadComponent: () => import('./features/brand-workspace/presentation/pages/workspace-select/workspace-select').then(m => m.WorkspaceSelect) },
    ],
  },

  // ── Protected ──
  { path: 'access-denied', loadComponent: () => import('./shared/components/access-denied/access-denied.component').then(m => m.AccessDeniedComponent) },
  { path: 'dashboard', loadComponent: () => import('./features/reputation-monitoring/presentation/pages/dashboard/dashboard').then(m => m.DashboardComponent), canActivate: [authGuard, workspaceGuard] },
  { path: '**', redirectTo: 'auth/login' },
];

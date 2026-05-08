import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/identity-access/presentation/pages/login/login').then(m => m.Login)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/identity-access/presentation/pages/register/register').then(m => m.Register)
      },
      {
        path: 'verify-email',
        loadComponent: () =>
          import('./features/identity-access/presentation/pages/verify-email/verify-email').then(m => m.VerifyEmail)
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/identity-access/presentation/pages/forgot-password/forgot-password').then(m => m.ForgotPassword)
      }
    ]
  },
  { path: '**', redirectTo: '/auth/login' }
];

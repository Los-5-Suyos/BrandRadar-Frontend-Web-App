import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./iam/presentation/pages/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./iam/presentation/pages/forgot-password/forgot-password.component')
      .then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./iam/presentation/pages/register/register.component')
      .then(m => m.RegisterComponent)
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./iam/presentation/pages/verify-email/verify-email.component')
      .then(m => m.VerifyEmailComponent)
  },
  { path: '**', redirectTo: 'login' },
  {
    path: 'subscription',
    loadComponent: () => import('./iam/presentation/pages/subscription/subscription.component')
      .then(m => m.SubscriptionComponent)
  }
];

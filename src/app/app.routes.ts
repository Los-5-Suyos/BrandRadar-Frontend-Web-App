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
  {
    path: 'subscription',
    loadComponent: () => import('./iam/presentation/pages/subscription/subscription.component')
      .then(m => m.SubscriptionComponent)
  },
  {
    path: 'payment',
    loadComponent: () => import('./iam/presentation/pages/payment/payment.component')
      .then(m => m.PaymentComponent)
  },
  {
    path: 'workspace',
    loadComponent: () => import('./iam/presentation/pages/workspace/workspace.component')
      .then(m => m.WorkspaceComponent)
  },
  {
    path: 'success',
    loadComponent: () => import('./iam/presentation/pages/success/success.component')
      .then(m => m.SuccessComponent)
  },
  { path: '**', redirectTo: 'login' }
];

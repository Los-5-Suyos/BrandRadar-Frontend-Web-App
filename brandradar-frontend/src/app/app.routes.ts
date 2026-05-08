import { Routes } from '@angular/router';
import { DashboardComponent } from './features/reputation-monitoring/presentation/pages/dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
];

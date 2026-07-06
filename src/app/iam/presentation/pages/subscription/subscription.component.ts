import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { OnboardingSidebarComponent } from './../../../../shared/components/onboarding-sidebar/onboarding-sidebar.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, OnboardingSidebarComponent],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css',
})
export class SubscriptionComponent implements OnInit {
  router = inject(Router);
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  selectedPlan = '';

  currentSubscription: any = null;
  loadingCurrentPlan = true;
  cancelando = false;

  get workspaceId() {
    return typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceId') : null;
  }

  get tienePlanPago(): boolean {
    return (
      this.currentSubscription?.status === 'ACTIVE' &&
      (this.currentSubscription?.plan === 'PRO' || this.currentSubscription?.plan === 'ENTERPRISE')
    );
  }

  ngOnInit() {
    if (!this.workspaceId) {
      this.loadingCurrentPlan = false;
      return;
    }
    this.http.get<any>(`${this.baseUrl}/workspaces/${this.workspaceId}/subscription`).subscribe({
      next: (data) => {
        this.currentSubscription = data;
        this.loadingCurrentPlan = false;
      },
      error: () => {
        this.loadingCurrentPlan = false;
      }, // sin suscripción de pago todavía: normal en FREE
    });
  }

  cancelarSuscripcion() {
    if (!this.workspaceId) return;
    this.cancelando = true;
    this.http
      .post<any>(`${this.baseUrl}/workspaces/${this.workspaceId}/subscription/cancel`, {})
      .subscribe({
        next: (data) => {
          this.currentSubscription = data;
          localStorage.setItem('workspacePlan', 'FREE');
          this.cancelando = false;
        },
        error: () => {
          this.cancelando = false;
        },
      });
  }

  continue() {
    if (!this.selectedPlan) {
      alert('Selecciona un plan para continuar');
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedPlan', this.selectedPlan);
    }
    if (this.selectedPlan === 'enterprise') {
      window.open('https://brandradar-landing-page.netlify.app/pages/contact', '_blank');
      return;
    }
    if (this.selectedPlan === 'basico') {
      this.router.navigate(['/workspace']);
      return;
    }
    this.router.navigate(['/workspace']);
  }
}

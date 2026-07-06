import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { OnboardingSidebarComponent } from './../../../../shared/components/onboarding-sidebar/onboarding-sidebar.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, OnboardingSidebarComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css',
})
export class PaymentComponent {
  router = inject(Router);
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  billingPeriod = 'mensual';
  cardName = '';
  cardNumber = '';
  expiry = '';
  cvc = '';

  paying = false;
  paymentError = '';

  get selectedPlan() {
    return typeof window !== 'undefined' ? localStorage.getItem('selectedPlan') || 'pro' : 'pro';
  }

  pay() {
    const workspaceId =
      typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceId') : null;
    if (!workspaceId) {
      this.paymentError = 'Primero debes crear tu workspace.';
      this.router.navigate(['/workspace']);
      return;
    }
    if (
      !this.cardName.trim() ||
      !this.cardNumber.trim() ||
      !this.expiry.trim() ||
      !this.cvc.trim()
    ) {
      this.paymentError = 'Completa todos los datos de la tarjeta.';
      return;
    }

    this.paying = true;
    this.paymentError = '';

    const plan = this.selectedPlan === 'enterprise' ? 'ENTERPRISE' : 'PRO';
    const billingPeriod = this.billingPeriod === 'anual' ? 'ANUAL' : 'MENSUAL';

    this.http
      .post(`${this.baseUrl}/workspaces/${workspaceId}/subscription`, {
        plan,
        billingPeriod,
        cardName: this.cardName,
        cardNumber: this.cardNumber,
        expiry: this.expiry,
        cvc: this.cvc,
      })
      .subscribe({
        next: () => {
          this.paying = false;
          localStorage.setItem('selectedPlan', this.selectedPlan);
          localStorage.setItem('workspacePlan', plan);
          this.router.navigate(['/success']);
        },
        error: () => {
          this.paying = false;
          this.paymentError = 'No se pudo procesar el pago. Verifica los datos de tu tarjeta.';
        },
      });
  }
}

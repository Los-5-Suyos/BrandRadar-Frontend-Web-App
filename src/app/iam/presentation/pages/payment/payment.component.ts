import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OnboardingSidebarComponent } from './../../../../shared/components/onboarding-sidebar/onboarding-sidebar.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, OnboardingSidebarComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent {
  router = inject(Router);
  billingPeriod = 'mensual';
  cardName = '';
  cardNumber = '';
  expiry = '';
  cvc = '';

  get selectedPlan() {
    return typeof window !== 'undefined' ? localStorage.getItem('selectedPlan') || 'pro' : 'pro';
  }

  pay() {
    if (!this.selectedPlan) {
      alert('Selecciona un plan para continuar');
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedPlan', this.selectedPlan);
    }
    this.router.navigate(['/workspace']);
  }

}

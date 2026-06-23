import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css'
})
export class SubscriptionComponent {
  router = inject(Router);
  selectedPlan = '';

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
      this.router.navigate(['/dashboard']);
      return;
    }
    this.router.navigate(['/payment']);
  }
}

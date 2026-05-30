import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subscription-step',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-step.html',
  styleUrl: './subscription-step.css',
})
export class SubscriptionStepComponent {
  @Output() planSelected = new EventEmitter<{plan: string, billing: string}>();

  billing = signal<'monthly' | 'annual'>('monthly');
  selectedPlan = signal('pro');

  plans = [
    {
      id: 'free', tag: 'PLAN', name: 'Básico',
      desc: 'Empieza a escuchar lo que dicen de ti',
      price: { monthly: 0, annual: 0 }, priceSuffix: '/mes', badge: 'Gratis',
      features: ['1 marca monitoreada','5 palabras clave','500 menciones/mes','Fuentes limitadas','Historial de 7 días','Alertas por email'],
      cta: 'COMENZAR GRATIS', ctaNote: 'sin tarjeta de crédito', popular: false,
    },
    {
      id: 'pro', tag: 'PLAN', name: 'Pro',
      desc: 'Gestiona tu reputación antes de que sea una crisis',
      price: { monthly: 49, annual: 39 }, priceSuffix: '/mes', badge: null,
      features: ['Monitorea varias marcas','10,000 menciones/mes','Fuentes: Redes + Noticias + Blogs','Gestión y análisis completa de incidentes','Reportes PDF','Soporte por chat'],
      cta: 'SELECCIONAR', ctaNote: null, popular: true,
    },
    {
      id: 'enterprise', tag: 'PLAN', name: 'Enterprise',
      desc: 'Control total para agencias y corporativos',
      price: { monthly: null, annual: null }, priceSuffix: null, badge: null,
      features: ['Marcas y usuarios ilimitados','Menciones ilimitadas','Alertas SMS + Slack + Teams','Reportes White-label','Acceso completo a API','Onboarding personalizado'],
      cta: 'CONTACTAR VENTAS', ctaNote: null, popular: false,
    },
  ];

  selectPlan(id: string) {
    this.selectedPlan.set(id);
  }

  continue() {
    this.planSelected.emit({ plan: this.selectedPlan(), billing: this.billing() });
  }
}

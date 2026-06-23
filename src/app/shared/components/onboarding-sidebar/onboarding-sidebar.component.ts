import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-onboarding-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-sidebar.component.html',
  styleUrl: './onboarding-sidebar.component.css'
})
export class OnboardingSidebarComponent {
  @Input() activeStep: 'cuenta' | 'verificacion' | 'suscripcion' | 'workspace' | 'success' = 'cuenta';

  isDone(step: string): boolean {
    const order = ['cuenta', 'verificacion', 'suscripcion', 'workspace', 'success'];
    return order.indexOf(step) < order.indexOf(this.activeStep);
  }

}


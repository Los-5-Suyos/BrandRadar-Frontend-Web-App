import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// Step components
import { AccountStepComponent } from './steps/account/account-step';
import { VerificationStepComponent } from './steps/verification/verification-step';
import { SubscriptionStepComponent } from './steps/subscription/subscription-step';
import { PaymentStepComponent } from './steps/payment/payment-step';
import { WorkspaceSetupStepComponent } from './steps/workspace-setup/workspace-setup-step';
import { CompleteStepComponent } from './steps/complete/complete-step';

export interface RegisterData {
  // Account
  name: string;
  username: string;
  email: string;
  password: string;
  accountType: string;
  userId?: string;
  // Subscription
  plan: string;
  billingCycle: string;
  // Workspace
  workspaceName: string;
  domain: string;
  timezone: string;
  teamEmails: string[];
  workspaceId?: string;
}

@Component({
  selector: 'app-register-wizard',
  standalone: true,
  imports: [CommonModule, RouterLink,
    AccountStepComponent, VerificationStepComponent, SubscriptionStepComponent,
    PaymentStepComponent, WorkspaceSetupStepComponent, CompleteStepComponent],
  templateUrl: './register-wizard.html',
  styleUrl: './register-wizard.css',
})
export class RegisterWizardComponent {
  readonly API = 'http://localhost:3000';

  currentStep = signal(0); // 0=Account, 1=Verify, 2=Subscription, 3=Payment, 4=Workspace, 5=Complete
  data = signal<RegisterData>({
    name: '', username: '', email: '', password: '', accountType: 'PyME',
    plan: 'pro', billingCycle: 'monthly',
    workspaceName: '', domain: '', timezone: '(GMT-05:00) Lima', teamEmails: [],
  });

  steps = [
    { label: 'Cuenta', icon: 'person' },
    { label: 'Verificación', icon: 'shield' },
    { label: 'Suscripción', icon: 'subscriptions' },
    { label: 'Workspace', icon: 'workspaces' },
  ];

  constructor(private http: HttpClient, public router: Router) {}

  goBack() {
    if (this.currentStep() > 0) this.currentStep.update(s => s - 1);
    else this.router.navigate(['/auth/login']);
  }

  onAccountNext(accountData: Partial<RegisterData>) {
    this.data.update(d => ({ ...d, ...accountData }));
    // Register user
    const d = this.data();
    this.http.post<any>(`${this.API}/auth/register`, {
      name: d.name, email: d.email, password: d.password, accountType: d.accountType, username: d.username
    }).subscribe({
      next: (res) => {
        this.data.update(dd => ({ ...dd, userId: res.id }));
        this.currentStep.set(1);
      },
      error: (err) => {
        // still advance for demo
        this.data.update(dd => ({ ...dd, userId: 'u-demo-' + Date.now() }));
        this.currentStep.set(1);
      }
    });
  }

  onVerified() {
    this.currentStep.set(2);
  }

  onPlanSelected(plan: string, billing: string) {
    this.data.update(d => ({ ...d, plan, billingCycle: billing }));
    if (plan === 'free') {
      this.currentStep.set(4); // skip payment
    } else {
      this.currentStep.set(3);
    }
  }

  onPaymentDone() {
    this.currentStep.set(4);
  }

  onWorkspaceDone(wsData: Partial<RegisterData>) {
    this.data.update(d => ({ ...d, ...wsData }));
    const d = this.data();
    this.http.post<any>(`${this.API}/workspaces`, {
      name: d.workspaceName || 'Mi Workspace',
      domain: d.domain,
      timezone: d.timezone,
      ownerId: d.userId || 'u-demo',
      status: 'ACTIVA',
      plan: d.plan,
    }).subscribe({
      next: (res) => { this.data.update(dd => ({ ...dd, workspaceId: res.id })); },
      error: () => {}
    });
    this.currentStep.set(5);
  }

  goToDashboard() {
    this.router.navigate(['/auth/login']);
  }
}

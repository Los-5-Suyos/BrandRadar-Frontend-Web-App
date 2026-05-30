import { Component, Input, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-step.html',
  styleUrl: './payment-step.css',
})
export class PaymentStepComponent {
  @Input() plan = 'pro';
  @Input() billing = 'monthly';
  @Output() paymentDone = new EventEmitter<void>();

  billingTab = signal<'monthly'|'annual'>('monthly');
  cardName = '';
  cardNumber = '';
  expiry = '';
  cvv = '';
  loading = signal(false);
  error = signal('');

  get price() { return this.billingTab() === 'monthly' ? 49 : 39; }

  formatCard(event: Event) {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 16);
    input.value = v.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.cardNumber = input.value;
  }

  pay() {
    this.error.set('');
    if (!this.cardName || !this.cardNumber || !this.expiry || !this.cvv) {
      this.error.set('Por favor completa todos los campos de pago.'); return;
    }
    this.loading.set(true);
    setTimeout(() => { this.loading.set(false); this.paymentDone.emit(); }, 1500);
  }
}

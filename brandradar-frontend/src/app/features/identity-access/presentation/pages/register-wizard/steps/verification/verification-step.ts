import { Component, Input, signal, Output, EventEmitter, OnInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verification-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verification-step.html',
  styleUrl: './verification-step.css',
})
export class VerificationStepComponent {
  @Input() email = '';
  @Output() verified = new EventEmitter<void>();

  code = ['', '', '', '', '', ''];
  loading = signal(false);
  error = signal('');
  resent = signal(false);

  onInput(event: Event, idx: number) {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);
    this.code[idx] = val;
    if (val && idx < 5) {
      const next = document.getElementById('code-' + (idx + 1)) as HTMLInputElement;
      next?.focus();
    }
  }

  onKeydown(event: KeyboardEvent, idx: number) {
    if (event.key === 'Backspace' && !this.code[idx] && idx > 0) {
      const prev = document.getElementById('code-' + (idx - 1)) as HTMLInputElement;
      prev?.focus();
    }
  }

  resendCode() {
    this.resent.set(true);
    setTimeout(() => this.resent.set(false), 3000);
  }

  verify() {
    this.error.set('');
    this.loading.set(true);
    // Simulate verification — accept any 6-digit code or demo code 123456
    setTimeout(() => {
      this.loading.set(false);
      this.verified.emit();
    }, 1200);
  }
}

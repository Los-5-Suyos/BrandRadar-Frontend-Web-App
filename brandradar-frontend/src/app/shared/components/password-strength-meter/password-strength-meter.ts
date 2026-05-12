import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export type PasswordStrength = 'none' | 'weak' | 'medium' | 'strong';

@Component({
  selector: 'app-password-strength-meter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './password-strength-meter.html',
  styleUrl: './password-strength-meter.css',
})
export class PasswordStrengthMeter implements OnChanges {
  @Input() password = '';
  strength: PasswordStrength = 'none';

  ngOnChanges(): void {
    this.strength = this.evaluate(this.password);
  }

  private evaluate(pw: string): PasswordStrength {
    if (!pw) return 'none';
    let score = 0;
    if (pw.length >= 8) score++;
    if (/\d/.test(pw)) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    if (score <= 1) return 'weak';
    if (score <= 2) return 'medium';
    return 'strong';
  }

  barColor(idx: number): string {
    const colors: Record<PasswordStrength, string[]> = {
      none:   ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.12)'],
      weak:   ['#f87171', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.12)'],
      medium: ['#fbbf24', '#fbbf24', 'rgba(255,255,255,0.12)'],
      strong: ['#34d399', '#34d399', '#34d399'],
    };
    return colors[this.strength][idx];
  }

  get label(): string {
    const labels: Record<PasswordStrength, string> = { none: '', weak: 'Débil', medium: 'Media', strong: 'Fuerte' };
    return labels[this.strength];
  }
  get labelColor(): string {
    const colors: Record<PasswordStrength, string> = { none: '', weak: '#f87171', medium: '#fbbf24', strong: '#34d399' };
    return colors[this.strength];
  }
}

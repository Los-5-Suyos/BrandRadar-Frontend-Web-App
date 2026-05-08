import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export type PasswordStrength = 'empty' | 'weak' | 'medium' | 'strong';

interface StrengthResult {
  level: PasswordStrength;
  score: number;       // 0-100
  label: string;
  feedback: string[];
}

function evaluatePassword(password: string): StrengthResult {
  if (!password) return { level: 'empty', score: 0, label: '', feedback: [] };

  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8)  { score += 25; } else { feedback.push('Al menos 8 caracteres'); }
  if (password.length >= 12) { score += 10; }
  if (/[A-Z]/.test(password)) { score += 20; } else { feedback.push('Una letra mayúscula'); }
  if (/[a-z]/.test(password)) { score += 15; } else { feedback.push('Una letra minúscula'); }
  if (/[0-9]/.test(password)) { score += 20; } else { feedback.push('Un número'); }
  if (/[^A-Za-z0-9]/.test(password)) { score += 10; } else { feedback.push('Un carácter especial'); }

  score = Math.min(score, 100);

  let level: PasswordStrength = 'weak';
  let label = 'Débil';
  if (score >= 75) { level = 'strong'; label = 'Fuerte'; }
  else if (score >= 45) { level = 'medium'; label = 'Media'; }

  return { level, score, label, feedback };
}

@Component({
  selector: 'app-password-strength-meter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './password-strength-meter.html',
  styleUrl: './password-strength-meter.css'
})
export class PasswordStrengthMeter implements OnChanges {
  @Input() password: string = '';

  result: StrengthResult = { level: 'empty', score: 0, label: '', feedback: [] };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['password']) {
      this.result = evaluatePassword(this.password);
    }
  }

  get segments(): boolean[] {
    const { score } = this.result;
    return [score >= 25, score >= 50, score >= 75, score >= 90];
  }
}

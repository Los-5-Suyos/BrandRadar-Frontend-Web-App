import { Component, signal, computed, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account-step',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './account-step.html',
  styleUrl: './account-step.css',
})
export class AccountStepComponent {
  @Output() next = new EventEmitter<any>();
  @Output() backToLogin = new EventEmitter<void>();

  name = '';
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  accountType = signal<string>('PyME');
  showPassword = signal(false);
  loading = signal(false);
  error = signal('');

  passwordStrength = computed(() => {
    const p = this.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    return s;
  });

  accountTypes = [
    { value: 'PyME', icon: 'store', label: 'PyME', desc: 'Para negocios en crecimiento que buscan monitorear su impacto local.' },
    { value: 'Agencia de Marketing', icon: 'campaign', label: 'Agencia de Marketing', desc: 'Gestión multicliente y reportes avanzados para clientes exigentes.' },
    { value: 'Corporativo', icon: 'corporate_fare', label: 'Corporativo', desc: 'Solución empresarial con gestión multi-marca y analítica avanzada.' },
  ];

  selectType(v: string) { this.accountType.set(v); }
  togglePassword() { this.showPassword.update(v => !v); }

  strengthLabel = computed(() => ['', 'Débil', 'Media', 'Fuerte'][this.passwordStrength()]);
  strengthColor = computed(() => ['', '#ef4444', '#f59e0b', '#22c55e'][this.passwordStrength()]);

  onSubmit() {
    this.error.set('');
    if (!this.name || !this.username || !this.email || !this.password) {
      this.error.set('Por favor completa todos los campos.'); return;
    }
    if (this.password !== this.confirmPassword) {
      this.error.set('Las contraseñas no coinciden.'); return;
    }
    if (this.password.length < 8) {
      this.error.set('La contraseña debe tener al menos 8 caracteres.'); return;
    }
    this.loading.set(true);
    this.next.emit({ name: this.name, username: this.username, email: this.email, password: this.password, accountType: this.accountType() });
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-inline-field-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inline-field-error.html',
  styleUrl: './inline-field-error.css'
})
export class InlineFieldError {
  @Input() control!: AbstractControl | null;
  @Input() label: string = 'Campo';

  get errorMessage(): string | null {
    if (!this.control || !this.control.errors || !this.control.touched) return null;
    const e = this.control.errors;
    if (e['required'])         return `${this.label} es requerido.`;
    if (e['email'])            return `Ingresa un correo electrónico válido.`;
    if (e['minlength'])        return `Mínimo ${e['minlength'].requiredLength} caracteres.`;
    if (e['maxlength'])        return `Máximo ${e['maxlength'].requiredLength} caracteres.`;
    if (e['invalidPassword'])  return `La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.`;
    if (e['passwordMismatch']) return `Las contraseñas no coinciden.`;
    if (e['emailTaken'])       return `Este email ya está registrado.`;
    return 'Campo inválido.';
  }

  get showError(): boolean {
    return !!this.control?.touched && !!this.control?.errors;
  }
}

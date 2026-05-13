import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.css',
})
export class ConfirmationModal {
  @Input() title: string = '';
  @Input() message: string = '¿Desea conectar esta fuente de datos?';

  // Eventos para avisar al componente padre qué eligió el usuario
  @Output() onConfirm = new EventEmitter<string>();
  @Output() onClose = new EventEmitter<void>();

  apiKey: string = '';

  confirm() {
    this.onConfirm.emit(this.apiKey);
  }

  close() {
    this.onClose.emit();
  }
}

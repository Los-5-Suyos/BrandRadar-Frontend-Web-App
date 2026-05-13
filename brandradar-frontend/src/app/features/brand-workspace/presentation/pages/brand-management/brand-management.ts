import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Audit } from '../../../../../core/services/audit';
import { ConfirmationModal } from '../../../../../shared/components/confirmation-modal/confirmation-modal';

@Component({
  selector: 'app-brand-management',
  standalone: true,
  imports: [CommonModule, ConfirmationModal],
  templateUrl: './brand-management.html',
  styleUrl: './brand-management.css',
})
export class BrandManagement {
  private audit = inject(Audit);
  showModal = false;

  handleDeactivate() {
    this.showModal = true;
  }

  onConfirmDeactivation() {
    // T35b: Registrar el evento de auditoría al confirmar
    this.audit.logBrandDeactivation('ID-MARCA-ACTUAL').subscribe({
      next: () => {
        alert('Marca desactivada y evento registrado.');
        this.showModal = false;
      },
    });
  }
}

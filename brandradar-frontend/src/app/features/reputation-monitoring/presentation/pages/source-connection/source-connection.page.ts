import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SourceApi } from '../../../infrastructure/adapters/source-api';
import { SeverityBadge } from '../../../../../shared/components/severity-badge/severity-badge';
import { ConfirmationModal } from '../../../../../shared/components/confirmation-modal/confirmation-modal';

@Component({
  selector: 'app-source-connection',
  standalone: true,
  imports: [CommonModule, SeverityBadge, ConfirmationModal],
  templateUrl: './source-connection.page.html',
  styleUrls: ['./source-connection.page.css'],
})
export class SourceConnectionPage implements OnInit {
  public sources: any[] = [];

  public showModal: boolean = false;
  public selectedSource: any = null;

  // Usamos tu nuevo servicio
  private sourceService = inject(SourceApi);

  ngOnInit(): void {
    this.sourceService.getSources().subscribe((data) => {
      this.sources = data;
    });
  }

  handleAction(source: any) {
    // Caso 1: Desconectada -> Abrir Modal
    if (source.status === 'DESCONECTADA') {
      this.selectedSource = source;
      this.showModal = true;
    }

    // Caso 2: Error o Crítica -> Notificar Falla (T33 Requerimiento)
    else if (source.status === 'CRÍTICA' || source.status === 'ERROR') {
      this.sourceService.reportCriticalFailure(source.name);
      alert(
        `⚠️ ATENCIÓN: Se ha detectado una falla de infraestructura en ${source.name}. El equipo técnico ha sido notificado.`,
      );
    }

    // Caso 3: Conectada (Twitter) -> Simular entrada a gestión
    else if (source.status === 'CONECTADA') {
      console.log(`Abriendo configuración de ${source.name}...`);
      alert(
        `Entrando a la configuración de ${source.name}. El servicio está operando con normalidad.`,
      );
    }
  }

  // Se ejecuta cuando el usuario pulsa "Conectar ahora" en el modal
  confirmConnection(token: string) {
    if (token && token.trim() !== '') {
      console.log(`Token recibido para ${this.selectedSource.name}:`, token);

      // Cambiamos el estado localmente para feedback visual inmediato
      this.selectedSource.status = 'CONECTADA';
      this.closeModal();

      alert(`${this.selectedSource.name} se ha conectado exitosamente.`);
    } else {
      alert('Por favor, ingrese un token válido.');
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedSource = null;
  }
}

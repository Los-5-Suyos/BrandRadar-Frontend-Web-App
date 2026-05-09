import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MentionService } from '../../../../../infrastructure/services/mention.service';
import { AlertService } from '../../../../../infrastructure/services/alert.service';
import { AuditLogService } from '../../../../../infrastructure/services/audit-log.service';
import { Mention } from '../../../domain/models/mention.entity';

// Estructura para manejar los datos dinámicos del gráfico (Punto 6)
interface ChartData {
  score: number;
  barHeights: string[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  mentions: Mention[] = [];
  activeAlerts: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;
  filtroActual: string = '';

  // Datos simulados para los diferentes rangos de tiempo (Punto 6)
  private readonly PERIOD_DATA: Record<string, ChartData> = {
    '30': { score: 78.5, barHeights: ['60%', '80%', '45%', '90%', '65%', '75%'] },
    '7': { score: 85.2, barHeights: ['40%', '70%', '95%', '85%'] },
    '24': { score: 92.0, barHeights: ['90%', '95%'] },
  };

  currentChartData: ChartData = this.PERIOD_DATA['30'];
  reputationScore: number = this.currentChartData.score; // Se vincula al HTML

  constructor(
    private mentionService: MentionService,
    private alertService: AlertService,
    private auditLogService: AuditLogService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.escucharAlertas();
  }

  escucharAlertas(): void {
    this.alertService.getActiveAlerts().subscribe({
      next: (alerts) => {
        this.activeAlerts = alerts;
        this.cdr.detectChanges();
      },
    });
  }

  cargarDatos(): void {
    this.isLoading = true;
    this.mentionService.getMentionsWithPolling().subscribe({
      next: (data) => {
        this.mentions = data; // Punto 4: Ordenado por criticidad [cite: 35]
        this.errorMessage = data.length === 0 ? 'SIN_INCIDENTES_EN_CATEGORÍA' : '';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'ERROR_DE_CONEXIÓN_API';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Punto 6: Implementación del selector de rango temporal
  filtrarPorRango(event: any) {
    const dias = event.target.value;
    this.currentChartData = this.PERIOD_DATA[dias] || this.PERIOD_DATA['30'];
    this.reputationScore = this.currentChartData.score;

    // Punto 9: Registro obligatorio del evento SentimentTrendChanged
    this.auditLogService
      .logAction('SentimentTrendChanged', {
        rangeDays: dias,
        newScore: this.reputationScore,
        timestamp: new Date().toISOString(),
      })
      .subscribe();

    this.cdr.detectChanges();
  }

  filtrar(sentimiento: string) {
    this.filtroActual = sentimiento;
    this.errorMessage = '';

    this.mentionService.getMentionsWithPolling().subscribe((data) => {
      let resultados = data;
      if (sentimiento !== '') {
        resultados = data.filter((m) => m.sentiment === sentimiento);
      }

      if (resultados.length === 0) {
        this.errorMessage = 'SIN_INCIDENTES_EN_CATEGORÍA';
        this.mentions = [];
      } else {
        this.mentions = resultados;
      }

      this.auditLogService
        .logAction('MonitoringRuleUpdated', {
          filter: sentimiento || 'TODOS',
        })
        .subscribe();

      this.cdr.detectChanges();
    });
  }

  atenderCrisis(alertaId: string): void {
    this.auditLogService
      .logAction('INCIDENT_RESOLVED', {
        incidentId: alertaId,
      })
      .subscribe();

    this.activeAlerts = this.activeAlerts.filter((a) => a.id !== alertaId);
    alert('Incidente atendido y registrado.');
    this.cdr.detectChanges();
  }
}

import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

// Imports de Servicios e Infraestructura
import { MentionService } from '../../../../../infrastructure/services/mention.service';
import { AlertService } from '../../../../../infrastructure/services/alert.service';
import { AuditLogService } from '../../../../../infrastructure/services/audit-log.service';
import { PatternService } from '../../../../../infrastructure/services/pattern.service';
import { BrandService } from '../../../../../infrastructure/services/brand.service';
import { Mention } from '../../../domain/models/mention.entity';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Estado del Dashboard
  mentions: Mention[] = [];
  activeAlerts: any[] = [];
  patterns: any[] = [];
  reputationScore: number = 0;

  // UI State
  errorMessage: string = '';
  isLoading: boolean = true;
  filtroActual: string = '';
  private subscriptions: Subscription = new Subscription();

  constructor(
    private mentionService: MentionService,
    private alertService: AlertService,
    private auditLogService: AuditLogService,
    private patternService: PatternService,
    private brandService: BrandService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.iniciarSincronizacion();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  iniciarSincronizacion(): void {
    // 1. Polling de Menciones (Sincronización automática cada 5-10s configurada en el service)
    this.subscriptions.add(
      this.mentionService.getMentionsWithPolling().subscribe((data) => {
        this.isLoading = false;
        this.mentions = this.filtroActual
          ? data.filter((m) => m.sentiment === this.filtroActual)
          : data;
        this.cdr.detectChanges();
      }),
    );

    // 2. Polling de Reputation Score (Brand Data)
    this.subscriptions.add(
      this.brandService.getBrandById('b-001').subscribe((brand) => {
        this.reputationScore = brand.reputationScore;
        this.cdr.detectChanges();
      }),
    );

    // 3. Polling de Alertas Críticas
    this.subscriptions.add(
      this.alertService.getActiveAlerts().subscribe((alerts) => {
        // Solo mostrar alertas que no han sido resueltas
        this.activeAlerts = alerts.filter((a) => a.status !== 'RESOLVED');
        this.cdr.detectChanges();
      }),
    );

    // 4. Polling de Patrones Sospechosos
    this.subscriptions.add(
      this.patternService.getPatterns('b-001').subscribe((data) => {
        this.patterns = data.filter((p) => p.status === 'ACTIVE');
        this.cdr.detectChanges();
      }),
    );
  }

  /**
   * Filtra las menciones y registra la acción en el Audit Log
   */
  filtrar(sentimiento: string): void {
    this.filtroActual = sentimiento;
    this.mentionService.getMentions().subscribe((data) => {
      this.mentions = sentimiento ? data.filter((m) => m.sentiment === sentimiento) : data;

      // Requerimiento DDD: Mensaje específico si no hay datos
      this.errorMessage = this.mentions.length === 0 ? 'SIN_INCIDENTES_EN_CATEGORÍA' : '';

      // REGISTRO AUTOMÁTICO EN AUDIT LOG
      this.auditLogService
        .logAction('MonitoringRuleUpdated', {
          filter: sentimiento || 'TODOS',
          timestamp: new Date().toISOString(),
        })
        .subscribe();

      this.cdr.detectChanges();
    });
  }

  /**
   * Resuelve una alerta de crisis y registra el evento
   */
  atenderCrisis(alertaId: string): void {
    this.alertService.resolverAlerta(alertaId).subscribe(() => {
      this.activeAlerts = this.activeAlerts.filter((a) => a.id !== alertaId);

      // REGISTRO AUTOMÁTICO EN AUDIT LOG
      this.auditLogService
        .logAction('AlertAcknowledged', {
          alertId: alertaId,
          status: 'RESOLVED',
        })
        .subscribe();

      this.cdr.detectChanges();
    });
  }

  /**
   * Descarta un patrón detectado y guarda la trazabilidad
   */
  descartarPatron(id: string): void {
    this.patternService.dismissPattern(id).subscribe(() => {
      this.patterns = this.patterns.filter((p) => p.id !== id);

      // REGISTRO AUTOMÁTICO EN AUDIT LOG
      this.auditLogService
        .logAction('PatternDismissed', {
          patternId: id,
          reason: 'Manual Dismissal by User',
        })
        .subscribe();

      this.cdr.detectChanges();
    });
  }

  /**
   * Simula la exportación y registra la generación del reporte
   */
  exportarReporte(formato: string): void {
    // REGISTRO AUTOMÁTICO EN AUDIT LOG
    this.auditLogService
      .logAction('ReputationReportGenerated', {
        format: formato,
        brandId: 'b-001',
        generatedAt: new Date().toISOString(),
      })
      .subscribe(() => {
        alert(
          `Reporte ${formato} generado exitosamente. Se ha registrado en la bitácora de auditoría.`,
        );
      });
  }
}

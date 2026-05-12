import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
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
  mentions: Mention[] = [];
  activeAlerts: any[] = [];
  patterns: any[] = [];
  reputationScore = 0;
  isLoading = true;
  filtroActual = '';
  sidebarOpen = false;
  activeNav = 'Incidentes';
  private subs = new Subscription();

  today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  workspace = (() => {
    try {
      return JSON.parse(localStorage.getItem('brandradar_workspace') || '{}');
    } catch {
      return {};
    }
  })();

  navItems = [
    { label: 'Dashboard', icon: 'dashboard' },
    { label: 'Incidentes', icon: 'incident', badge: 3 },
    { label: 'Menciones', icon: 'mention' },
    { label: 'Mis Marcas', icon: 'brand' },
    { label: 'Reglas', icon: 'rule' },
    { label: 'Reportes', icon: 'report' },
    { label: 'Infraestructura', icon: 'infra' },
  ];

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
    this.subs.unsubscribe();
  }

  iniciarSincronizacion(): void {
    this.subs.add(
      this.mentionService.getMentionsWithPolling().subscribe((data) => {
        this.isLoading = false;
        this.mentions = this.filtroActual
          ? data.filter((m) => m.sentiment === this.filtroActual)
          : data;
        this.cdr.detectChanges();
      }),
    );
    this.subs.add(
      this.brandService.getBrandById('b-001').subscribe((brand) => {
        this.reputationScore = brand.reputationScore;
        this.cdr.detectChanges();
      }),
    );
    this.subs.add(
      this.alertService.getActiveAlerts().subscribe((alerts) => {
        this.activeAlerts = alerts.filter((a) => a.status !== 'RESOLVED');
        this.cdr.detectChanges();
      }),
    );
    this.subs.add(
      this.patternService.getPatterns('b-001').subscribe((data) => {
        this.patterns = data.filter((p) => p.status === 'ACTIVE');
        this.cdr.detectChanges();
      }),
    );
  }

  filtrar(sentimiento: string): void {
    this.filtroActual = sentimiento;
    this.mentionService.getMentions().subscribe((data) => {
      this.mentions = sentimiento ? data.filter((m) => m.sentiment === sentimiento) : data;
      this.auditLogService
        .logAction('MonitoringRuleUpdated', {
          filter: sentimiento || 'TODOS',
          timestamp: new Date().toISOString(),
        })
        .subscribe();
      this.cdr.detectChanges();
    });
  }

  atenderCrisis(alertaId: string): void {
    this.alertService.resolverAlerta(alertaId).subscribe(() => {
      this.activeAlerts = this.activeAlerts.filter((a) => a.id !== alertaId);
      this.auditLogService
        .logAction('AlertAcknowledged', { alertId: alertaId, status: 'RESOLVED' })
        .subscribe();
      this.cdr.detectChanges();
    });
  }

  descartarPatron(id: string): void {
    this.patternService.dismissPattern(id).subscribe(() => {
      this.patterns = this.patterns.filter((p) => p.id !== id);
      this.auditLogService
        .logAction('PatternDismissed', { patternId: id, reason: 'Manual Dismissal by User' })
        .subscribe();
      this.cdr.detectChanges();
    });
  }

  exportarReporte(formato: string): void {
    this.auditLogService
      .logAction('ReputationReportGenerated', {
        format: formato,
        brandId: 'b-001',
        generatedAt: new Date().toISOString(),
      })
      .subscribe(() => {
        alert(`Reporte ${formato} generado exitosamente.`);
      });
  }

  getSeverityLabel(s: string): string {
    const map: Record<string, string> = {
      CRITICAL: 'Crítico',
      HIGH: 'Alto',
      MEDIUM: 'Medio',
      LOW: 'Bajo',
    };
    return map[s] || s;
  }
  getSeverityClass(s: string): string {
    const map: Record<string, string> = {
      CRITICAL: 'badge--critical',
      HIGH: 'badge--high',
      MEDIUM: 'badge--medium',
      LOW: 'badge--low',
    };
    return map[s] || '';
  }
  getSourceIcon(source?: string): string {
    if (!source) return '🌐';

    switch (source.toLowerCase()) {
      case 'twitter':
        return '🐦';
      case 'facebook':
        return '📘';
      case 'instagram':
        return '📸';
      default:
        return '🌐';
    }
  }

  getTimeAgo(timestamp?: Date | string): string {
    if (!timestamp) return 'Sin fecha';

    const date = new Date(timestamp);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 60) {
      return `${diffMin} min`;
    }

    const diffHours = Math.floor(diffMin / 60);

    if (diffHours < 24) {
      return `${diffHours} h`;
    }

    const diffDays = Math.floor(diffHours / 24);

    return `${diffDays} d`;
  }

  get criticalCount(): number {
    return this.activeAlerts.filter((a) => a.severityLevel === 'CRITICAL').length;
  }
  get highCount(): number {
    return this.activeAlerts.filter((a) => a.severityLevel === 'HIGH').length;
  }
  get mediumCount(): number {
    return this.activeAlerts.filter((a) => a.severityLevel === 'MEDIUM').length;
  }
  get resolvedCount(): number {
    return this.mentions.filter((m) => m.sentiment === 'POSITIVO').length;
  }

  logout(): void {
    localStorage.removeItem('brandradar_token');
    localStorage.removeItem('brandradar_user');
    localStorage.removeItem('brandradar_workspace');
    window.location.href = '/auth/login';
  }
}

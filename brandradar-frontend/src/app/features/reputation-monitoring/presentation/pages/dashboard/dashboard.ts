import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

import { MentionService } from '../../../../../infrastructure/services/mention.service';
import { AlertService } from '../../../../../infrastructure/services/alert.service';
import { AuditLogService } from '../../../../../infrastructure/services/audit-log.service';
import { PatternService } from '../../../../../infrastructure/services/pattern.service';
import { BrandService } from '../../../../../infrastructure/services/brand.service';
import { WorkspaceStateService } from '../../../../../core/services/workspace-state';
import { Mention } from '../../../domain/models/mention.entity';
import { ENDPOINTS, API_BASE_URL } from '../../../../../infrastructure/api/api-endpoints';

/** Punto de datos para la gráfica de tendencia de sentimiento (7 días) */
interface SentimentPoint {
  label: string;   // "Lun", "Mar", etc.
  positive: number;
  negative: number;
}

/** Regla de monitoreo disparada hoy */
interface FiredRule {
  keyword: string;
  count: number;
}

/** Estado de una fuente de datos */
interface SourceStatus {
  name: string;
  icon: string;
  status: 'online' | 'degraded' | 'offline';
  lastCheck: string;
}

/**
 * T30 · US11 — Dashboard Principal de Reputación
 *
 * Secciones obligatorias según el spec:
 *  Header   — workspace activo + marca seleccionada + Reputation Index (semáforo)
 *  Sección 1 — Incidentes activos (últimos 5, badge severidad, fuente, tiempo, botón "Ver")
 *  Sección 2 — Reglas disparadas hoy (keywords + conteo)
 *  Sección 3 — Estado de fuentes (Twitter/X, Instagram, Google Reviews)
 *  Sección 4 — Tendencia de sentimiento (gráfica SVG 7 días)
 *
 * DDD: el dashboard muestra comportamiento del dominio, no solo persistencia.
 * "Incidente crítico detectado hace 2h sin respuesta" es comportamiento del dominio.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {

  // ── Datos del dominio ────────────────────────────────────────
  mentions: Mention[]       = [];
  activeAlerts: any[]       = [];
  patterns: any[]           = [];
  reputationScore           = 0;
  firedRules: FiredRule[]   = [];
  sentimentTrend: SentimentPoint[] = [];
  sourceStatuses: SourceStatus[]   = [];

  // ── Estado UI ────────────────────────────────────────────────
  isLoading    = true;
  filtroActual = '';
  sidebarOpen  = false;
  activeNav    = 'Dashboard';
  private subs = new Subscription();

  // ── Contexto del workspace (desde WorkspaceStateService) ─────
  workspaceName = 'BrandRadar Agency';
  brandName     = 'Marca principal';

  today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  navItems = [
    { label: 'Dashboard',      icon: 'dashboard' },
    { label: 'Incidentes',     icon: 'incident',  badge: 0 },
    { label: 'Menciones',      icon: 'mention' },
    { label: 'Mis Marcas',     icon: 'brand' },
    { label: 'Reglas',         icon: 'rule' },
    { label: 'Reportes',       icon: 'report' },
    { label: 'Infraestructura',icon: 'infra' },
  ];

  constructor(
    private readonly mentionService:  MentionService,
    private readonly alertService:    AlertService,
    private readonly auditLogService: AuditLogService,
    private readonly patternService:  PatternService,
    private readonly brandService:    BrandService,
    private readonly wsState:         WorkspaceStateService,
    private readonly router:          Router,
    private readonly http:            HttpClient,
    private readonly cdr:             ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Leer workspace y marca activos del estado global
    const ws    = this.wsState.activeWorkspace;
    const brand = this.wsState.activeBrand;
    if (ws)    this.workspaceName = ws.name;
    if (brand) this.brandName     = brand.name;

    this._initSourceStatuses();
    this._initSentimentTrend();
    this._loadFiredRules();
    this._startPolling();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ── Inicialización ───────────────────────────────────────────

  private _startPolling(): void {
    // Menciones con polling
    this.subs.add(
      this.mentionService.getMentionsWithPolling().subscribe((data) => {
        this.isLoading = false;
        this.mentions  = this.filtroActual
          ? data.filter((m) => m.sentiment === this.filtroActual)
          : data;
        this._updateNavBadge();
        this.cdr.detectChanges();
      }),
    );

    // Reputation score de la marca activa
    this.subs.add(
      this.brandService.getBrandById('b-001').subscribe((brand) => {
        this.reputationScore = brand?.reputationScore ?? 74;
        this.cdr.detectChanges();
      }),
    );

    // Alertas activas (incidentes)
    this.subs.add(
      this.alertService.getActiveAlerts().subscribe({
        next: (alerts) => {
          const filtered = alerts.filter((a) => a.status !== 'RESOLVED').slice(0, 5);
          // Si la API devuelve datos reales los usamos; si no, mantenemos el fallback demo
          if (filtered.length > 0) {
            this.activeAlerts = filtered;
          } else if (this.activeAlerts.length === 0) {
            this.activeAlerts = this._demoAlerts();
          }
          this._updateNavBadge();
          this.cdr.detectChanges();
        },
        error: () => {
          if (this.activeAlerts.length === 0) {
            this.activeAlerts = this._demoAlerts();
            this._updateNavBadge();
            this.cdr.detectChanges();
          }
        },
      }),
    );

    // Patrones activos
    this.subs.add(
      this.patternService.getPatterns('b-001').subscribe((data) => {
        this.patterns = data.filter((p) => p.status === 'ACTIVE');
        this.cdr.detectChanges();
      }),
    );
  }

  /** Sección 2 — Reglas disparadas hoy */
  private _loadFiredRules(): void {
    this.http.get<any[]>(ENDPOINTS.MONITORING_RULES).pipe(
      catchError(() => of([])),
    ).subscribe((rules) => {
      if (rules && rules.length > 0) {
        this.firedRules = rules
          .filter((r: any) => r.firedToday > 0 || r.triggerCount > 0)
          .map((r: any) => ({
            keyword: r.keyword ?? r.name ?? 'keyword',
            count:   r.firedToday ?? r.triggerCount ?? 1,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);
      }
      // Fallback con datos demo si la API no tiene datos
      if (this.firedRules.length === 0) {
        this.firedRules = [
          { keyword: 'mala atención',    count: 14 },
          { keyword: 'demora en entrega',count: 9  },
          { keyword: 'producto defectuoso', count: 7 },
          { keyword: 'no recomiendo',    count: 5  },
          { keyword: 'estafa',           count: 3  },
          { keyword: 'pésimo servicio',  count: 2  },
        ];
      }
      this.cdr.detectChanges();
    });
  }

  /** Sección 3 — Estado de fuentes (datos demo hasta que la API los provea) */
  private _initSourceStatuses(): void {
    this.sourceStatuses = [
      { name: 'Twitter / X',     icon: '🐦', status: 'online',   lastCheck: 'hace 2 min' },
      { name: 'Instagram',       icon: '📸', status: 'online',   lastCheck: 'hace 3 min' },
      { name: 'Google Reviews',  icon: '⭐', status: 'degraded', lastCheck: 'hace 8 min' },
    ];

    // Intentar enriquecer desde la API de health si existe
    this.http.get<any[]>(`${API_BASE_URL}/sourceHealth`).pipe(
      catchError(() => of(null)),
    ).subscribe((data) => {
      if (!data) return;
      this.sourceStatuses = data.map((s: any) => ({
        name:      s.name,
        icon:      s.icon ?? '🌐',
        status:    s.status ?? 'online',
        lastCheck: s.lastCheck ?? 'hace un momento',
      }));
      this.cdr.detectChanges();
    });
  }

  /** Sección 4 — Tendencia de sentimiento (últimos 7 días) */
  private _initSentimentTrend(): void {
    const days = ['Lun','Mar','Mié','Jue','Vie','Sáb','Hoy'];

    this.http.get<any[]>(ENDPOINTS.SENTIMENT_HISTORY('b-001')).pipe(
      catchError(() => of(null)),
    ).subscribe((data) => {
      if (data && data.length >= 7) {
        this.sentimentTrend = data.slice(-7).map((d: any, i: number) => ({
          label:    days[i],
          positive: d.positive ?? d.positiveCount ?? 0,
          negative: d.negative ?? d.negativeCount ?? 0,
        }));
      } else {
        // Datos demo realistas
        this.sentimentTrend = [
          { label: 'Lun', positive: 42, negative: 18 },
          { label: 'Mar', positive: 38, negative: 22 },
          { label: 'Mié', positive: 55, negative: 15 },
          { label: 'Jue', positive: 30, negative: 35 },
          { label: 'Vie', positive: 48, negative: 20 },
          { label: 'Sáb', positive: 60, negative: 12 },
          { label: 'Hoy', positive: 44, negative: 28 },
        ];
      }
      this.cdr.detectChanges();
    });
  }

  private _updateNavBadge(): void {
    const incidentItem = this.navItems.find(n => n.label === 'Incidentes');
    if (incidentItem) incidentItem.badge = this.activeAlerts.length;
  }

  // ── Acciones del usuario ─────────────────────────────────────

  filtrar(sentimiento: string): void {
    this.filtroActual = sentimiento;
    this.mentionService.getMentions().subscribe((data) => {
      this.mentions = sentimiento ? data.filter((m) => m.sentiment === sentimiento) : data;
      this.auditLogService.logAction('MonitoringRuleUpdated', {
        filter: sentimiento || 'TODOS',
        timestamp: new Date().toISOString(),
      }).subscribe();
      this.cdr.detectChanges();
    });
  }

  atenderCrisis(alertaId: string): void {
    this.alertService.resolverAlerta(alertaId).subscribe(() => {
      this.activeAlerts = this.activeAlerts.filter((a) => a.id !== alertaId);
      this.auditLogService.logAction('AlertAcknowledged', {
        alertId: alertaId, status: 'RESOLVED',
      }).subscribe();
      this.cdr.detectChanges();
    });
  }

  verIncidentes(): void {
    this.router.navigate(['/incidents']);
  }

  exportarReporte(formato: string): void {
    this.auditLogService.logAction('ReputationReportGenerated', {
      format: formato, brandId: 'b-001',
      generatedAt: new Date().toISOString(),
    }).subscribe(() => {
      alert(`Reporte ${formato} generado exitosamente.`);
    });
  }

  logout(): void {
    this.wsState.clearSession();
    localStorage.removeItem('brandradar_token');
    localStorage.removeItem('brandradar_user');
    this.router.navigate(['/auth/login']);
  }

  // ── Helpers de presentación ──────────────────────────────────

  getSeverityLabel(s: string): string {
    const map: Record<string, string> = {
      CRITICAL: 'Crítico', HIGH: 'Alto', MEDIUM: 'Medio', LOW: 'Bajo',
    };
    return map[s] || s;
  }

  getSeverityClass(s: string): string {
    const map: Record<string, string> = {
      CRITICAL: 'badge--critical', HIGH: 'badge--high',
      MEDIUM: 'badge--medium',     LOW:  'badge--low',
    };
    return map[s] || '';
  }

  getSourceIcon(source?: string): string {
    if (!source) return '🌐';
    switch (source.toLowerCase()) {
      case 'twitter':   return '🐦';
      case 'instagram': return '📸';
      case 'facebook':  return '📘';
      case 'google':    return '⭐';
      default:          return '🌐';
    }
  }

  getTimeAgo(timestamp?: Date | string): string {
    if (!timestamp) return 'Sin fecha';
    const diffMin = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    if (diffMin < 60)  return `${diffMin} min`;
    const h = Math.floor(diffMin / 60);
    if (h < 24) return `${h} h`;
    return `${Math.floor(h / 24)} d`;
  }

  /** Color semáforo del Reputation Index */
  getReputationClass(): string {
    if (this.reputationScore >= 70) return 'rep--green';
    if (this.reputationScore >= 45) return 'rep--amber';
    return 'rep--red';
  }

  getSourceStatusClass(status: string): string {
    const map: Record<string, string> = {
      online: 'source--online', degraded: 'source--degraded', offline: 'source--offline',
    };
    return map[status] || '';
  }

  getSourceStatusLabel(status: string): string {
    const map: Record<string, string> = {
      online: 'Conectado', degraded: 'Degradado', offline: 'Sin conexión',
    };
    return map[status] || status;
  }

  // ── Gráfica SVG de tendencia ─────────────────────────────────

  /** Genera los puntos SVG para la línea de positivos/negativos */
  getTrendPath(type: 'positive' | 'negative'): string {
    if (!this.sentimentTrend.length) return '';
    const W = 420, H = 80, pad = 20;
    const values = this.sentimentTrend.map(p => p[type]);
    const max    = Math.max(...values, 1);
    const stepX  = (W - pad * 2) / (values.length - 1);

    return values.map((v, i) => {
      const x = pad + i * stepX;
      const y = H - pad - ((v / max) * (H - pad * 2));
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  }

  getTrendPoints(type: 'positive' | 'negative'): Array<{x: number; y: number; value: number}> {
    if (!this.sentimentTrend.length) return [];
    const W = 420, H = 80, pad = 20;
    const values = this.sentimentTrend.map(p => p[type]);
    const max    = Math.max(...values, 1);
    const stepX  = (W - pad * 2) / (values.length - 1);

    return values.map((v, i) => ({
      x:     pad + i * stepX,
      y:     H - pad - ((v / max) * (H - pad * 2)),
      value: v,
    }));
  }

  // ── Getters de conteo ────────────────────────────────────────

  get criticalCount(): number { return this.activeAlerts.filter(a => a.severityLevel === 'CRITICAL').length; }
  get highCount():     number { return this.activeAlerts.filter(a => a.severityLevel === 'HIGH').length; }
  get mediumCount():   number { return this.activeAlerts.filter(a => a.severityLevel === 'MEDIUM').length; }
  get resolvedCount(): number { return this.mentions.filter(m => m.sentiment === 'POSITIVO').length; }

  /** Incidentes demo para cuando la fake API no está corriendo */
  private _demoAlerts(): any[] {
    const now = new Date();
    const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
    return [
      {
        id:            'demo-1',
        severityLevel: 'CRITICAL',
        brandId:       this.brandName,
        platform:      'Google Reviews',
        message:       '47 reseñas negativas en menos de 2 horas — posible campaña coordinada.',
        createdAt:     hoursAgo(2),
        status:        'TRIGGERED',
      },
      {
        id:            'demo-2',
        severityLevel: 'HIGH',
        brandId:       this.brandName,
        platform:      'Twitter',
        message:       'Hashtag negativo trending: #MalaAtencion con 320 menciones en la última hora.',
        createdAt:     hoursAgo(1),
        status:        'TRIGGERED',
      },
      {
        id:            'demo-3',
        severityLevel: 'MEDIUM',
        brandId:       this.brandName,
        platform:      'Instagram',
        message:       'Patrón de comentarios negativos repetidos en las últimas 3 publicaciones.',
        createdAt:     hoursAgo(4),
        status:        'TRIGGERED',
      },
    ];
  }
}

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

// Angular Material
import { MatToolbarModule }     from '@angular/material/toolbar';
import { MatCardModule }        from '@angular/material/card';
import { MatButtonModule }      from '@angular/material/button';
import { MatIconModule }        from '@angular/material/icon';
import { MatChipsModule }       from '@angular/material/chips';
import { MatDividerModule }     from '@angular/material/divider';
import { MatListModule }        from '@angular/material/list';
import { MatTooltipModule }     from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule }       from '@angular/material/table';
import { MatPaginatorModule }   from '@angular/material/paginator';

import { MentionService }       from '../../../../../infrastructure/services/mention.service';
import { AlertService }         from '../../../../../infrastructure/services/alert.service';
import { AuditLogService }      from '../../../../../infrastructure/services/audit-log.service';
import { BrandService }         from '../../../../../infrastructure/services/brand.service';
import { WorkspaceStateService } from '../../../../../core/services/workspace-state';
import { Mention }              from '../../../domain/models/mention.entity';
import { ENDPOINTS, API_BASE_URL } from '../../../../../infrastructure/api/api-endpoints';

interface FiredRule   { keyword: string; count: number; }
interface SourceStatus { name: string; icon: string; status: 'online'|'degraded'|'offline'; lastCheck: string; }
interface SentimentPoint { label: string; positive: number; negative: number; }

/**
 * T30 · US11 — Dashboard Principal de Reputación
 * Usa Angular Material: mat-toolbar, mat-card, mat-grid-list, mat-list, mat-chip
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule, MatCardModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatDividerModule, MatListModule,
    MatTooltipModule, MatProgressBarModule,
    MatTableModule, MatPaginatorModule,
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {

  mentions: Mention[]            = [];
  activeAlerts: any[]            = [];
  reputationScore                = 74;
  firedRules: FiredRule[]        = [];
  sentimentTrend: SentimentPoint[] = [];
  sourceStatuses: SourceStatus[] = [];

  isLoading     = true;
  workspaceName = 'BrandRadar Agency';
  brandName     = 'Marca principal';

  /** Columnas de la tabla de incidentes */
  incidentColumns = ['severity', 'brand', 'source', 'description', 'time', 'actions'];
  /** Columnas de la tabla de reglas */
  ruleColumns = ['keyword', 'count', 'bar'];
  /** Columnas de la tabla de fuentes */
  sourceColumns = ['source', 'lastCheck', 'status'];

  today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  private subs = new Subscription();

  constructor(
    private readonly mentionService:  MentionService,
    private readonly alertService:    AlertService,
    private readonly auditLogService: AuditLogService,
    private readonly brandService:    BrandService,
    private readonly wsState:         WorkspaceStateService,
    private readonly router:          Router,
    private readonly http:            HttpClient,
    private readonly cdr:             ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const ws    = this.wsState.activeWorkspace;
    const brand = this.wsState.activeBrand;
    if (ws)    this.workspaceName = ws.name;
    if (brand) this.brandName     = brand.name;

    this._initSourceStatuses();
    this._initSentimentTrend();
    this._loadFiredRules();
    this._startPolling();
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  // ── Carga de datos ───────────────────────────────────────────

  private _startPolling(): void {
    this.subs.add(
      this.mentionService.getMentionsWithPolling().subscribe((data) => {
        this.isLoading = false;
        this.mentions  = data;
        this.cdr.detectChanges();
      }),
    );

    this.subs.add(
      this.brandService.getBrandById('b-001').subscribe((brand) => {
        this.reputationScore = brand?.reputationScore ?? 74;
        this.cdr.detectChanges();
      }),
    );

    this.subs.add(
      this.alertService.getActiveAlerts().subscribe({
        next: (alerts) => {
          const filtered = alerts.filter(a => a.status !== 'RESOLVED').slice(0, 5);
          this.activeAlerts = filtered.length > 0 ? filtered : this._demoAlerts();
          this.cdr.detectChanges();
        },
        error: () => {
          this.activeAlerts = this._demoAlerts();
          this.cdr.detectChanges();
        },
      }),
    );
  }

  private _loadFiredRules(): void {
    this.http.get<any[]>(ENDPOINTS.MONITORING_RULES).pipe(catchError(() => of([]))).subscribe(rules => {
      this.firedRules = rules.length
        ? rules.filter(r => (r.firedToday ?? r.triggerCount ?? 0) > 0)
               .map(r => ({ keyword: r.keyword ?? r.name, count: r.firedToday ?? r.triggerCount ?? 1 }))
               .sort((a, b) => b.count - a.count).slice(0, 6)
        : [
            { keyword: 'mala atención',      count: 14 },
            { keyword: 'demora en entrega',  count: 9  },
            { keyword: 'producto defectuoso',count: 7  },
            { keyword: 'no recomiendo',      count: 5  },
            { keyword: 'estafa',             count: 3  },
          ];
      this.cdr.detectChanges();
    });
  }

  private _initSourceStatuses(): void {
    this.sourceStatuses = [
      { name: 'Twitter / X',    icon: 'tag',   status: 'online',   lastCheck: 'hace 2 min' },
      { name: 'Instagram',      icon: 'photo_camera', status: 'online',   lastCheck: 'hace 3 min' },
      { name: 'Google Reviews', icon: 'star',  status: 'degraded', lastCheck: 'hace 8 min' },
    ];
  }

  private _initSentimentTrend(): void {
    this.http.get<any[]>(ENDPOINTS.SENTIMENT_HISTORY('b-001')).pipe(catchError(() => of(null))).subscribe(data => {
      const days = ['Lun','Mar','Mié','Jue','Vie','Sáb','Hoy'];
      this.sentimentTrend = (data && data.length >= 7)
        ? data.slice(-7).map((d, i) => ({ label: days[i], positive: d.positive ?? 0, negative: d.negative ?? 0 }))
        : [
            { label:'Lun', positive:42, negative:18 },
            { label:'Mar', positive:38, negative:22 },
            { label:'Mié', positive:55, negative:15 },
            { label:'Jue', positive:30, negative:35 },
            { label:'Vie', positive:48, negative:20 },
            { label:'Sáb', positive:60, negative:12 },
            { label:'Hoy', positive:44, negative:28 },
          ];
      this.cdr.detectChanges();
    });
  }

  // ── Acciones ─────────────────────────────────────────────────

  resolverIncidente(id: string): void {
    this.alertService.resolverAlerta(id).subscribe(() => {
      this.activeAlerts = this.activeAlerts.filter(a => a.id !== id);
      this.auditLogService.logAction('AlertAcknowledged', { alertId: id, status: 'RESOLVED' }).subscribe();
      this.cdr.detectChanges();
    });
  }

  verIncidentes(): void { this.router.navigate(['/incidents']); }

  logout(): void {
    this.wsState.clearSession();
    localStorage.removeItem('brandradar_token');
    localStorage.removeItem('brandradar_user');
    this.router.navigate(['/auth/login']);
  }

  // ── Helpers de presentación ──────────────────────────────────

  getSeverityColor(s: string): string {
    return ({ CRITICAL:'warn', HIGH:'warn', MEDIUM:'accent', LOW:'primary' } as any)[s] ?? 'primary';
  }

  getSeverityLabel(s: string): string {
    return ({ CRITICAL:'Crítico', HIGH:'Alto', MEDIUM:'Medio', LOW:'Bajo' } as any)[s] ?? s;
  }

  getSourceIcon(src?: string): string {
    if (!src) return 'language';
    return ({ twitter:'tag', instagram:'photo_camera', google:'star', facebook:'thumb_up' } as any)[src.toLowerCase()] ?? 'language';
  }

  getTimeAgo(ts?: Date | string): string {
    if (!ts) return 'Sin fecha';
    const m = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    return h < 24 ? `${h} h` : `${Math.floor(h/24)} d`;
  }

  getReputationColor(): string {
    if (this.reputationScore >= 70) return '#10b981';
    if (this.reputationScore >= 45) return '#f59e0b';
    return '#ef4444';
  }

  getRuleBarValue(count: number): number {
    const max = this.firedRules[0]?.count ?? 1;
    return (count / max) * 100;
  }

  getTrendPath(type: 'positive'|'negative'): string {
    if (!this.sentimentTrend.length) return '';
    const W=420, H=80, pad=20;
    const vals = this.sentimentTrend.map(p => p[type]);
    const max  = Math.max(...vals, 1);
    const step = (W - pad*2) / (vals.length - 1);
    return vals.map((v,i) => `${i===0?'M':'L'} ${(pad+i*step).toFixed(1)} ${(H-pad-(v/max)*(H-pad*2)).toFixed(1)}`).join(' ');
  }

  getTrendPoints(type: 'positive'|'negative'): {x:number;y:number}[] {
    if (!this.sentimentTrend.length) return [];
    const W=420, H=80, pad=20;
    const vals = this.sentimentTrend.map(p => p[type]);
    const max  = Math.max(...vals, 1);
    const step = (W - pad*2) / (vals.length - 1);
    return vals.map((v,i) => ({ x: pad+i*step, y: H-pad-(v/max)*(H-pad*2) }));
  }

  private _demoAlerts(): any[] {
    const ago = (h: number) => new Date(Date.now() - h*3600000).toISOString();
    return [
      { id:'d1', severityLevel:'CRITICAL', brandId: this.brandName, platform:'Google Reviews',
        message:'47 reseñas negativas en menos de 2 horas — posible campaña coordinada.', createdAt: ago(2), status:'TRIGGERED' },
      { id:'d2', severityLevel:'HIGH',     brandId: this.brandName, platform:'Twitter',
        message:'Hashtag negativo trending: #MalaAtencion con 320 menciones en la última hora.', createdAt: ago(1), status:'TRIGGERED' },
      { id:'d3', severityLevel:'MEDIUM',   brandId: this.brandName, platform:'Instagram',
        message:'Patrón de comentarios negativos repetidos en las últimas 3 publicaciones.', createdAt: ago(4), status:'TRIGGERED' },
    ];
  }
}

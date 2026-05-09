import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

// ESTOS SON LOS IMPORTS QUE TE FALTAN:
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
  reputationScore: number = 0;

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
    // Polling de Menciones
    this.subscriptions.add(
      this.mentionService.getMentionsWithPolling().subscribe((data) => {
        this.isLoading = false;
        this.mentions = this.filtroActual
          ? data.filter((m) => m.sentiment === this.filtroActual)
          : data;
        this.cdr.detectChanges();
      }),
    );

    // Polling de Reputation Score
    this.subscriptions.add(
      this.brandService.getBrandById('b-001').subscribe((brand) => {
        this.reputationScore = brand.reputationScore;
        this.cdr.detectChanges();
      }),
    );

    // Polling de Alertas y Patrones (Igual que antes)
    this.subscriptions.add(
      this.alertService.getActiveAlerts().subscribe((alerts) => {
        this.activeAlerts = alerts.filter((a) => a.status === 'TRIGGERED');
        this.cdr.detectChanges();
      }),
    );
    this.subscriptions.add(
      this.patternService.getPatterns('b-001').subscribe((data) => {
        this.patterns = data.filter((p) => p.status !== 'DISMISSED');
        this.cdr.detectChanges();
      }),
    );
  }

  // Las funciones filtrar(), atenderCrisis(), descartarPatron() y exportarReporte()
  // se mantienen idénticas a tu código anterior para no romper la funcionalidad.

  filtrar(sentimiento: string): void {
    this.filtroActual = sentimiento;
    this.mentionService.getMentions().subscribe((data) => {
      this.mentions = sentimiento ? data.filter((m) => m.sentiment === sentimiento) : data;
      this.errorMessage = this.mentions.length === 0 ? 'NO SE ENCONTRARON MENCIONES' : '';
      this.cdr.detectChanges();
    });
  }

  atenderCrisis(alertaId: string): void {
    this.alertService.resolverAlerta(alertaId).subscribe(() => {
      this.activeAlerts = this.activeAlerts.filter((a) => a.id !== alertaId);
      this.cdr.detectChanges();
    });
  }

  descartarPatron(id: string): void {
    this.patternService.dismissPattern(id).subscribe(() => {
      this.patterns = this.patterns.filter((p) => p.id !== id);
      this.cdr.detectChanges();
    });
  }

  exportarReporte(formato: string): void {
    alert(`Generando reporte ${formato}...`);
  }
}

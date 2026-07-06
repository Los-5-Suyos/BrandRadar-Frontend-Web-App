import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { environment } from '../../../../../environments/environment';

interface Incidente {
  id: number;
  nivel: string;
  estado: string;
  nivelColor: string;
  nivelBg: string;
  estadoColor: string;
  estadoBg: string;
  titulo: string;
  descripcion: string;
  impactScore: number;
  tiempo: string;
  progreso: number;
  canales: { nombre: string; logo: string }[];
  keywords: string[];
}

@Component({
  selector: 'app-incidentes',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './incidents.component.html',
  styleUrl: './incidents.component.css',
})
export class IncidentsComponent implements OnInit {
  router = inject(Router);
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  brandId: number | null = null;
  loading = true;

  get workspaceName() {
    return typeof window !== 'undefined'
      ? localStorage.getItem('currentWorkspaceName') || 'Workspace'
      : 'Workspace';
  }

  get planLabel(): string {
    const plan =
      typeof window !== 'undefined' ? localStorage.getItem('workspacePlan') || 'FREE' : 'FREE';
    if (plan === 'PRO') return 'Pro';
    if (plan === 'ENTERPRISE') return 'Enterprise';
    return 'Basic';
  }

  activeTab = 'todos';
  activeCrisisTab = 'diagnostico';
  selectedIncidente: Incidente | null = null;
  copiedIndex: number | null = null;

  incidentes: Incidente[] = [];

  private readonly nivelStyles: Record<string, { color: string; bg: string }> = {
    CRITICO: { color: '#ffb4ab', bg: 'rgba(255,180,171,0.12)' },
    ALTO: { color: '#ffb4ab', bg: 'rgba(255,180,171,0.12)' },
    MEDIO: { color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  };

  private readonly estadoStyles: Record<string, { color: string; bg: string }> = {
    ACTIVO: { color: '#ffb4ab', bg: 'rgba(255,180,171,0.08)' },
    MONITOREADO: { color: '#63f7ff', bg: 'rgba(99,247,255,0.06)' },
    RESUELTO: { color: '#4ade80', bg: 'rgba(74,222,128,0.06)' },
  };

  get tabs() {
    const count = (matcher: (i: Incidente) => boolean) => this.incidentes.filter(matcher).length;
    return [
      { key: 'todos', label: 'Todos', count: this.incidentes.length, color: '#929096' },
      {
        key: 'CRITICO',
        label: 'Crítico',
        count: count((i) => i.nivel === 'CRITICO'),
        color: '#ffb4ab',
      },
      { key: 'ALTO', label: 'Alto', count: count((i) => i.nivel === 'ALTO'), color: '#ffb4ab' },
      { key: 'MEDIO', label: 'Medio', count: count((i) => i.nivel === 'MEDIO'), color: '#f97316' },
      {
        key: 'RESUELTO',
        label: 'Resueltos',
        count: count((i) => i.estado === 'RESUELTO'),
        color: '#4ade80',
      },
    ];
  }

  get filteredIncidentes() {
    if (this.activeTab === 'todos') return this.incidentes;
    if (this.activeTab === 'RESUELTO')
      return this.incidentes.filter((i) => i.estado === 'RESUELTO');
    return this.incidentes.filter((i) => i.nivel === this.activeTab);
  }

  keywords: { word: string; count: number; pct: number; color: string }[] = [];

  aiDiagnostico = {
    texto:
      'Selecciona un incidente y presiona "Actualizar análisis" para generar un diagnóstico con IA.',
    patron: '-',
    geofocus: '-',
    sugerencias: [] as any[],
  };

  accionesEvitar = [
    'No eliminar comentarios',
    'No responder de forma corporativa',
    'No publicar promociones sin resolver',
  ];

  historialIA: { fecha: string; score: string; color: string; resumen: string }[] = [];

  ngOnInit() {
    if (typeof window === 'undefined') return;
    const wsId = localStorage.getItem('currentWorkspaceId');
    if (!wsId) {
      this.router.navigate(['/home']);
      return;
    }
    this.http.get<any[]>(`${this.baseUrl}/brands/workspace/${wsId}`).subscribe({
      next: (brands) => {
        if (brands.length > 0) {
          this.brandId = brands[0].id;
          this.loadIncidentes();
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadIncidentes() {
    if (!this.brandId) return;
    this.loading = true;
    this.http.get<any[]>(`${this.baseUrl}/incidents/brand/${this.brandId}`).subscribe({
      next: (data) => {
        this.incidentes = data.map((i) => this.mapIncidente(i));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private mapIncidente(i: any): Incidente {
    const nivel = i.severityLabel || 'MEDIO';
    const estado = i.status || 'ACTIVO';
    const nivelStyle = this.nivelStyles[nivel] || this.nivelStyles['MEDIO'];
    const estadoStyle = this.estadoStyles[estado] || this.estadoStyles['ACTIVO'];

    return {
      id: i.id,
      nivel,
      estado,
      nivelColor: nivelStyle.color,
      nivelBg: nivelStyle.bg,
      estadoColor: estadoStyle.color,
      estadoBg: estadoStyle.bg,
      titulo: i.title || 'Incidente sin título',
      descripcion: i.description || '',
      impactScore: i.impactScore || 0,
      tiempo: this.relativeTime(i.createdAt),
      progreso: i.progressPct || 0,
      canales: [],
      keywords: [],
    };
  }

  private relativeTime(iso: string): string {
    if (!iso) return '';
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'hace instantes';
    if (mins < 60) return `hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
  }

  selectIncidente(inc: Incidente) {
    this.selectedIncidente = inc;
    this.loadKeywords(inc.id);
    this.loadHistorial(inc.id);
    this.aiDiagnostico = {
      texto:
        'Presiona "Actualizar análisis" para generar un diagnóstico con IA sobre este incidente.',
      patron: '-',
      geofocus: '-',
      sugerencias: [],
    };
  }

  loadKeywords(incidentId: number) {
    this.http.get<any>(`${this.baseUrl}/incidents/${incidentId}/keywords`).subscribe({
      next: (data) => {
        this.keywords = (data.keywords ?? []).map((k: any) => ({
          word: k.keyword,
          count: k.count,
          pct: k.percentOfMax,
          color: k.percentOfMax > 70 ? '#ffb4ab' : k.percentOfMax > 40 ? '#f97316' : '#63f7ff',
        }));
      },
      error: () => {
        this.keywords = [];
      },
    });
  }

  loadHistorial(incidentId: number) {
    this.http.get<any[]>(`${this.baseUrl}/incidents/${incidentId}/analysis-history`).subscribe({
      next: (data) => {
        this.historialIA = data.map((h) => ({
          fecha: new Date(h.createdAt).toLocaleString('es-PE', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }),
          score: h.pattern || '-',
          color: '#63f7ff',
          resumen: h.diagnostico,
        }));
      },
      error: () => {
        this.historialIA = [];
      },
    });
  }

  actualizarIA() {
    if (!this.selectedIncidente) return;
    this.http
      .post<any>(`${this.baseUrl}/incidents/${this.selectedIncidente.id}/analyze`, {})
      .subscribe({
        next: (data) => {
          this.aiDiagnostico = {
            texto: data.diagnostico,
            patron: data.pattern,
            geofocus: data.geofocus,
            sugerencias: [
              {
                tipo: 'accion',
                urgencia: 'SUGERIDO POR IA',
                urgenciaColor: '#63f7ff',
                titulo: 'Acción recomendada',
                desc: data.accion,
              },
            ],
          };
          if (this.selectedIncidente) this.loadHistorial(this.selectedIncidente.id);
        },
      });
  }

  actualizarEstado(nuevoEstado: string) {
    if (!this.selectedIncidente) return;
    const progressPct = nuevoEstado === 'RESUELTO' ? 100 : this.selectedIncidente.progreso;
    this.http
      .patch<any>(`${this.baseUrl}/incidents/${this.selectedIncidente.id}/status`, {
        status: nuevoEstado,
        progressPct,
      })
      .subscribe({
        next: () => this.loadIncidentes(),
      });
  }

  copyText(text: string, index: number) {
    navigator.clipboard.writeText(text);
    this.copiedIndex = index;
    setTimeout(() => (this.copiedIndex = null), 2000);
  }

  goToSection(section: string) {
    this.router.navigate([`/${section}`]);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  showHistorialModal = false;
  showNuevaAlertaModal = false;
  nuevaAlertaTitulo = '';
  nuevaAlertaNivel = 'medio';
  nuevaAlertaDesc = '';
  nuevaAlertaGuardada = false;

  get historialResueltos() {
    return this.incidentes
      .filter((i) => i.estado === 'RESUELTO')
      .map((i) => ({
        fecha: i.tiempo,
        titulo: i.titulo,
        nivel: i.nivel,
        nivelColor: i.nivelColor,
        score: i.impactScore.toString(),
        resolucion: i.descripcion,
        duracion: '-',
      }));
  }

  guardarNuevaAlerta() {
    if (!this.nuevaAlertaTitulo.trim() || !this.brandId) return;

    const nivelMap: Record<string, { level: number; label: string }> = {
      alto: { level: 2, label: 'ALTO' },
      medio: { level: 1, label: 'MEDIO' },
      bajo: { level: 1, label: 'BAJO' },
    };
    const nivel = nivelMap[this.nuevaAlertaNivel] || nivelMap['medio'];

    this.http
      .post<any>(`${this.baseUrl}/crisis-alerts`, {
        brandId: this.brandId,
        priorityLevel: nivel.level,
        priorityLabel: nivel.label,
        title: this.nuevaAlertaTitulo,
        description: this.nuevaAlertaDesc,
        triggerType: 'MANUAL',
        triggerDeviationPct: 0,
        triggerConfidence: 1,
      })
      .subscribe({
        next: (alert) => {
          this.http
            .post(`${this.baseUrl}/incidents`, {
              brandId: this.brandId,
              crisisAlertId: alert.id,
              severityLevel: nivel.level,
              severityLabel: nivel.label,
              title: this.nuevaAlertaTitulo,
              description: this.nuevaAlertaDesc,
            })
            .subscribe({
              next: () => {
                this.nuevaAlertaGuardada = true;
                this.loadIncidentes();
                setTimeout(() => {
                  this.showNuevaAlertaModal = false;
                  this.nuevaAlertaGuardada = false;
                  this.nuevaAlertaTitulo = '';
                  this.nuevaAlertaDesc = '';
                  this.nuevaAlertaNivel = 'medio';
                }, 1500);
              },
            });
        },
      });
  }
}

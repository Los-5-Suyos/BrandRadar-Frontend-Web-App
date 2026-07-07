import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { environment } from '../../../../../environments/environment';

/* ===== INTERFACES ===== */
interface OpcionToggle {
  key: string;
  label: string;
}

interface ReporteItem {
  id: number;
  nombre: string;
  fecha: string;
  tipo: string;
  destinatarios: string;
  tamano: string;
  estado: string;
  estadoColor: string;
  resumenEjecutivo: string | null;
}

/* ===== COMPONENT ===== */
@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
})
export class ReportsComponent implements OnInit {
  router = inject(Router);
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  workspaceId: string | null = null;

  /* ===== GETTERS ===== */
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

  /* ===== CONFIGURACIÓN DEL REPORTE ===== */
  rangoSeleccionado = '30d';
  formatoSeleccionado = 'pdf';
  generandoReporte = false;
  generarReporteError: string | null = null;

  customFrom = '';
  customTo = '';

  rangosTiempo: OpcionToggle[] = [
    { key: '7d', label: 'Últimos 7 días' },
    { key: '15d', label: 'Últimos 15 días' },
    { key: '30d', label: 'Últimos 30 días' },
    { key: '90d', label: 'Últimos 3 meses' },
    { key: 'mes', label: 'Este mes' },
    { key: 'personalizado', label: 'Rango personalizado' },
  ];

  formatos: OpcionToggle[] = [
    { key: 'pdf', label: 'PDF' },
    { key: 'csv', label: 'CSV' },
    { key: 'excel', label: 'Excel' },
  ];

  /* ===== REPORTES GENERADOS ===== */
  reportes: ReporteItem[] = [];
  loadingReportes = true;

  get ultimoReporte(): ReporteItem | null {
    return this.reportes[0] || null;
  }

  /* ===== PROGRAMAR ENVÍO ===== */
  showProgramarEnvio = false;
  programarEmail = '';
  programarFrecuencia = 'semanal'; // 'semanal' | 'mensual'
  programarDia = 'lunes';
  programarFormato = 'pdf';
  programacionGuardada = false;
  guardandoProgramacion = false;
  cargandoProgramacion = false;
  scheduleError: string | null = null;

  diasSemana = [
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' },
  ];

  private readonly dayOfWeekToBackend: Record<string, string> = {
    lunes: 'MONDAY',
    martes: 'TUESDAY',
    miercoles: 'WEDNESDAY',
    jueves: 'THURSDAY',
    viernes: 'FRIDAY',
  };
  private readonly dayOfWeekFromBackend: Record<string, string> = {
    MONDAY: 'lunes',
    TUESDAY: 'martes',
    WEDNESDAY: 'miercoles',
    THURSDAY: 'jueves',
    FRIDAY: 'viernes',
  };

  frecuenciasEnvio = [
    { key: 'semanal', label: 'Semanal' },
    { key: 'mensual', label: 'Mensual' },
  ];

  /* ===== CICLO DE VIDA ===== */
  ngOnInit() {
    if (typeof window === 'undefined') return;
    this.workspaceId = localStorage.getItem('currentWorkspaceId');
    if (!this.workspaceId) {
      this.router.navigate(['/home']);
      return;
    }
    const today = new Date();
    this.customTo = today.toISOString().slice(0, 10);
    const from = new Date(today);
    from.setDate(from.getDate() - 30);
    this.customFrom = from.toISOString().slice(0, 10);

    this.loadReportes();
  }

  loadReportes() {
    if (!this.workspaceId) return;
    this.loadingReportes = true;
    this.http.get<any[]>(`${this.baseUrl}/workspaces/${this.workspaceId}/reports`).subscribe({
      next: (data) => {
        this.reportes = data.map((r) => this.mapReporte(r));
        this.loadingReportes = false;
      },
      error: () => {
        this.loadingReportes = false;
      },
    });
  }

  private mapReporte(r: any): ReporteItem {
    const estadoMap: Record<string, { label: string; color: string }> = {
      GENERATING: { label: 'GENERANDO', color: '#f97316' },
      READY: { label: 'LISTO', color: '#4ade80' },
      FAILED: { label: 'ERROR', color: '#ffb4ab' },
    };
    const estado = estadoMap[r.status] || { label: r.status, color: '#929096' };

    return {
      id: r.id,
      nombre: r.title,
      fecha: new Date(r.createdAt).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      tipo: r.format,
      destinatarios:
        r.recipientsCount > 0
          ? `${r.recipientsCount} persona${r.recipientsCount === 1 ? '' : 's'}`
          : '—',
      tamano: this.formatBytes(r.fileSizeBytes),
      estado: estado.label,
      estadoColor: estado.color,
      resumenEjecutivo: r.executiveSummaryText ?? null,
    };
  }

  private formatBytes(bytes: number | null): string {
    if (!bytes) return '—';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /* ===== RANGO DE FECHAS ===== */
  private toIsoDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private computePeriod(): { from: string; to: string } | null {
    const today = new Date();
    const to = this.toIsoDate(today);

    if (this.rangoSeleccionado === 'personalizado') {
      if (!this.customFrom || !this.customTo) return null;
      return { from: this.customFrom, to: this.customTo };
    }

    if (this.rangoSeleccionado === 'mes') {
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: this.toIsoDate(from), to };
    }

    const daysMap: Record<string, number> = { '7d': 7, '15d': 15, '30d': 30, '90d': 90 };
    const days = daysMap[this.rangoSeleccionado] ?? 30;
    const from = new Date(today);
    from.setDate(from.getDate() - days);
    return { from: this.toIsoDate(from), to };
  }

  /* ===== MÉTODOS ===== */
  seleccionarRango(key: string) {
    this.rangoSeleccionado = key;
  }
  seleccionarFormato(key: string) {
    this.formatoSeleccionado = key;
  }

  generarReporte() {
    if (!this.workspaceId) return;
    const periodo = this.computePeriod();
    if (!periodo) {
      this.generarReporteError = 'Selecciona un rango de fechas válido.';
      return;
    }

    this.generandoReporte = true;
    this.generarReporteError = null;

    this.http
      .post<any>(`${this.baseUrl}/workspaces/${this.workspaceId}/reports`, {
        periodFrom: periodo.from,
        periodTo: periodo.to,
        format: this.formatoSeleccionado.toUpperCase(),
      })
      .subscribe({
        next: (report) => {
          this.reportes.unshift(this.mapReporte(report));
          this.generandoReporte = false;
        },
        error: (err) => {
          this.generandoReporte = false;
          this.generarReporteError =
            err.status === 404
              ? 'No hay una marca configurada para este workspace todavía.'
              : 'No se pudo generar el reporte. Intenta nuevamente.';
        },
      });
  }

  eliminarReporte(r: ReporteItem) {
    this.http.delete(`${this.baseUrl}/reports/${r.id}`).subscribe({
      next: () => {
        this.reportes = this.reportes.filter((rep) => rep.id !== r.id);
      },
    });
  }

  descargandoId: number | null = null;
  descargaError: string | null = null;

  descargarReporte(r: ReporteItem) {
    if (r.estado !== 'LISTO') return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const ext = r.tipo === 'EXCEL' ? 'xlsx' : r.tipo.toLowerCase();
    this.descargandoId = r.id;
    this.descargaError = null;

    fetch(`${this.baseUrl}/reports/${r.id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok) {
          let mensaje = `No se pudo descargar el reporte (código ${res.status}).`;
          try {
            if (contentType.includes('application/json')) {
              const body = await res.json();
              mensaje = body.message || body.error || mensaje;
            }
          } catch {
            /* cuerpo del error no era JSON */
          }
          throw new Error(mensaje);
        }
        return res.blob();
      })
      .then((blob) => {
        if (!blob || blob.size === 0) {
          throw new Error('El archivo del reporte llegó vacío.');
        }
        const link = document.createElement('a');
        const objectUrl = window.URL.createObjectURL(blob);
        link.href = objectUrl;
        link.download = `${r.nombre}.${ext}`;
        link.click();
        window.URL.revokeObjectURL(objectUrl);
        this.descargandoId = null;
      })
      .catch((err) => {
        this.descargandoId = null;
        this.descargaError = err?.message || 'No se pudo descargar el reporte. Intenta nuevamente.';
      });
  }

  verHistorialCompleto() {
    // El historial completo ya se muestra en la tabla de reportes generados.
  }

  /* ===== PROGRAMAR ENVÍO ===== */
  abrirProgramar() {
    this.showProgramarEnvio = true;
    this.scheduleError = null;
    if (!this.workspaceId) return;

    this.cargandoProgramacion = true;
    this.http.get<any>(`${this.baseUrl}/workspaces/${this.workspaceId}/report-schedule`).subscribe({
      next: (s) => {
        this.programarEmail = s.email;
        this.programarFrecuencia = s.frequency === 'MONTHLY' ? 'mensual' : 'semanal';
        this.programarDia = this.dayOfWeekFromBackend[s.dayOfWeek] || 'lunes';
        this.programarFormato = (s.format || 'PDF').toLowerCase();
        this.cargandoProgramacion = false;
      },
      error: () => {
        // Sin programación previa: se mantienen los valores por defecto.
        this.cargandoProgramacion = false;
      },
    });
  }

  cerrarProgramar() {
    this.showProgramarEnvio = false;
    this.programacionGuardada = false;
    this.scheduleError = null;
  }

  guardarProgramacion() {
    if (!this.programarEmail.trim() || !this.workspaceId) return;

    this.guardandoProgramacion = true;
    this.scheduleError = null;

    const frequency = this.programarFrecuencia === 'mensual' ? 'MONTHLY' : 'WEEKLY';
    const dayOfWeek =
      frequency === 'WEEKLY' ? this.dayOfWeekToBackend[this.programarDia] || 'MONDAY' : null;

    this.http
      .post(`${this.baseUrl}/workspaces/${this.workspaceId}/report-schedule`, {
        email: this.programarEmail.trim(),
        frequency,
        dayOfWeek,
        format: this.programarFormato.toUpperCase(),
      })
      .subscribe({
        next: () => {
          this.guardandoProgramacion = false;
          this.programacionGuardada = true;
          setTimeout(() => {
            this.showProgramarEnvio = false;
            this.programacionGuardada = false;
          }, 1500);
        },
        error: () => {
          this.guardandoProgramacion = false;
          this.scheduleError = 'No se pudo guardar la programación. Verifica el correo ingresado.';
        },
      });
  }

  goToSection(section: string) {
    this.router.navigate([`/${section}`]);
  }
  goHome() {
    this.router.navigate(['/home']);
  }
}

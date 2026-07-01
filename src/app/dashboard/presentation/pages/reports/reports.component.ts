import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

/* ===== INTERFACES ===== */
interface Metrica {
  key: string;
  label: string;
  checked: boolean;
}

interface OpcionToggle {
  key: string;
  label: string;
}

interface MetricaResumen {
  label: string;
  valor: string;
  variacion: string;
  tendencia: 'up' | 'down';
  color: string;
}

interface DiaSentimiento {
  dia: string;
  positivo: number;
  neutro: number;
}

interface KeywordSentimiento {
  texto: string;
  valor: string;
  color: string;
}

interface ReporteReciente {
  nombre: string;
  fecha: string;
  tipo: string;
  destinatarios: string;
  tamano: string;
  estado: string;
  estadoColor: string;
}

interface CuentaCritica {
  nombre: string;
  handle: string;
  plataforma: string;
  menciones: number;
  score: string;
  scoreColor: string;
  color: string;
  initials: string;
}

/* ===== COMPONENT ===== */
@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  router = inject(Router);

  /* ===== GETTERS ===== */
  get workspaceName() {
    return typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceName') || 'Workspace' : 'Workspace';
  }

  get planLabel(): string {
    const plan = typeof window !== 'undefined' ? localStorage.getItem('workspacePlan') || 'FREE' : 'FREE';
    if (plan === 'PRO') return 'Pro';
    if (plan === 'ENTERPRISE') return 'Enterprise';
    return 'Basic';
  }

  /* ===== CONFIGURACIÓN DEL REPORTE ===== */
  rangoSeleccionado = '30d';
  frecuenciaSeleccionada = 'semanal';
  formatoSeleccionado = 'pdf';
  generandoReporte = false;

  rangosTiempo: OpcionToggle[] = [
    { key: '7d', label: 'Últimos 7 días' },
    { key: '15d', label: 'Últimos 15 días' },
    { key: '30d', label: 'Últimos 30 días' },
    { key: '90d', label: 'Últimos 3 meses' },
    { key: 'mes', label: 'Este mes' },
    { key: 'personalizado', label: 'Rango personalizado' },
  ];

  metricas: Metrica[] = [
    { key: 'sentimiento', label: 'Análisis de Sentimiento', checked: true },
    { key: 'menciones', label: 'Volumen de Menciones', checked: true },
    { key: 'keywords', label: 'Keywords Críticas', checked: true },
    { key: 'canales', label: 'Rendimiento por Canal', checked: true },
    { key: 'cuentas', label: 'Cuentas Más Críticas', checked: false },
    { key: 'incidentes', label: 'Historial de Incidentes', checked: false },
    { key: 'tendencias', label: 'Tendencias Temporales', checked: false },
    { key: 'alertas', label: 'Alertas Activadas', checked: false },
  ];

  frecuencias: OpcionToggle[] = [
    { key: 'manual', label: 'Manual' },
    { key: 'semanal', label: 'Semanal' },
    { key: 'mensual', label: 'Mensual' },
  ];

  formatos: OpcionToggle[] = [
    { key: 'pdf', label: 'PDF' },
    { key: 'csv', label: 'CSV' },
    { key: 'excel', label: 'Excel' },
  ];

  /* ===== RESUMEN EJECUTIVO ===== */
  periodoResumen = 'Sept 2024 - Oct 2024';

  metricasResumen: MetricaResumen[] = [
    { label: 'SENTIMENT SCORE', valor: '82%', variacion: '+4.2% vs. periodo anterior', tendencia: 'up', color: '#4ade80' },
    { label: 'MENCIONES TOTALES', valor: '12.4k', variacion: '+12.3% vs. periodo anterior', tendencia: 'up', color: '#d4e4fa' },
    { label: 'REACH ESTIMADO', valor: '2.8M', variacion: '-2.5% vs. periodo anterior', tendencia: 'down', color: '#63a8ff' },
  ];

  evolucionSentimiento: DiaSentimiento[] = [
    { dia: 'Lun', positivo: 55, neutro: 20 },
    { dia: 'Mar', positivo: 62, neutro: 18 },
    { dia: 'Mié', positivo: 78, neutro: 15 },
    { dia: 'Jue', positivo: 58, neutro: 22 },
    { dia: 'Vie', positivo: 90, neutro: 10 },
    { dia: 'Sáb', positivo: 60, neutro: 20 },
    { dia: 'Dom', positivo: 65, neutro: 18 },
    { dia: 'Lun', positivo: 45, neutro: 25 },
    { dia: 'Mar', positivo: 82, neutro: 12 },
    { dia: 'Mié', positivo: 70, neutro: 16 },
  ];

  topKeywords: KeywordSentimiento[] = [
    { texto: 'Sabor Parrilla', valor: '4.9', color: '#4ade80' },
    { texto: 'Delivery Rápido', valor: '3.2', color: '#4ade80' },
    { texto: 'Precio', valor: '2.8', color: '#929096' },
    { texto: 'Tiempo de espera', valor: '1.2', color: '#ffb4ab' },
  ];

  /* ===== CUENTAS CRÍTICAS ===== */
  cuentasCriticas: CuentaCritica[] = [
    { nombre: 'Ricardo Torres', handle: '@ricardo_t_peru', plataforma: 'Twitter/X', menciones: 12, score: '0.92', scoreColor: '#ffb4ab', color: '#3b3f8c', initials: 'RT' },
    { nombre: 'María Quispe', handle: 'Facebook User', plataforma: 'Facebook', menciones: 8, score: '0.87', scoreColor: '#ffb4ab', color: '#5c1a3f', initials: 'MQ' },
    { nombre: 'Jorge García', handle: '@jorge_delivery', plataforma: 'TikTok', menciones: 6, score: '0.74', scoreColor: '#f97316', color: '#1a5c3f', initials: 'JG' },
    { nombre: 'Ana Navarro', handle: 'Google Reviews', plataforma: 'Google', menciones: 5, score: '0.91', scoreColor: '#ffb4ab', color: '#7c3f1a', initials: 'AN' },
  ];

  /* ===== REPORTES RECIENTES ===== */
  reportesRecientes: ReporteReciente[] = [
    {
      nombre: 'Mensual Bembos Q3 - Final',
      fecha: '14 Oct, 2024',
      tipo: 'PDF',
      destinatarios: '4 personas',
      tamano: '2.4 MB',
      estado: 'LISTO',
      estadoColor: '#4ade80'
    },
    {
      nombre: 'Semana 41 - Sentimiento',
      fecha: '10 Oct, 2024',
      tipo: 'CSV',
      destinatarios: '2 personas',
      tamano: '0.8 MB',
      estado: 'LISTO',
      estadoColor: '#4ade80'
    },
    {
      nombre: 'Incidentes Q3 - Análisis',
      fecha: '01 Oct, 2024',
      tipo: 'Excel',
      destinatarios: '3 personas',
      tamano: '1.2 MB',
      estado: 'ARCHIVADO',
      estadoColor: '#929096'
    },
  ];
  showProgramarEnvio = false;
  programarEmail = '';
  programarFrecuencia = 'semanal';
  programarDia = 'lunes';
  programarFormato = 'pdf';
  programacionGuardada = false;

  abrirProgramar() { this.showProgramarEnvio = true; }
  cerrarProgramar() { this.showProgramarEnvio = false; this.programacionGuardada = false; }

  guardarProgramacion() {
    if (!this.programarEmail.trim()) return;
    this.programacionGuardada = true;
    setTimeout(() => {
      this.showProgramarEnvio = false;
      this.programacionGuardada = false;
    }, 1500);
  }

  diasSemana = [
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' },
  ];

  frecuenciasEnvio = [
    { key: 'diario', label: 'Diario' },
    { key: 'semanal', label: 'Semanal' },
    { key: 'mensual', label: 'Mensual' },
  ];
  /* ===== MÉTODOS ===== */
  toggleMetrica(m: Metrica) { m.checked = !m.checked; }
  seleccionarRango(key: string) { this.rangoSeleccionado = key; }
  seleccionarFrecuencia(key: string) { this.frecuenciaSeleccionada = key; }
  seleccionarFormato(key: string) { this.formatoSeleccionado = key; }

  generarReporte() {
    this.generandoReporte = true;
    setTimeout(() => { this.generandoReporte = false; }, 1500);
  }

  eliminarReporte(r: ReporteReciente) {
    this.reportesRecientes = this.reportesRecientes.filter(rep => rep.nombre !== r.nombre);
  }

  verReporte(r: ReporteReciente) {
    // TODO: abrir modal de vista previa
  }

  descargarReporte(r: ReporteReciente) {
    // TODO: conectar con endpoint de descarga
  }

  verHistorialCompleto() {
    // TODO: navegar a historial completo
  }

  nuevoReportePersonalizado() {
    // TODO: abrir flujo de creación personalizada
  }

  goToSection(section: string) { this.router.navigate([`/${section}`]); }
  goHome() { this.router.navigate(['/home']); }
}

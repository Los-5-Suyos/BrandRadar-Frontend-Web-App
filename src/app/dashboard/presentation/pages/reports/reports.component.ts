import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  positivo: number; // % de altura de la barra positiva (0-100)
  neutro: number;   // % de altura de la barra neutro apilada (0-100)
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

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  router = inject(Router);

  get workspaceName() {
    return typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceName') || 'Workspace' : 'Workspace';
  }

  get planLabel(): string {
    const plan = typeof window !== 'undefined' ? localStorage.getItem('workspacePlan') || 'FREE' : 'FREE';
    if (plan === 'PRO') return 'Pro';
    if (plan === 'ENTERPRISE') return 'Enterprise';
    return 'Basic';
  }

  // ===== Configuración del reporte =====
  rangosTiempo: OpcionToggle[] = [
    { key: '7d', label: 'Últimos 7 días' },
    { key: '30d', label: 'Últimos 30 días' },
    { key: '90d', label: 'Últimos 90 días' },
    { key: 'personalizado', label: 'Rango personalizado' },
  ];
  rangoSeleccionado = '30d';

  metricas: Metrica[] = [
    { key: 'sentimiento', label: 'Sentimiento', checked: true },
    { key: 'volumen', label: 'Volumen', checked: true },
    { key: 'competencia', label: 'Competencia', checked: false },
    { key: 'influencers', label: 'Influencers', checked: true },
  ];

  frecuencias: OpcionToggle[] = [
    { key: 'diario', label: 'Diario' },
    { key: 'semanal', label: 'Semanal' },
    { key: 'mensual', label: 'Mensual' },
  ];
  frecuenciaSeleccionada = 'semanal';

  formatos: OpcionToggle[] = [
    { key: 'pdf', label: 'PDF' },
    { key: 'csv', label: 'CSV' },
    { key: 'json', label: 'JSON' },
  ];
  formatoSeleccionado = 'pdf';

  generandoReporte = false;

  // ===== Resumen ejecutivo (vista previa en vivo) =====
  periodoResumen = 'Sept 2024 - Oct 2024';

  metricasResumen: MetricaResumen[] = [
    { label: 'SENTIMENT SCORE', valor: '82%', variacion: '+4.2% vs. periodo anterior', tendencia: 'up', color: '#4ade80' },
    { label: 'MENCIONES TOTALES', valor: '12.4k', variacion: '+12.3% vs. periodo anterior', tendencia: 'up', color: '#d4e4fa' },
    { label: 'REACH ESTIMATE', valor: '2.8M', variacion: '-2.5% vs. periodo anterior', tendencia: 'down', color: '#63a8ff' },
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

  // ===== Reportes recientes =====
  reportesRecientes: ReporteReciente[] = [
    {
      nombre: 'Mensual Bembos Q3 - Final',
      fecha: '14 Oct, 2024',
      tipo: 'PDF',
      destinatarios: '4 personas',
      tamano: '2.4 MB',
      estado: 'LISTO',
      estadoColor: '#4ade80'
    }
  ];

  // ===== Interacciones =====
  toggleMetrica(m: Metrica) {
    m.checked = !m.checked;
  }

  seleccionarRango(key: string) {
    this.rangoSeleccionado = key;
  }

  seleccionarFrecuencia(key: string) {
    this.frecuenciaSeleccionada = key;
  }

  seleccionarFormato(key: string) {
    this.formatoSeleccionado = key;
  }

  generarReporte() {
    this.generandoReporte = true;
    // TODO: conectar con backend para generar y encolar el reporte real
    setTimeout(() => { this.generandoReporte = false; }, 1500);
  }

  descargarReporte(reporte: ReporteReciente) {
    // TODO: conectar con endpoint de descarga real
  }

  verHistorialCompleto() {
    // TODO: navegar a la vista de historial completo de reportes
  }

  nuevoReportePersonalizado() {
    // TODO: abrir flujo de creación de reporte personalizado
  }

  goToSection(section: string) {
    this.router.navigate([`/${section}`]);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {SidebarComponent} from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-incidentes',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './incidents.component.html',
  styleUrl: './incidents.component.css'
})
export class IncidentsComponent {
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

  activeTab = 'todos';
  activeCrisisTab = 'diagnostico';
  selectedIncidente: any = null;
  copiedIndex: number | null = null;

  tabs = [
    { key: 'todos', label: 'Todos', count: 4, color: '#929096' },
    { key: 'alto', label: 'Alto', count: 1, color: '#ffb4ab' },
    { key: 'medio', label: 'Medio', count: 1, color: '#f97316' },
    { key: 'bajo', label: 'Bajo', count: 1, color: '#63f7ff' },
    { key: 'resuelto', label: 'Resueltos', count: 1, color: '#4ade80' },
  ];

  incidentes = [
    {
      id: 1,
      nivel: 'ALTO', estado: 'ACTIVO',
      nivelColor: '#ffb4ab', nivelBg: 'rgba(255,180,171,0.12)',
      estadoColor: '#ffb4ab', estadoBg: 'rgba(255,180,171,0.08)',
      titulo: 'Pico de quejas por demoras en delivery',
      descripcion: 'Detectado por la app tras analizar 234 menciones en las últimas 3 horas. Concentración en zonas de Miraflores y Surco.',
      menciones: 234, score: '0.88 NEG',
      tiempo: 'hace 2h 14m', progreso: 35,
      canales: [
        { nombre: 'Facebook', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg' },
        { nombre: 'TikTok', logo: 'https://img.magnific.com/vector-premium/logotipo-tik-tok_578229-290.jpg?semt=ais_hybrid&w=740&q=80' },
        { nombre: 'Twitter/X', logo: 'https://img.logo.dev/x.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true' }
      ],
      keywords: ['delivery', 'demora', 'tarde']
    },
    {
      id: 2,
      nivel: 'MEDIO', estado: 'ACTIVO',
      nivelColor: '#f97316', nivelBg: 'rgba(249,115,22,0.12)',
      estadoColor: '#f97316', estadoBg: 'rgba(249,115,22,0.08)',
      titulo: 'Comentarios sobre temperatura de productos',
      descripcion: 'Patrón detectado en reseñas de Google y Reddit. Los usuarios reportan productos fríos o mal empacados.',
      menciones: 89, score: '0.71 NEG',
      tiempo: 'hace 5h 30m', progreso: 0,
      canales: [
        { nombre: 'Google News', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Google_News_icon.svg/960px-Google_News_icon.svg.png' },
        { nombre: 'Reddit', logo: 'https://img.logo.dev/reddit.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true' }
      ],
      keywords: ['frío', 'empaque', 'calidad']
    },
    {
      id: 3,
      nivel: 'BAJO', estado: 'MONITOREADO',
      nivelColor: '#63f7ff', nivelBg: 'rgba(99,247,255,0.1)',
      estadoColor: '#63f7ff', estadoBg: 'rgba(99,247,255,0.06)',
      titulo: 'Mención negativa viral en YouTube',
      descripcion: 'Video con 15k vistas menciona negativamente el servicio. Tendencia estable sin crecimiento acelerado.',
      menciones: 32, score: '0.54 NEG',
      tiempo: 'hace 12h', progreso: 0,
      canales: [
        { nombre: 'YouTube', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg' }
      ],
      keywords: ['video', 'experiencia']
    },
    {
      id: 4,
      nivel: 'RESUELTO', estado: 'CERRADO',
      nivelColor: '#4ade80', nivelBg: 'rgba(74,222,128,0.1)',
      estadoColor: '#4ade80', estadoBg: 'rgba(74,222,128,0.06)',
      titulo: 'Queja por error en pedido en San Isidro',
      descripcion: 'Incidente resuelto tras respuesta pública y compensación al cliente. Sentimiento normalizado.',
      menciones: 18, score: '0.22 NEG',
      tiempo: 'hace 2 días', progreso: 100,
      canales: [
        { nombre: 'Facebook', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg' }
      ],
      keywords: ['pedido', 'error']
    }
  ];

  get filteredIncidentes() {
    if (this.activeTab === 'todos') return this.incidentes;
    if (this.activeTab === 'resuelto') return this.incidentes.filter(i => i.nivel === 'RESUELTO');
    return this.incidentes.filter(i => i.nivel === this.activeTab.toUpperCase());
  }

  selectIncidente(inc: any) {
    this.selectedIncidente = inc;
  }

  keywords = [
    { word: 'delivery', count: 312, pct: 100, color: '#ffb4ab' },
    { word: 'demora', count: 287, pct: 92, color: '#ffb4ab' },
    { word: 'frío', count: 198, pct: 63, color: '#f97316' },
    { word: 'repartidor', count: 145, pct: 46, color: '#f97316' },
    { word: 'calidad', count: 54, pct: 17, color: '#63f7ff' },
  ];

  aiDiagnostico = {
    texto: 'Se detecta un pico sostenido de menciones negativas durante 3 días consecutivos en Facebook (68% NEG) y TikTok (72% NEG), concentradas en las palabras clave "delivery", "demora" y "frío". El patrón indica un problema operacional recurrente sin respuesta pública de la marca.',
    mencionesAnalizadas: '1,247',
    scorePromedio: '0.84 NEG',
    tendencia: '↑ ALZA',
    sugerencias: [
      {
        tipo: 'mensaje',
        urgencia: 'URGENTE · HACER AHORA',
        urgenciaColor: '#ffb4ab',
        titulo: 'Publicar comunicado oficial en Facebook',
        desc: 'Reconocer el problema de delivery públicamente en los próximos 60 minutos.',
        borrador: '"Querida comunidad Bembos, somos conscientes de los inconvenientes con nuestro servicio de delivery. Estamos trabajando activamente para resolver los tiempos de espera. Lamentamos el inconveniente y ofrecemos compensación a todos los afectados."',
        plataforma: 'Facebook',
        plataformaUrl: 'https://facebook.com'
      },
      {
        tipo: 'accion',
        urgencia: 'MEDIA · ESTA SEMANA',
        urgenciaColor: '#63f7ff',
        titulo: 'Pausar contenido promocional 24-48 horas',
        desc: 'Publicar contenido de marketing durante una crisis activa genera contraste negativo con las quejas activas.'
      }
    ]
  };

  accionesEvitar = [
    'No eliminar comentarios',
    'No responder de forma corporativa',
    'No publicar promociones sin resolver'
  ];

  historialIA = [
    { fecha: 'Hoy 09:00', score: '0.88 NEG', color: '#ffb4ab', resumen: 'Pico detectado en delivery. Se recomendó comunicado inmediato.' },
    { fecha: 'Ayer 14:30', score: '0.71 NEG', color: '#f97316', resumen: 'Aumento moderado en quejas de temperatura de productos.' },
    { fecha: 'Hace 3 días', score: '0.45 NEG', color: '#63f7ff', resumen: 'Sentimiento estable. Sin acciones urgentes requeridas.' },
  ];

  copyText(text: string, index: number) {
    navigator.clipboard.writeText(text);
    this.copiedIndex = index;
    setTimeout(() => this.copiedIndex = null, 2000);
  }

  actualizarIA() {
    // conectar con Groq en el futuro
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

  historialResueltos = [
    { fecha: '12 Oct 2024', titulo: 'Queja masiva por tiempo de entrega', nivel: 'ALTO', nivelColor: '#ffb4ab', score: '0.87', resolucion: 'Comunicado enviado + refuerzo de delivery en Miraflores', duracion: '3 días' },
    { fecha: '28 Sep 2024', titulo: 'Comentarios negativos sobre nuevo menú', nivel: 'MEDIO', nivelColor: '#f97316', score: '0.62', resolucion: 'Se respondieron 18 comentarios y se ajustó la descripción del producto', duracion: '1 día' },
    { fecha: '10 Sep 2024', titulo: 'Pico de menciones negativas en Google Maps', nivel: 'ALTO', nivelColor: '#ffb4ab', score: '0.91', resolucion: 'Gestión interna con local afectado + mejora de rating posterior', duracion: '5 días' },
  ];

  guardarNuevaAlerta() {
    if (!this.nuevaAlertaTitulo.trim()) return;
    this.nuevaAlertaGuardada = true;
    setTimeout(() => {
      this.showNuevaAlertaModal = false;
      this.nuevaAlertaGuardada = false;
      this.nuevaAlertaTitulo = '';
      this.nuevaAlertaDesc = '';
      this.nuevaAlertaNivel = 'medio';
    }, 1500);
  }
}

import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);

  showNotifications = false;

  get workspaceName() {
    return typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceName') || 'Workspace' : 'Workspace';
  }

  get userName() {
    const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
    return email.split('@')[0] || 'Usuario';
  }

  get lastUpdate() {
    return 'Hace 4 minutos';
  }

  notifications = [
    { icon: 'warning', color: '#ffb4ab', title: 'Alerta de crisis detectada', desc: 'Sentimiento negativo +40%', time: 'Hace 5 min' },
    { icon: 'trending_down', color: '#c0c1ff', title: 'Reputación bajó 3 puntos', desc: 'Score bajó esta semana', time: 'Hace 1 hora' },
  ];

  hasActiveIncident = true;
  sentimentScore = 61;
  mentionsToday = 847;
  sparklinePoints = '0,35 20,30 40,32 60,20 80,25 100,15 120,18 140,10 160,15 180,8 200,12';

  activeIncidents = [
    { title: '#DeliveryLate Viralizado' },
    { title: 'Quejas por frío (App)' }
  ];

  // Canales completos con logos reales
  readonly allChannels = [
    {
      name: 'YouTube',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
      icon: null,
      index: 78,
      desc: 'Comentarios positivos en reseñas de producto',
      locked: false
    },
    {
      name: 'Facebook',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
      icon: null,
      index: 64,
      desc: 'Menciones negativas escalando en grupos de Lima Norte',
      locked: true
    },
    {
      name: 'Twitter / X',
      logo: 'https://img.logo.dev/x.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true',
      icon: null,
      index: 45,
      desc: 'Quejas virales sobre tiempo de espera',
      locked: true
    },
    {
      name: 'TikTok',
      logo: 'https://img.magnific.com/vector-premium/logotipo-tik-tok_578229-290.jpg?semt=ais_hybrid&w=740&q=80',
      icon: null,
      index: 70,
      desc: 'Tendencia positiva en contenido viral',
      locked: true
    },
    {
      name: 'Instagram',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
      icon: null,
      index: 82,
      desc: 'Alto engagement en contenido de marca',
      locked: true
    },
    {
      name: 'Google News',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Google_News_icon.svg/960px-Google_News_icon.svg.png',
      icon: null,
      index: 60,
      desc: 'Cobertura mediática de la marca',
      locked: true
    },
    {
      name: 'Reddit',
      logo: 'https://img.logo.dev/reddit.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true',
      icon: null,
      index: 55,
      desc: 'Discusiones mixtas en comunidades de nicho',
      locked: true
    },
    {
      name: 'Blogs / Web',
      logo: null,
      icon: 'article',
      index: 50,
      desc: 'Menciones en blogs y sitios web',
      locked: true
    },
  ];

  get activeChannels() {
    return this.allChannels;
  }

  get topSource() {
    return this.activeChannels[this.selectedSourceIndex] || this.activeChannels[0];
  }

  // Selector de fuentes
  showSourceDropdown = false;
  selectedSourceIndex = 0;

  selectSource(i: number, event: Event) {
    event.stopPropagation();
    if (!this.activeChannels[i].locked) {
      this.selectedSourceIndex = i;
      this.showSourceDropdown = false;
    }
  }

  toggleSourceDropdown(event: Event) {
    event.stopPropagation();
    this.showSourceDropdown = !this.showSourceDropdown;
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const wsId = localStorage.getItem('currentWorkspaceId');
      if (!wsId) {
        this.router.navigate(['/home']);
      }
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }
  chartLabels = [
    { x: 30, text: 'D1' }, { x: 77, text: 'D2' }, { x: 124, text: 'D3' },
    { x: 171, text: 'D4' }, { x: 218, text: 'D5' }, { x: 265, text: 'D6' },
    { x: 312, text: 'D7' }, { x: 359, text: 'D8' }, { x: 406, text: 'D9' },
    { x: 453, text: 'D10' }, { x: 500, text: 'D11' }, { x: 547, text: 'D12' },
    { x: 594, text: 'D13' }, { x: 641, text: 'D14' }, { x: 688, text: 'Hoy' }
  ];

  criticalKeywords = [
    { word: 'delivery', count: 412, pct: 100 },
    { word: 'demora', count: 384, pct: 85 },
    { word: 'frío / helado', count: 256, pct: 60 },
    { word: 'atención', count: 142, pct: 45 },
    { word: 'cupones', count: 98, pct: 30 },
  ];

  goToSection(section: string) {
    const routes: { [key: string]: string } = {
      'menciones': 'mentions',
      'incidentes': 'incidentes',
      'reportes': 'reportes',
      'configuracion': 'configuracion',
      'dashboard': 'dashboard'
    };
    this.router.navigate([`/${routes[section] || section}`]);
  }

  get planLabel(): string {
    const plan = typeof window !== 'undefined' ? localStorage.getItem('workspacePlan') || 'FREE' : 'FREE';
    if (plan === 'PRO') return 'PRO';
    if (plan === 'ENTERPRISE') return 'ENTERPRISE';
    return 'BÁSICO';
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}

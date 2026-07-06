import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { environment } from '../../../../../environments/environment';

interface Mencion {
  id: number;
  initials: string;
  color: string;
  usuario: string;
  handle: string;
  plataforma: string;
  plataformaIcon: string | null;
  tiempo: string;
  texto: string;
  keywords: string[];
  score: number;
  sentimiento: string;
  sentimientoColor: string;
  url: string;
  status: string;
  engagementLikes: number;
  engagementComments: number;
  engagementViews: number;
}

@Component({
  selector: 'app-mentions',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './mentions.component.html',
  styleUrl: './mentions.component.css',
})
export class MentionsComponent implements OnInit {
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

  get userName() {
    const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
    return email.split('@')[0] || 'Usuario';
  }

  get planLabel(): string {
    const plan =
      typeof window !== 'undefined' ? localStorage.getItem('workspacePlan') || 'FREE' : 'FREE';
    if (plan === 'PRO') return 'Pro';
    if (plan === 'ENTERPRISE') return 'Enterprises';
    return 'Basic';
  }

  get userRole(): string {
    return typeof window !== 'undefined' ? localStorage.getItem('userRole') || 'PYME' : 'PYME';
  }

  activeFilter = 'todos';
  searchQuery = '';
  selectedMencion: Mencion | null = null;
  showModal = false;
  loadingAI = false;
  aiResponse: any = null;

  filters = ['todos', 'negativo', 'neutro', 'positivo'];

  menciones: Mencion[] = [];
  activeMainTab = 'menciones';

  workspaceKeywords: string[] = [];

  activeChannel = 'todos';

  availableChannels: { name: string; logo: string | null; count: number; channelType: string }[] =
    [];

  // Mismo criterio que dashboard/configuración: solo mostramos como canal real
  // uno que el backend tenga implementado de verdad.
  private readonly IMPLEMENTED_CHANNELS = ['YOUTUBE', 'TWITTER', 'REDDIT', 'TIKTOK'];

  private readonly platformDisplay: Record<string, { label: string; icon: string | null }> = {
    YOUTUBE: {
      label: 'YouTube',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
    },
    FACEBOOK: {
      label: 'Facebook',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
    },
    TWITTER: {
      label: 'Twitter/X',
      icon: 'https://img.logo.dev/x.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true',
    },
    TIKTOK: {
      label: 'TikTok',
      icon: 'https://img.magnific.com/vector-premium/logotipo-tik-tok_578229-290.jpg?semt=ais_hybrid&w=740&q=80',
    },
    INSTAGRAM: {
      label: 'Instagram',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
    },
    GOOGLE_NEWS: {
      label: 'Google News',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Google_News_icon.svg/960px-Google_News_icon.svg.png',
    },
    REDDIT: {
      label: 'Reddit',
      icon: 'https://img.logo.dev/reddit.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true',
    },
    BLOGS: { label: 'Blogs / Web', icon: null },
  };

  get filteredMenciones() {
    return this.menciones.filter((m) => {
      const matchFilter =
        this.activeFilter === 'todos' || m.sentimiento.toLowerCase() === this.activeFilter;
      const matchChannel = this.activeChannel === 'todos' || m.plataforma === this.activeChannel;
      const matchSearch =
        !this.searchQuery ||
        m.texto.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        m.usuario.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchFilter && matchChannel && matchSearch;
    });
  }

  get publicaciones() {
    // "Publicaciones" = menciones con engagement real (likes/comentarios/vistas)
    return this.menciones.filter(
      (m) => m.engagementLikes > 0 || m.engagementComments > 0 || m.engagementViews > 0,
    );
  }

  highlightText(texto: string, keywords: string[]): string {
    if (!keywords.length) return texto;
    let result = texto;
    keywords.forEach((kw) => {
      const regex = new RegExp(`(${kw})`, 'gi');
      result = result.replace(regex, '<mark class="kw-highlight">$1</mark>');
    });
    return result;
  }

  showExportModal = false;

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
          this.loadKeywords();
          this.loadMentions();
          this.loadChannelCounts();
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadKeywords() {
    if (!this.brandId) return;
    this.http.get<any[]>(`${this.baseUrl}/brands/${this.brandId}/keywords`).subscribe({
      next: (data) => {
        this.workspaceKeywords = data.map((k) => k.keyword);
      },
      error: () => {},
    });
  }

  loadMentions() {
    if (!this.brandId) return;
    this.loading = true;
    this.http.get<any[]>(`${this.baseUrl}/mentions/brand/${this.brandId}`).subscribe({
      next: (data) => {
        this.menciones = data.map((m) => this.mapMention(m));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadChannelCounts() {
    if (!this.brandId) return;
    this.http
      .get<any[]>(`${this.baseUrl}/mentions/brand/${this.brandId}/channel-counts`)
      .subscribe({
        next: (data) => {
          this.availableChannels = data
            .filter((c) => this.IMPLEMENTED_CHANNELS.includes(c.platform))
            .map((c) => {
              const tpl = this.platformDisplay[c.platform] || { label: c.platform, icon: null };
              return { name: tpl.label, logo: tpl.icon, count: c.count, channelType: c.platform };
            });
        },
        error: () => {},
      });
  }

  private mapMention(m: any): Mencion {
    const tpl = this.platformDisplay[m.sourcePlatform] || { label: m.sourcePlatform, icon: null };
    const compound = m.sentimentCompound ?? 0;
    let sentimiento = 'NEUTRO',
      color = '#f97316';
    if (compound > 0.3) {
      sentimiento = 'POSITIVO';
      color = '#63f7ff';
    } else if (compound < -0.3) {
      sentimiento = 'NEGATIVO';
      color = '#ffb4ab';
    }

    const nombre = m.author || 'Anónimo';
    const initials = nombre
      .split(' ')
      .map((p: string) => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return {
      id: m.id,
      initials,
      color: this.colorFromString(nombre),
      usuario: nombre,
      handle: m.authorHandle || tpl.label,
      plataforma: m.sourcePlatform,
      plataformaIcon: tpl.icon,
      tiempo: this.relativeTime(m.publishedAt),
      texto: m.content,
      keywords: this.workspaceKeywords.filter((k) =>
        m.content?.toLowerCase().includes(k.toLowerCase()),
      ),
      score: Math.abs(compound),
      sentimiento,
      sentimientoColor: color,
      url: m.sourceUrl || '#',
      status: m.status || 'PENDIENTE',
      engagementLikes: m.engagementLikes || 0,
      engagementComments: m.engagementComments || 0,
      engagementViews: m.engagementViews || 0,
    };
  }

  private colorFromString(s: string): string {
    const palette = ['#3b3f8c', '#5c1a3f', '#1a5c3f', '#7c3f1a'];
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
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

  exportar(formato: string) {
    if (!this.brandId) return;
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl}/mentions/brand/${this.brandId}/export?format=${formato}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `menciones.${formato === 'excel' ? 'xlsx' : formato}`;
        link.click();
      });
    this.showExportModal = false;
  }

  openModal(m: Mencion) {
    this.selectedMencion = m;
    this.showModal = true;
    this.aiResponse = null;
    this.generateAI(m);
  }

  closeModal() {
    this.showModal = false;
    this.selectedMencion = null;
    this.aiResponse = null;
  }

  generateAI(mencion: Mencion) {
    this.loadingAI = true;
    this.http.post<any>(`${this.baseUrl}/mentions/${mencion.id}/ai-analysis`, {}).subscribe({
      next: (data) => {
        this.aiResponse = data;
        this.loadingAI = false;
      },
      error: () => {
        this.aiResponse = {
          analisis: 'No se pudo generar el análisis automático.',
          estrategia: 'Revisa la mención manualmente y toma acción.',
          borrador: 'Gracias por tu comentario. Estamos trabajando para mejorar tu experiencia.',
          accion: 'Crear Incidente',
        };
        this.loadingAI = false;
      },
    });
  }

  get totalMenciones(): number {
    return this.menciones.length;
  }

  get sentimientoDominante(): string {
    const counts: Record<string, number> = { POSITIVO: 0, NEUTRO: 0, NEGATIVO: 0 };
    this.menciones.forEach((m) => counts[m.sentimiento]++);
    const max = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return max ? max[0] : 'NEUTRO';
  }

  get sentimientoDominantePct(): number {
    if (this.menciones.length === 0) return 0;
    const dominante = this.sentimientoDominante;
    const count = this.menciones.filter((m) => m.sentimiento === dominante).length;
    return Math.round((count / this.menciones.length) * 100);
  }

  get canalMasActivo() {
    return this.availableChannels[0] || null;
  }

  get alertaReciente(): Mencion | null {
    return this.menciones.find((m) => m.sentimiento === 'NEGATIVO') || null;
  }

  get fuentesCriticas() {
    const byPlatform: Record<string, { total: number; neg: number; icon: string | null }> = {};
    this.menciones.forEach((m) => {
      if (!byPlatform[m.plataforma])
        byPlatform[m.plataforma] = { total: 0, neg: 0, icon: m.plataformaIcon };
      byPlatform[m.plataforma].total++;
      if (m.sentimiento === 'NEGATIVO') byPlatform[m.plataforma].neg++;
    });
    return Object.entries(byPlatform)
      .map(([platform, stats]) => ({
        platform,
        icon: stats.icon,
        pct: Math.round((stats.neg / stats.total) * 100),
      }))
      .filter((f) => f.pct > 0)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 3);
  }

  marcarAtendida(m: Mencion) {
    const nuevoStatus = m.status === 'ATENDIDA' ? 'PENDIENTE' : 'ATENDIDA';
    this.http.patch(`${this.baseUrl}/mentions/${m.id}/status`, { status: nuevoStatus }).subscribe({
      next: () => {
        m.status = nuevoStatus;
      },
    });
  }

  crearIncidente(m: Mencion) {
    this.http.post<number>(`${this.baseUrl}/mentions/${m.id}/create-incident`, {}).subscribe({
      next: () => {
        m.status = 'ATENDIDA';
        this.closeModal();
        this.router.navigate(['/incidents']);
      },
    });
  }

  tiktokComments: any[] = [];
  loadingTiktokComments = false;

  verComentariosTikTok(m: Mencion) {
    this.loadingTiktokComments = true;
    this.tiktokComments = [];
    this.http.get<any>(`${this.baseUrl}/mentions/${m.id}/tiktok-comments`).subscribe({
      next: (data) => {
        this.tiktokComments = data.comments || [];
        this.loadingTiktokComments = false;
      },
      error: () => {
        this.loadingTiktokComments = false;
      },
    });
  }

  copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  goToSection(section: string) {
    this.router.navigate([`/${section}`]);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}

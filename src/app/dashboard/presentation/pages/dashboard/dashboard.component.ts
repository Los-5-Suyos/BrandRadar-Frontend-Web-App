import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { environment } from '../../../../../environments/environment';

interface ChannelConfig {
  name: string;
  logo: string | null;
  icon: string | null;
  index: number;
  desc: string;
  locked: boolean;
  channelType: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  showNotifications = false;
  loading = true;
  brandId: number | null = null;

  get workspaceName() {
    return typeof window !== 'undefined'
      ? localStorage.getItem('currentWorkspaceName') || 'Workspace'
      : 'Workspace';
  }

  get userName() {
    const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
    return email.split('@')[0] || 'Usuario';
  }

  lastUpdatedAt: string | null = null;
  get lastUpdate() {
    if (!this.lastUpdatedAt) return 'Sin datos';
    const diffMs = Date.now() - new Date(this.lastUpdatedAt).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Hace instantes';
    if (mins < 60) return `Hace ${mins} minuto${mins === 1 ? '' : 's'}`;
    const hours = Math.floor(mins / 60);
    return `Hace ${hours} hora${hours === 1 ? '' : 's'}`;
  }

  notifications: { icon: string; color: string; title: string; desc: string; time: string }[] = [];

  hasActiveIncident = false;
  sentimentScore = 50;
  scoreDeltaVsYesterday: number | null = null;
  mentionsToday = 0;
  mentionsDeltaPercent: number | null = null;
  positivePercent = 0;
  neutralPercent = 0;
  negativePercent = 0;
  crisisAnalysis: string | null = null;

  sparklinePoints = '';
  trendPolylinePoints = '';
  trendPolygonPoints = '';

  activeIncidentsCount = 0;
  activeIncidents: { id: number; title: string }[] = [];

  private readonly channelTemplates: Record<
    string,
    { name: string; logo: string | null; icon: string | null }
  > = {
    YOUTUBE: {
      name: 'YouTube',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
      icon: null,
    },
    FACEBOOK: {
      name: 'Facebook',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
      icon: null,
    },
    TWITTER: {
      name: 'Twitter / X',
      logo: 'https://img.logo.dev/x.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true',
      icon: null,
    },
    TIKTOK: {
      name: 'TikTok',
      logo: 'https://img.magnific.com/vector-premium/logotipo-tik-tok_578229-290.jpg?semt=ais_hybrid&w=740&q=80',
      icon: null,
    },
    INSTAGRAM: {
      name: 'Instagram',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
      icon: null,
    },
    GOOGLE_NEWS: {
      name: 'Google News',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Google_News_icon.svg/960px-Google_News_icon.svg.png',
      icon: null,
    },
    REDDIT: {
      name: 'Reddit',
      logo: 'https://img.logo.dev/reddit.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true',
      icon: null,
    },
    BLOGS: { name: 'Blogs / Web', logo: null, icon: 'article' },
  };

  allChannels: ChannelConfig[] = [];

  get activeChannels() {
    return this.allChannels;
  }

  get topSource(): ChannelConfig {
    return (
      this.activeChannels[this.selectedSourceIndex] ||
      this.activeChannels[0] || {
        name: 'Sin datos',
        logo: null,
        icon: 'article',
        index: 0,
        desc: 'Aún no hay menciones registradas',
        locked: false,
        channelType: '',
      }
    );
  }

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

  chartLabels: { x: number; text: string }[] = [];

  criticalKeywords: { word: string; count: number; pct: number }[] = [];

  showAlertsModal = false;

  private readonly alertPreferenceTemplates: { key: string; label: string; desc: string }[] = [
    {
      key: 'SCORE_DROP',
      label: 'Caída de SentimentScore',
      desc: 'Cuando baje más de 10 puntos en 24h',
    },
    {
      key: 'NEGATIVE_SPIKE',
      label: 'Pico de menciones negativas',
      desc: 'Cuando supere el 50% de negativas',
    },
    {
      key: 'CRITICAL_KEYWORD',
      label: 'Keyword crítica detectada',
      desc: 'Al aparecer palabras de riesgo configuradas',
    },
    {
      key: 'NEW_INCIDENT',
      label: 'Nuevo incidente detectado',
      desc: 'Cuando la IA clasifica un patrón como incidente',
    },
    {
      key: 'HIGH_VOLUME',
      label: 'Volumen inusual de menciones',
      desc: 'Cuando se supera el promedio diario en 3x',
    },
  ];

  alertPreferences: { key: string; label: string; desc: string; enabled: boolean }[] = [];

  private readonly CIRCUMFERENCE = 2 * Math.PI * 35;

  get positiveDasharray() {
    const len = (this.positivePercent / 100) * this.CIRCUMFERENCE;
    return `${len} ${this.CIRCUMFERENCE - len}`;
  }
  get neutralDasharray() {
    const len = (this.neutralPercent / 100) * this.CIRCUMFERENCE;
    return `${len} ${this.CIRCUMFERENCE - len}`;
  }
  get negativeDasharray() {
    const len = (this.negativePercent / 100) * this.CIRCUMFERENCE;
    return `${len} ${this.CIRCUMFERENCE - len}`;
  }
  get neutralDashoffset() {
    return -((this.positivePercent / 100) * this.CIRCUMFERENCE);
  }
  get negativeDashoffset() {
    return -(((this.positivePercent + this.neutralPercent) / 100) * this.CIRCUMFERENCE);
  }

  goToSection(section: string) {
    const routes: { [key: string]: string } = {
      menciones: 'mentions',
      incidentes: 'incidentes',
      reportes: 'reportes',
      configuracion: 'configuracion',
      dashboard: 'dashboard',
    };
    this.router.navigate([`/${routes[section] || section}`]);
  }

  get planLabel(): string {
    const plan =
      typeof window !== 'undefined' ? localStorage.getItem('workspacePlan') || 'FREE' : 'FREE';
    if (plan === 'PRO') return 'Pro';
    if (plan === 'ENTERPRISE') return 'Enterprise';
    return 'Basic';
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    if (typeof window === 'undefined') return;
    const wsId = localStorage.getItem('currentWorkspaceId');
    if (!wsId) {
      this.router.navigate(['/home']);
      return;
    }
    this.loadDashboard(wsId);
    this.loadNotifications();
  }

  loadDashboard(workspaceId: string) {
    this.loading = true;
    this.http.get<any>(`${this.baseUrl}/workspaces/${workspaceId}/dashboard`).subscribe({
      next: (data) => {
        this.brandId = data.brandId;
        this.sentimentScore = Math.round(data.sentimentScore ?? 50);
        this.scoreDeltaVsYesterday = data.scoreDeltaVsYesterday;
        this.mentionsToday = data.mentionsToday ?? 0;
        this.mentionsDeltaPercent = data.mentionsDeltaVsYesterdayPercent;
        this.positivePercent = data.positivePercent ?? 0;
        this.neutralPercent = data.neutralPercent ?? 0;
        this.negativePercent = data.negativePercent ?? 0;
        this.crisisAnalysis = data.crisisAnalysis;
        this.hasActiveIncident = !!data.crisisAnalysis;
        this.lastUpdatedAt = data.lastUpdatedAt;

        this.activeIncidentsCount = data.activeIncidents?.count ?? 0;
        this.activeIncidents = (data.activeIncidents?.items ?? []).map((i: any) => ({
          id: i.id,
          title: i.title,
        }));

        this.loading = false;

        if (this.brandId) {
          this.loadTrend(workspaceId);
          this.loadChannels(workspaceId);
          this.loadCriticalKeywords(workspaceId);
          this.loadAlertPreferences(this.brandId);
        }
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadTrend(workspaceId: string) {
    this.http
      .get<any>(`${this.baseUrl}/workspaces/${workspaceId}/dashboard/trend?days=14`)
      .subscribe({
        next: (data) => {
          const points = data.points ?? [];
          if (points.length === 0) return;

          const maxScore = 100;
          const chartWidth = 700;
          const chartHeight = 200;
          const leftPad = 30;
          const rightPad = 12;
          const usableWidth = chartWidth - leftPad - rightPad;

          const coords = points.map((p: any, i: number) => {
            const x = leftPad + (points.length > 1 ? (i / (points.length - 1)) * usableWidth : 0);
            const y = chartHeight - 40 - (p.sentimentScore / maxScore) * (chartHeight - 60);
            return { x: Math.round(x), y: Math.round(y), date: p.date };
          });

          this.trendPolylinePoints = coords.map((c: any) => `${c.x},${c.y}`).join(' ');
          this.trendPolygonPoints =
            this.trendPolylinePoints +
            ` ${coords[coords.length - 1].x},${chartHeight} ${coords[0].x},${chartHeight}`;

          this.chartLabels = coords.map((c: any, i: number) => ({
            x: c.x,
            text: i === coords.length - 1 ? 'Hoy' : new Date(c.date).getDate().toString(),
          }));

          const maxMentions = Math.max(...points.map((p: any) => p.mentionsCount), 1);
          this.sparklinePoints = points
            .map((p: any, i: number) => {
              const x = points.length > 1 ? (i / (points.length - 1)) * 200 : 0;
              const y = 44 - (p.mentionsCount / maxMentions) * 40;
              return `${Math.round(x)},${Math.round(y)}`;
            })
            .join(' ');
        },
      });
  }

  loadChannels(workspaceId: string) {
    this.http.get<any>(`${this.baseUrl}/workspaces/${workspaceId}/dashboard/channels`).subscribe({
      next: (data) => {
        const channels = data.channels ?? [];
        const seen = new Set(channels.map((c: any) => c.channelType));

        const real: ChannelConfig[] = channels.map((c: any) => {
          const tpl = this.channelTemplates[c.channelType] || {
            name: c.channelType,
            logo: null,
            icon: 'article',
          };
          return {
            name: tpl.name,
            logo: tpl.logo,
            icon: tpl.icon,
            index: Math.round(c.sentimentIndex),
            desc: c.topInsight || 'Sin datos suficientes',
            locked: false,
            channelType: c.channelType,
          };
        });

        const placeholders: ChannelConfig[] = Object.entries(this.channelTemplates)
          .filter(([type]) => !seen.has(type))
          .map(([type, tpl]) => ({
            name: tpl.name,
            logo: tpl.logo,
            icon: tpl.icon,
            index: 0,
            desc: 'Canal aún sin datos',
            locked: true,
            channelType: type,
          }));

        this.allChannels = [...real, ...placeholders];
        this.selectedSourceIndex = 0;
      },
    });
  }

  loadCriticalKeywords(workspaceId: string) {
    this.http
      .get<any>(`${this.baseUrl}/workspaces/${workspaceId}/dashboard/critical-keywords`)
      .subscribe({
        next: (data) => {
          this.criticalKeywords = (data.keywords ?? []).map((k: any) => ({
            word: k.keyword,
            count: k.count,
            pct: k.percentOfMax,
          }));
        },
      });
  }

  loadAlertPreferences(brandId: number) {
    this.http.get<any[]>(`${this.baseUrl}/brands/${brandId}/alert-preferences`).subscribe({
      next: (data) => {
        this.alertPreferences = this.alertPreferenceTemplates.map((tpl) => {
          const match = data.find((d) => d.key === tpl.key);
          return { ...tpl, enabled: match ? match.enabled : true };
        });
      },
    });
  }

  toggleAlertPreference(pref: { key: string; enabled: boolean }) {
    if (!this.brandId) return;
    const newValue = !pref.enabled;
    this.http
      .patch(`${this.baseUrl}/brands/${this.brandId}/alert-preferences/${pref.key}`, {
        enabled: newValue,
      })
      .subscribe({
        next: () => {
          pref.enabled = newValue;
        },
        error: () => {},
      });
  }

  loadNotifications() {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (!userId) return;
    this.http.get<any[]>(`${this.baseUrl}/user-accounts/${userId}/notifications`).subscribe({
      next: (data) => {
        this.notifications = data.slice(0, 10).map((n: any) => ({
          icon:
            n.type === 'CRISIS_ALERT'
              ? 'warning'
              : n.type === 'SCORE_DROP'
                ? 'trending_down'
                : 'notifications',
          color: n.type === 'CRISIS_ALERT' ? '#ffb4ab' : '#c0c1ff',
          title: n.title,
          desc: n.message,
          time: this.relativeTime(n.createdAt),
        }));
      },
      error: () => {},
    });
  }

  private relativeTime(isoDate: string): string {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Hace instantes';
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  }

  refresh() {
    if (typeof window === 'undefined') return;
    const wsId = localStorage.getItem('currentWorkspaceId');
    if (!wsId) return;
    this.loading = true;
    this.http.post(`${this.baseUrl}/workspaces/${wsId}/refresh`, {}).subscribe({
      next: () => {
        this.loadDashboard(wsId);
        this.loadNotifications();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}

import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  router = inject(Router);
  http = inject(HttpClient);
  cdr = inject(ChangeDetectorRef);

  workspaces: any[] = [];
  loading = true;
  showNotifications = false;
  searchQuery = '';
  showDeleteConfirm: number | null = null;
  showMenuId: number | null = null;
  deletingId: number | null = null;
  deleteError: string | null = null;
  // Guarda el id del workspace del último error de borrado. deletingId vuelve a
  // null apenas responde el error (para reactivar el botón), así que no sirve
  // para decidir a qué card mostrarle el mensaje de error.
  deleteErrorId: number | null = null;

  // Modal crear workspace
  showCreateWorkspace = false;
  newWsName = '';
  newWsLogoPreview: string | null = null;
  newWsLogoFile: File | null = null;
  newWsInclusionTags: string[] = [];
  newWsExclusionTags: string[] = [];
  newInclusionInput = '';
  newExclusionInput = '';
  creatingWorkspace = false;
  createWorkspaceError: string | null = null;

  // Canales del plan Basic (los realmente implementados en backend hoy):
  // YouTube, Twitter/X, Reddit y TikTok. El resto queda bloqueado hasta Pro/Enterprise.
  // El usuario elige, al crear el workspace, cuáles de los canales disponibles
  // en su plan quiere activar (mínimo 1).
  channels = [
    {
      name: 'YouTube',
      channelType: 'YOUTUBE',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
      icon: null,
      selected: true,
      locked: false,
    },
    {
      name: 'Twitter / X',
      channelType: 'TWITTER',
      logo: 'https://img.logo.dev/x.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true',
      icon: null,
      selected: true,
      locked: false,
    },
    {
      name: 'Reddit',
      channelType: 'REDDIT',
      logo: 'https://img.logo.dev/reddit.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true',
      icon: null,
      selected: true,
      locked: false,
    },
    {
      name: 'TikTok',
      channelType: 'TIKTOK',
      logo: 'https://img.magnific.com/vector-premium/logotipo-tik-tok_578229-290.jpg?semt=ais_hybrid&w=740&q=80',
      icon: null,
      selected: true,
      locked: false,
    },
    {
      name: 'Facebook',
      channelType: 'FACEBOOK',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
      icon: null,
      selected: false,
      locked: true,
    },
    {
      name: 'Instagram',
      channelType: 'INSTAGRAM',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
      icon: null,
      selected: false,
      locked: true,
    },
    {
      name: 'Google News',
      channelType: 'GOOGLE_NEWS',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Google_News_icon.svg/960px-Google_News_icon.svg.png',
      icon: null,
      selected: false,
      locked: true,
    },
    { name: 'Blogs / Web', channelType: 'BLOGS', logo: null, icon: 'article', selected: false, locked: true },
  ];

  channelSelectionError: string | null = null;

  toggleChannelSelection(ch: { locked: boolean; selected: boolean; name: string }) {
    if (ch.locked) return;
    if (ch.selected) {
      const seleccionados = this.channels.filter((c) => !c.locked && c.selected).length;
      if (seleccionados <= 1) {
        this.channelSelectionError = 'Debes mantener al menos un canal seleccionado.';
        return;
      }
    }
    this.channelSelectionError = null;
    ch.selected = !ch.selected;
  }

  notifications: { icon: string; color: string; title: string; desc: string; time: string }[] = [];

  readonly wsColors = ['#3b3f8c', '#7c3f1a', '#1a5c3f', '#5c1a3f'];
  readonly wsScores = [78, 58, 65, 71];
  readonly wsMentions = [47, 32, 21, 15];
  readonly wsIncidents = [2, 0, 1, 0];

  get userId() {
    return typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';
  }

  get userName() {
    const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
    return email.split('@')[0] || 'Usuario';
  }

  get userRole(): string {
    return typeof window !== 'undefined' ? localStorage.getItem('userRole') || 'PYME' : 'PYME';
  }

  get roleLabel(): string {
    return this.userRole === 'AGENCIA' ? 'AGENCIA' : 'PYME';
  }

  get maxWorkspaces(): number {
    return this.userRole === 'AGENCIA' ? 2 : 1;
  }

  get canAddWorkspace(): boolean {
    return this.workspaces.length < this.maxWorkspaces;
  }

  get greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  get filteredWorkspaces() {
    if (!this.searchQuery) return this.workspaces;
    return this.workspaces.filter((ws) =>
      ws.name.toLowerCase().includes(this.searchQuery.toLowerCase()),
    );
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  get planLabel(): string {
    const plan =
      typeof window !== 'undefined' ? localStorage.getItem('workspacePlan') || 'FREE' : 'FREE';
    if (plan === 'PRO') return 'Pro';
    if (plan === 'ENTERPRISE') return 'Enterprise';
    return 'Basic';
  }

  get planChannelsDesc(): string {
    const plan =
      typeof window !== 'undefined' ? localStorage.getItem('workspacePlan') || 'FREE' : 'FREE';
    if (plan === 'ENTERPRISE') return 'Todos los canales disponibles';
    if (plan === 'PRO')
      return 'YouTube, Facebook, Twitter, TikTok, Instagram, Google News, Reddit y Blogs disponibles';
    return 'YouTube, Twitter/X, Reddit y TikTok disponibles';
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (userId && token) {
        this.loadWorkspaces(userId, token);
        this.loadNotifications(userId);
      }
    }
  }

  loadNotifications(userId: string) {
    this.http
      .get<any[]>(`${environment.apiBaseUrl}/user-accounts/${userId}/notifications`)
      .subscribe({
        next: (data) => {
          this.notifications = data.slice(0, 10).map((n: any) => ({
            icon:
              n.type === 'CRISIS_ALERT'
                ? 'warning'
                : n.type === 'SCORE_DROP'
                  ? 'trending_down'
                  : 'mark_chat_unread',
            color:
              n.type === 'CRISIS_ALERT'
                ? '#ffb4ab'
                : n.type === 'SCORE_DROP'
                  ? '#c0c1ff'
                  : '#4ade80',
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
    if (mins < 60) return `Hace ${mins} minuto${mins === 1 ? '' : 's'}`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours} hora${hours === 1 ? '' : 's'}`;
    const days = Math.floor(hours / 24);
    return `Hace ${days} día${days === 1 ? '' : 's'}`;
  }

  loadWorkspaces(userId: string, token: string) {
    this.loading = true;
    const url = `${environment.apiBaseUrl}/workspaces/user/${userId}`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.workspaces = data.map((ws: any, i: number) => ({
          ...ws,
          score: 0,
          mentions: 0,
          incidents: 0,
          color: this.wsColors[i % 4],
        }));
        this.loading = false;
        this.cdr.detectChanges();
        this.workspaces.forEach((ws) => this.loadWorkspaceStats(ws));
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadWorkspaceStats(ws: any) {
    this.http.get<any>(`${environment.apiBaseUrl}/workspaces/${ws.id}/dashboard`).subscribe({
      next: (data) => {
        ws.score = Math.round(data.sentimentScore ?? 0);
        ws.mentions = data.totalMentions ?? 0;
        ws.incidents = data.activeIncidents?.count ?? 0;
        this.cdr.detectChanges();
      },
      error: () => {}, // workspace sin marca/datos todavía: se queda en 0, no es un error real
    });
  }

  goToWorkspace(workspace: any) {
    localStorage.setItem('currentWorkspaceId', workspace.id);
    localStorage.setItem('currentWorkspaceName', workspace.name);
    this.router.navigate(['/loading'], { queryParams: { redirect: 'dashboard' } });
  }

  deleteWorkspace(id: number) {
    this.deletingId = id;
    this.deleteError = null;
    this.deleteErrorId = null;
    this.http.delete(`${environment.apiBaseUrl}/workspaces/${id}`).subscribe({
      next: () => {
        this.workspaces = this.workspaces.filter((ws) => ws.id !== id);
        this.showDeleteConfirm = null;
        this.deletingId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al eliminar workspace:', err);
        this.deletingId = null;
        this.deleteErrorId = id;
        this.deleteError =
          err.status === 409 || err.status === 400
            ? 'No se pudo eliminar: el workspace tiene datos asociados (menciones, incidentes, etc.).'
            : 'No se pudo eliminar el workspace. Intenta nuevamente.';
        this.cdr.detectChanges();
      },
    });
  }

  addWorkspace() {
    if (this.canAddWorkspace) {
      this.showCreateWorkspace = true;
    }
  }

  closeCreateWorkspace() {
    this.showCreateWorkspace = false;
    this.newWsName = '';
    this.newWsLogoPreview = null;
    this.newWsLogoFile = null;
    this.newWsInclusionTags = [];
    this.newWsExclusionTags = [];
    this.newInclusionInput = '';
    this.newExclusionInput = '';
    this.creatingWorkspace = false;
    this.createWorkspaceError = null;
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.newWsLogoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.newWsLogoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  addInclusionTag() {
    const val = this.newInclusionInput.trim();
    if (val && !this.newWsInclusionTags.includes(val)) {
      this.newWsInclusionTags.push(val);
    }
    this.newInclusionInput = '';
  }

  removeInclusionTag(tag: string) {
    this.newWsInclusionTags = this.newWsInclusionTags.filter((t) => t !== tag);
  }

  addExclusionTag() {
    const val = this.newExclusionInput.trim();
    if (val && !this.newWsExclusionTags.includes(val)) {
      this.newWsExclusionTags.push(val);
    }
    this.newExclusionInput = '';
  }

  removeExclusionTag(tag: string) {
    this.newWsExclusionTags = this.newWsExclusionTags.filter((t) => t !== tag);
  }

  createWorkspace() {
    const name = this.newWsName.trim();
    if (!name || !this.userId) return;

    this.creatingWorkspace = true;
    this.createWorkspaceError = null;

    const selectedChannelTypes = this.channels
      .filter((c) => !c.locked && c.selected)
      .map((c) => c.channelType);

    if (selectedChannelTypes.length === 0) {
      this.creatingWorkspace = false;
      this.createWorkspaceError = 'Selecciona al menos un canal de análisis.';
      return;
    }

    this.http
      .post<any>(`${environment.apiBaseUrl}/workspaces`, {
        userId: Number(this.userId),
        name,
        plan: 'FREE',
      })
      .subscribe({
        next: (ws) => {
          // Activamos únicamente los canales que el usuario seleccionó para
          // este workspace (mínimo 1, ya validado arriba).
          selectedChannelTypes.forEach((channelType) => {
            this.http
              .post(`${environment.apiBaseUrl}/workspaces/${ws.id}/channels`, { channelType })
              .subscribe({ error: () => {} });
          });

          // Crea la marca asociada al workspace (mentions/incidentes/config la requieren)
          this.http
            .post<any>(`${environment.apiBaseUrl}/brands`, { workspaceId: ws.id, name })
            .subscribe({
              next: (brand) => {
                this.newWsInclusionTags.forEach((kw) => {
                  this.http
                    .post(`${environment.apiBaseUrl}/brands/${brand.id}/keywords`, {
                      keyword: kw,
                      matchType: 'PARTIAL',
                    })
                    .subscribe({ error: () => {} });
                });
                this.newWsExclusionTags.forEach((kw) => {
                  this.http
                    .post(`${environment.apiBaseUrl}/workspaces/${ws.id}/exclusion-keywords`, {
                      keyword: kw,
                    })
                    .subscribe({ error: () => {} });
                });
              },
              error: () => {},
            });

          if (this.newWsLogoFile) {
            const formData = new FormData();
            formData.append('file', this.newWsLogoFile);
            this.http
              .post(`${environment.apiBaseUrl}/workspaces/${ws.id}/config/logo`, formData)
              .subscribe({ error: () => {} });
          }

          this.workspaces.push({
            ...ws,
            score: 0,
            mentions: 0,
            incidents: 0,
            color: this.wsColors[this.workspaces.length % 4],
          });
          this.closeCreateWorkspace();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.creatingWorkspace = false;
          this.createWorkspaceError =
            err.status === 403
              ? 'Alcanzaste el límite de workspaces de tu plan.'
              : 'No se pudo crear el workspace. Intenta nuevamente.';
          this.cdr.detectChanges();
        },
      });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  toggleMenu(id: number, event: Event) {
    event.stopPropagation();
    this.showMenuId = this.showMenuId === id ? null : id;
  }

  closeMenus() {
    this.showMenuId = null;
  }

  getLogoUrl(name: string): string {
    const domains: { [key: string]: string } = {
      netflix: 'netflix.com',
      uber: 'uber.com',
      bembos: 'bembos.com.pe',
      rimac: 'rimac.com.pe',
      bbva: 'bbva.com',
      bcp: 'viabcp.com',
      'coca cola': 'coca-cola.com',
      samsung: 'samsung.com',
    };
    const key = name.toLowerCase();
    for (const brand in domains) {
      if (key.includes(brand)) {
        return `https://img.logo.dev/${domains[brand]}?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ`;
      }
    }
    return '';
  }
}

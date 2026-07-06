import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { environment } from '../../../../../environments/environment';

interface OpcionIndustria {
  value: string;
  label: string;
}

interface CanalAnalisis {
  key: string;
  channelType: string;
  nombre: string;
  logo?: string;
  icono?: string;
  estado: 'activo' | 'disponible' | 'bloqueado';
}

interface KeywordItem {
  id: number;
  keyword: string;
}

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css',
})
export class ConfigurationComponent implements OnInit {
  router = inject(Router);
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;
  private serverBaseUrl = environment.apiBaseUrl.replace('/api/v1', '');

  workspaceId: string | null = null;
  brandId: number | null = null;
  plan = 'FREE';
  loading = true;

  get workspaceName() {
    return typeof window !== 'undefined'
      ? localStorage.getItem('currentWorkspaceName') || 'Workspace'
      : 'Workspace';
  }

  get planLabel(): string {
    if (this.plan === 'PRO') return 'Pro';
    if (this.plan === 'ENTERPRISE') return 'Enterprise';
    return 'Basic';
  }

  // ===== Logo de la marca =====
  logoUrl: string | null = null;
  private logoFile: File | null = null;

  onLogoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.logoFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.logoUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
    this.subirLogo(file);
  }

  subirLogo(file: File) {
    if (!this.workspaceId) return;
    const formData = new FormData();
    formData.append('file', file);
    this.http
      .post<any>(`${this.baseUrl}/workspaces/${this.workspaceId}/config/logo`, formData)
      .subscribe({
        next: (data) => {
          this.logoUrl = data.logoUrl ? `${this.serverBaseUrl}${data.logoUrl}` : this.logoUrl;
        },
      });
  }

  quitarLogo() {
    this.logoUrl = null;
    this.logoFile = null;
  }

  // ===== Información general =====
  nombreEmpresa = '';
  nombreWorkspace = '';

  industrias: OpcionIndustria[] = [
    { value: 'Gastronomía / F&B', label: 'Gastronomía / F&B' },
    { value: 'Tecnología', label: 'Tecnología' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Servicios', label: 'Servicios' },
    { value: 'Educación', label: 'Educación' },
    { value: 'Salud', label: 'Salud' },
  ];
  industriaSeleccionada = 'Gastronomía / F&B';

  // ===== Reglas de monitoreo =====
  keywordsInclusion: KeywordItem[] = [];
  keywordsExclusion: KeywordItem[] = [];

  nuevaKeywordInclusion = '';
  nuevaKeywordExclusion = '';

  agregarKeyword(tipo: 'inclusion' | 'exclusion') {
    if (tipo === 'inclusion') {
      const valor = this.nuevaKeywordInclusion.trim();
      if (!valor || !this.brandId) return;
      this.http
        .post<any>(`${this.baseUrl}/brands/${this.brandId}/keywords`, {
          keyword: valor,
          matchType: 'PARTIAL',
        })
        .subscribe({
          next: (data) => {
            this.keywordsInclusion.push({ id: data.id, keyword: data.keyword });
          },
        });
      this.nuevaKeywordInclusion = '';
    } else {
      const valor = this.nuevaKeywordExclusion.trim();
      if (!valor || !this.workspaceId) return;
      this.http
        .post<any>(`${this.baseUrl}/workspaces/${this.workspaceId}/exclusion-keywords`, {
          keyword: valor,
        })
        .subscribe({
          next: (data) => {
            this.keywordsExclusion.push({ id: data.id, keyword: data.keyword });
          },
        });
      this.nuevaKeywordExclusion = '';
    }
  }

  quitarKeyword(tipo: 'inclusion' | 'exclusion', index: number) {
    if (tipo === 'inclusion') {
      const item = this.keywordsInclusion[index];
      if (!this.brandId) return;
      this.http.delete(`${this.baseUrl}/brands/${this.brandId}/keywords/${item.id}`).subscribe({
        next: () => {
          this.keywordsInclusion.splice(index, 1);
        },
      });
    } else {
      const item = this.keywordsExclusion[index];
      if (!this.workspaceId) return;
      this.http
        .delete(`${this.baseUrl}/workspaces/${this.workspaceId}/exclusion-keywords/${item.id}`)
        .subscribe({
          next: () => {
            this.keywordsExclusion.splice(index, 1);
          },
        });
    }
  }

  // ===== Canales digitales (URLs propias) =====
  paginaWeb = '';
  canalYoutube = '';

  // ===== Canales de análisis =====
  private readonly channelsByPlan: Record<string, string[]> = {
    FREE: ['YOUTUBE', 'TWITTER', 'REDDIT', 'TIKTOK'],
    PRO: [
      'YOUTUBE',
      'FACEBOOK',
      'TWITTER',
      'TIKTOK',
      'INSTAGRAM',
      'GOOGLE_NEWS',
      'REDDIT',
      'BLOGS',
    ],
    ENTERPRISE: [
      'YOUTUBE',
      'FACEBOOK',
      'TWITTER',
      'TIKTOK',
      'INSTAGRAM',
      'GOOGLE_NEWS',
      'REDDIT',
      'BLOGS',
    ],
  };

  private readonly channelTemplates: {
    channelType: string;
    nombre: string;
    logo?: string;
    icono?: string;
  }[] = [
    {
      channelType: 'YOUTUBE',
      nombre: 'YouTube',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
    },
    {
      channelType: 'FACEBOOK',
      nombre: 'Facebook',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
    },
    {
      channelType: 'TWITTER',
      nombre: 'Twitter / X',
      logo: 'https://img.logo.dev/x.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true',
    },
    {
      channelType: 'TIKTOK',
      nombre: 'TikTok',
      logo: 'https://img.magnific.com/vector-premium/logotipo-tik-tok_578229-290.jpg?semt=ais_hybrid&w=740&q=80',
    },
    {
      channelType: 'INSTAGRAM',
      nombre: 'Instagram',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
    },
    {
      channelType: 'GOOGLE_NEWS',
      nombre: 'Google News',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Google_News_icon.svg/960px-Google_News_icon.svg.png',
    },
    {
      channelType: 'REDDIT',
      nombre: 'Reddit',
      logo: 'https://img.logo.dev/reddit.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true',
    },
    { channelType: 'BLOGS', nombre: 'Blogs / Web', icono: 'article' },
  ];

  canalesAnalisis: CanalAnalisis[] = [];

  private buildCanalesAnalisis(activos: string[]) {
    const permitidos = this.channelsByPlan[this.plan] || this.channelsByPlan['FREE'];
    this.canalesAnalisis = this.channelTemplates.map((tpl) => {
      let estado: 'activo' | 'disponible' | 'bloqueado' = 'bloqueado';
      if (permitidos.includes(tpl.channelType)) {
        estado = activos.includes(tpl.channelType) ? 'activo' : 'disponible';
      }
      return {
        key: tpl.channelType.toLowerCase(),
        channelType: tpl.channelType,
        nombre: tpl.nombre,
        logo: tpl.logo,
        icono: tpl.icono,
        estado,
      };
    });
  }

  toggleCanal(canal: CanalAnalisis) {
    if (canal.estado === 'bloqueado') {
      this.router.navigate(['/subscription']);
      return;
    }
    if (!this.workspaceId) return;

    if (canal.estado === 'disponible') {
      this.http
        .post(`${this.baseUrl}/workspaces/${this.workspaceId}/channels`, {
          channelType: canal.channelType,
        })
        .subscribe({ next: () => this.loadChannels() });
    } else {
      this.http
        .delete(`${this.baseUrl}/workspaces/${this.workspaceId}/channels/${canal.channelType}`)
        .subscribe({ next: () => this.loadChannels() });
    }
  }

  loadChannels() {
    if (!this.workspaceId) return;
    this.http.get<any[]>(`${this.baseUrl}/workspaces/${this.workspaceId}/channels`).subscribe({
      next: (data) => {
        const activos = data.map((c) => c.channelType);
        this.buildCanalesAnalisis(activos);
      },
    });
  }

  guardando = false;

  ngOnInit() {
    if (typeof window === 'undefined') return;
    this.workspaceId = localStorage.getItem('currentWorkspaceId');
    if (!this.workspaceId) {
      this.router.navigate(['/home']);
      return;
    }
    this.loadWorkspace();
    this.loadConfig();
    this.loadChannels();
  }

  loadWorkspace() {
    this.http.get<any>(`${this.baseUrl}/workspaces/${this.workspaceId}`).subscribe({
      next: (data) => {
        this.nombreWorkspace = data.name;
        this.plan = data.plan;
        this.loadChannels();
      },
    });
  }

  loadConfig() {
    this.http.get<any>(`${this.baseUrl}/workspaces/${this.workspaceId}/config`).subscribe({
      next: (data) => {
        this.nombreEmpresa = data.companyName || '';
        this.industriaSeleccionada = data.industry || 'Gastronomía / F&B';
        this.paginaWeb = data.websiteUrl || '';
        this.canalYoutube = data.youtubeUrl || '';
        this.logoUrl = data.logoUrl ? `${this.serverBaseUrl}${data.logoUrl}` : null;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });

    if (this.workspaceId) {
      this.http.get<any[]>(`${this.baseUrl}/brands/workspace/${this.workspaceId}`).subscribe({
        next: (brands) => {
          if (brands.length > 0) {
            this.brandId = brands[0].id;
            this.http.get<any[]>(`${this.baseUrl}/brands/${this.brandId}/keywords`).subscribe({
              next: (data) => {
                this.keywordsInclusion = data.map((k) => ({ id: k.id, keyword: k.keyword }));
              },
            });
          }
        },
      });

      this.http
        .get<any[]>(`${this.baseUrl}/workspaces/${this.workspaceId}/exclusion-keywords`)
        .subscribe({
          next: (data) => {
            this.keywordsExclusion = data.map((k) => ({ id: k.id, keyword: k.keyword }));
          },
        });
    }
  }

  guardarCambios() {
    if (!this.workspaceId) return;
    this.guardando = true;

    this.http
      .patch(`${this.baseUrl}/workspaces/${this.workspaceId}`, { name: this.nombreWorkspace })
      .subscribe();

    this.http
      .patch(`${this.baseUrl}/workspaces/${this.workspaceId}/config`, {
        companyName: this.nombreEmpresa,
        industry: this.industriaSeleccionada,
        websiteUrl: this.paginaWeb,
        youtubeUrl: this.canalYoutube,
      })
      .subscribe({
        next: () => {
          localStorage.setItem('currentWorkspaceName', this.nombreWorkspace);
          this.guardando = false;
        },
        error: () => {
          this.guardando = false;
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

import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, timeout, catchError, of } from 'rxjs';
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
  estado: 'activo' | 'disponible' | 'bloqueado' | 'proximamente';
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
  subiendoLogo = false;
  logoError: string | null = null;

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
    this.subiendoLogo = true;
    this.logoError = null;
    const formData = new FormData();
    formData.append('file', file);
    this.http
      .post<any>(`${this.baseUrl}/workspaces/${this.workspaceId}/config/logo`, formData)
      .pipe(timeout(20000))
      .subscribe({
        next: (data) => {
          this.logoUrl = data.logoUrl ? `${this.serverBaseUrl}${data.logoUrl}` : this.logoUrl;
          this.subiendoLogo = false;
        },
        error: () => {
          this.subiendoLogo = false;
          this.logoError = 'No se pudo subir el logo. Intenta con una imagen más liviana o vuelve a intentar.';
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
  // Ya NO hay una matriz de planes copiada a mano aquí — se consulta directo al backend
  // vía GET /workspaces/{id}/channels/available, que es la única fuente de verdad
  // (ChannelPlanPolicy.java). Así, si el backend cambia qué incluye cada plan, este
  // componente lo refleja automáticamente sin que nadie tenga que acordarse de actualizarlo.
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

  // Canales realmente implementados en el backend hoy. Aunque el plan lo permita
  // o el backend marque un canal como "allowed", no dejamos activarlo hasta que
  // esté implementado de verdad (evita, p.ej., que Instagram aparezca operativo).
  private readonly IMPLEMENTED_CHANNELS = ['YOUTUBE', 'TWITTER', 'REDDIT', 'TIKTOK'];

  private buildCanalesAnalisis(activos: string[]) {
    if (!this.workspaceId) return;
    this.http
      .get<any[]>(`${this.baseUrl}/workspaces/${this.workspaceId}/channels/available`)
      .subscribe({
        next: (disponibilidad) => {
          this.canalesAnalisis = this.channelTemplates.map((tpl) => {
            const info = disponibilidad.find((d) => d.channelType === tpl.channelType);
            let estado: 'activo' | 'disponible' | 'bloqueado' | 'proximamente' = 'bloqueado';
            if (!this.IMPLEMENTED_CHANNELS.includes(tpl.channelType)) {
              estado = 'proximamente';
            } else if (info?.allowed) {
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
        },
      });
  }

  canalesError: string | null = null;
  canalPendiente: string | null = null;

  toggleCanal(canal: CanalAnalisis) {
    if (canal.estado === 'proximamente') return;
    if (canal.estado === 'bloqueado') {
      this.router.navigate(['/subscription']);
      return;
    }
    if (!this.workspaceId) return;

    // No permitir desactivar el último canal activo: el workspace necesita al
    // menos 1 canal para poder analizar/extraer menciones e incidentes.
    if (canal.estado === 'activo') {
      const activosCount = this.canalesAnalisis.filter((c) => c.estado === 'activo').length;
      if (activosCount <= 1) {
        this.canalesError = `Debes mantener al menos un canal activo. Activa otro canal antes de desactivar ${canal.nombre}.`;
        return;
      }
    }

    this.canalesError = null;
    this.canalPendiente = canal.channelType;

    if (canal.estado === 'disponible') {
      this.http
        .post(`${this.baseUrl}/workspaces/${this.workspaceId}/channels`, {
          channelType: canal.channelType,
        })
        .subscribe({
          next: () => {
            this.canalPendiente = null;
            this.loadChannels();
          },
          error: () => {
            this.canalPendiente = null;
            this.canalesError = `No se pudo activar ${canal.nombre}. Intenta nuevamente.`;
          },
        });
    } else {
      this.http
        .delete(`${this.baseUrl}/workspaces/${this.workspaceId}/channels/${canal.channelType}`)
        .subscribe({
          next: () => {
            this.canalPendiente = null;
            this.loadChannels();
          },
          error: () => {
            this.canalPendiente = null;
            this.canalesError = `No se pudo desactivar ${canal.nombre}. Intenta nuevamente.`;
          },
        });
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
  guardadoOk = false;
  guardadoError: string | null = null;

  guardarCambios() {
    if (!this.workspaceId) return;

    if (!this.nombreWorkspace.trim()) {
      this.guardadoError = 'El nombre del workspace es obligatorio.';
      this.guardadoOk = false;
      return;
    }

    this.guardando = true;
    this.guardadoOk = false;
    this.guardadoError = null;

    const nombrePatch = this.http
      .patch(`${this.baseUrl}/workspaces/${this.workspaceId}`, { name: this.nombreWorkspace })
      .pipe(
        timeout(15000),
        catchError(() => of(null)),
      );

    const configPatch = this.http
      .patch(`${this.baseUrl}/workspaces/${this.workspaceId}/config`, {
        companyName: this.nombreEmpresa,
        industry: this.industriaSeleccionada,
        websiteUrl: this.paginaWeb,
        youtubeUrl: this.canalYoutube,
      })
      .pipe(
        timeout(15000),
        catchError(() => of(null)),
      );

    forkJoin([nombrePatch, configPatch]).subscribe(([nombreRes, configRes]) => {
      this.guardando = false;
      if (nombreRes === null || configRes === null) {
        this.guardadoError = 'No se pudieron guardar todos los cambios. Intenta nuevamente.';
        return;
      }
      localStorage.setItem('currentWorkspaceName', this.nombreWorkspace);
      this.guardadoOk = true;
      setTimeout(() => (this.guardadoOk = false), 2500);
    });
  }

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

  goToSection(section: string) {
    this.router.navigate([`/${section}`]);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}

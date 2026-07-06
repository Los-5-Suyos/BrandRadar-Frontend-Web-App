import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { OnboardingSidebarComponent } from './../../../../shared/components/onboarding-sidebar/onboarding-sidebar.component';
import { environment } from '../../../../../environments/environment';

interface CanalOnboarding {
  channelType: string;
  nombre: string;
  requierePro: boolean;
  seleccionado: boolean;
}

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, OnboardingSidebarComponent],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.css',
})
export class WorkspaceComponent {
  router = inject(Router);
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  companyName = '';
  workspaceName = '';
  industry = '';
  websiteUrl = '';
  youtubeUrl = '';

  inclusionKeywords: string[] = [];
  exclusionKeywords: string[] = [];
  newInclusion = '';
  newExclusion = '';

  creatingWorkspace = false;
  workspaceError = '';

  errors: {
    companyName?: string;
    workspaceName?: string;
    industry?: string;
    canales?: string;
  } = {};

  private limpiarErrores() {
    this.errors = {};
    this.workspaceError = '';
  }

  addInclusion() {
    if (this.newInclusion.trim()) {
      this.inclusionKeywords.push(this.newInclusion.trim());
      this.newInclusion = '';
    }
  }

  removeInclusion(i: number) {
    this.inclusionKeywords.splice(i, 1);
  }

  addExclusion() {
    if (this.newExclusion.trim()) {
      this.exclusionKeywords.push(this.newExclusion.trim());
      this.newExclusion = '';
    }
  }

  removeExclusion(i: number) {
    this.exclusionKeywords.splice(i, 1);
  }

  get selectedPlan() {
    return typeof window !== 'undefined'
      ? localStorage.getItem('selectedPlan') || 'basico'
      : 'basico';
  }

  get isPro() {
    return this.selectedPlan === 'pro' || this.selectedPlan === 'enterprise';
  }

  // NOTA: esto no consulta el endpoint /channels/available del backend porque en este
  // punto el workspace todavía NO existe (se crea recién al final, en finish()). No es
  // una duplicación riesgosa de la matriz de planes: todo workspace nuevo SIEMPRE nace
  // en plan FREE (ver finish(), plan: 'FREE' fijo) — el upgrade real solo ocurre después
  // del pago, en otra pantalla. Configuration.component.ts, en cambio, sí consulta el
  // endpoint real, porque ahí el plan puede ser cualquiera según lo que se haya pagado.
  canales: CanalOnboarding[] = [
    { channelType: 'YOUTUBE', nombre: 'YouTube', requierePro: false, seleccionado: false },
    { channelType: 'TWITTER', nombre: 'Twitter / X', requierePro: false, seleccionado: false },
    { channelType: 'REDDIT', nombre: 'Reddit', requierePro: false, seleccionado: false },
    { channelType: 'TIKTOK', nombre: 'TikTok', requierePro: false, seleccionado: false },
    { channelType: 'FACEBOOK', nombre: 'Facebook', requierePro: true, seleccionado: false },
    { channelType: 'INSTAGRAM', nombre: 'Instagram', requierePro: true, seleccionado: false },
    { channelType: 'GOOGLE_NEWS', nombre: 'Google News', requierePro: true, seleccionado: false },
    { channelType: 'BLOGS', nombre: 'Blogs / Web', requierePro: true, seleccionado: false },
  ];

  private readonly logosPorCanal: Record<string, string> = {
    YOUTUBE:
      'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
    FACEBOOK: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
    TWITTER: 'https://img.logo.dev/x.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true',
    TIKTOK:
      'https://img.magnific.com/vector-premium/logotipo-tik-tok_578229-290.jpg?semt=ais_hybrid&w=740&q=80',
    INSTAGRAM: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
    GOOGLE_NEWS:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Google_News_icon.svg/960px-Google_News_icon.svg.png',
    REDDIT: 'https://img.logo.dev/reddit.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true',
  };

  logoDe(channelType: string): string | null {
    return this.logosPorCanal[channelType] || null;
  }

  toggleCanal(canal: CanalOnboarding) {
    if (canal.requierePro && !this.isPro) {
      this.router.navigate(['/subscription']);
      return;
    }
    canal.seleccionado = !canal.seleccionado;
  }

  finish() {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (!userId) {
      this.workspaceError = 'Tu sesión expiró. Vuelve a iniciar sesión.';
      this.router.navigate(['/login']);
      return;
    }

    this.limpiarErrores();

    if (!this.companyName.trim()) {
      this.errors.companyName = 'Ingresa el nombre de la empresa';
    }
    if (!this.workspaceName.trim()) {
      this.errors.workspaceName = 'Ingresa un nombre para el workspace';
    }
    if (!this.industry) {
      this.errors.industry = 'Selecciona una industria';
    }
    const canalesSeleccionados = this.canales.filter((c) => c.seleccionado);
    if (canalesSeleccionados.length === 0) {
      this.errors.canales = 'Selecciona al menos un canal de análisis';
    }

    if (Object.keys(this.errors).length > 0) {
      return;
    }

    this.creatingWorkspace = true;

    this.http
      .post<any>(`${this.baseUrl}/workspaces`, {
        userId: Number(userId),
        name: this.workspaceName.trim(),
        plan: 'FREE',
      })
      .subscribe({
        next: (ws) => {
          localStorage.setItem('currentWorkspaceId', ws.id);
          localStorage.setItem('currentWorkspaceName', ws.name);
          localStorage.setItem('workspacePlan', 'FREE');

          this.http
            .post<any>(`${this.baseUrl}/brands`, {
              workspaceId: ws.id,
              name: this.companyName.trim() || this.workspaceName.trim(),
            })
            .subscribe({
              next: (brand) => {
                this.inclusionKeywords.forEach((kw) => {
                  this.http
                    .post(`${this.baseUrl}/brands/${brand.id}/keywords`, {
                      keyword: kw,
                      matchType: 'PARTIAL',
                    })
                    .subscribe({ error: () => {} });
                });
                this.exclusionKeywords.forEach((kw) => {
                  this.http
                    .post(`${this.baseUrl}/workspaces/${ws.id}/exclusion-keywords`, { keyword: kw })
                    .subscribe({ error: () => {} });
                });
              },
              error: () => {},
            });

          canalesSeleccionados.forEach((canal) => {
            this.http
              .post(`${this.baseUrl}/workspaces/${ws.id}/channels`, {
                channelType: canal.channelType,
              })
              .subscribe({ error: () => {} });
          });

          this.http
            .patch(`${this.baseUrl}/workspaces/${ws.id}/config`, {
              companyName: this.companyName,
              industry: this.industry,
              websiteUrl: this.websiteUrl,
              youtubeUrl: this.youtubeUrl,
            })
            .subscribe({ error: () => {} });

          this.creatingWorkspace = false;

          if (this.selectedPlan === 'pro') {
            this.router.navigate(['/payment']);
          } else {
            this.router.navigate(['/success']);
          }
        },
        error: (err) => {
          this.creatingWorkspace = false;
          this.workspaceError =
            err.status === 403
              ? 'Alcanzaste el límite de workspaces de tu plan.'
              : 'No se pudo crear el workspace. Intenta nuevamente.';
        },
      });
  }
}

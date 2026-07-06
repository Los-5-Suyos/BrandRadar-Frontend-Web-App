import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { OnboardingSidebarComponent } from './../../../../shared/components/onboarding-sidebar/onboarding-sidebar.component';
import { environment } from '../../../../../environments/environment';

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
  reddit = '';
  googleNews = '';

  inclusionKeywords: string[] = [];
  exclusionKeywords: string[] = [];
  newInclusion = '';
  newExclusion = '';

  creatingWorkspace = false;
  workspaceError = '';

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

  finish() {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (!userId) {
      this.workspaceError = 'Tu sesión expiró. Vuelve a iniciar sesión.';
      this.router.navigate(['/login']);
      return;
    }
    if (!this.workspaceName.trim()) {
      this.workspaceError = 'Ingresa un nombre para el workspace.';
      return;
    }

    this.creatingWorkspace = true;
    this.workspaceError = '';

    // El workspace siempre se crea en FREE: si el usuario eligió Pro, el upgrade
    // real ocurre recién cuando el pago se confirma en la siguiente pantalla.
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

          this.http
            .patch(`${this.baseUrl}/workspaces/${ws.id}/config`, {
              companyName: this.companyName,
              industry: this.industry || 'Gastronomía / F&B',
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

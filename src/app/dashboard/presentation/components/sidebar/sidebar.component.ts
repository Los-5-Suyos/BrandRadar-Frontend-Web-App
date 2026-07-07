import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  router = inject(Router);
  private http = inject(HttpClient);

  @Input() activeSection: string = 'dashboard';

  // Controls the mobile drawer (open/closed). Ignored on desktop widths via CSS.
  mobileOpen = false;

  get workspaceName() {
    return typeof window !== 'undefined'
      ? localStorage.getItem('currentWorkspaceName') || 'Workspace'
      : 'Workspace';
  }

  get planLabel(): string {
    const plan =
      typeof window !== 'undefined' ? localStorage.getItem('workspacePlan') || 'FREE' : 'FREE';
    if (plan === 'PRO') return 'PRO';
    if (plan === 'ENTERPRISE') return 'ENTERPRISE';
    return 'BASIC';
  }

  navItems: { key: string; label: string; icon: string; route: string; badge?: number }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: 'grid_view', route: 'dashboard' },
    { key: 'mentions', label: 'Menciones', icon: 'forum', route: 'mentions' },
    { key: 'incidents', label: 'Incidentes', icon: 'warning', route: 'incidents' },
    { key: 'reports', label: 'Reportes', icon: 'description', route: 'reports' },
    {
      key: 'configuration',
      label: 'Configuración de Workspace',
      icon: 'settings',
      route: 'configuration',
    },
  ];

  ngOnInit() {
    if (typeof window === 'undefined') return;
    const workspaceId = localStorage.getItem('currentWorkspaceId');
    if (!workspaceId) return;
    this.http.get<any[]>(`${environment.apiBaseUrl}/brands/workspace/${workspaceId}`).subscribe({
      next: (brands) => {
        if (brands.length === 0) return;
        this.http
          .get<any[]>(`${environment.apiBaseUrl}/incidents/brand/${brands[0].id}`)
          .subscribe({
            next: (incidentes) => {
              const activos = incidentes.filter((i) => i.status !== 'RESUELTO').length;
              const item = this.navItems.find((n) => n.key === 'incidents');
              if (item) item.badge = activos > 0 ? activos : undefined;
            },
            error: () => {},
          });
      },
      error: () => {},
    });
  }

  goToSection(route: string) {
    this.mobileOpen = false;
    this.router.navigate([`/${route}`]);
  }

  goHome() {
    this.mobileOpen = false;
    this.router.navigate(['/home']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}

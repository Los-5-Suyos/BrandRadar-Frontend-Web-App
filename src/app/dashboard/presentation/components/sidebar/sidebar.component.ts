import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  router = inject(Router);

  @Input() activeSection: string = 'dashboard';

  get workspaceName() {
    return typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceName') || 'Workspace' : 'Workspace';
  }

  get planLabel(): string {
    const plan = typeof window !== 'undefined' ? localStorage.getItem('workspacePlan') || 'FREE' : 'FREE';
    if (plan === 'PRO') return 'PRO';
    if (plan === 'ENTERPRISE') return 'ENTERPRISE';
    return 'BASIC';
  }

  navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'grid_view', route: 'dashboard' },
    { key: 'mentions', label: 'Menciones', icon: 'forum', route: 'mentions' },
    { key: 'incidents', label: 'Incidentes', icon: 'warning', route: 'incidents', badge: 2 },
    { key: 'reports', label: 'Reportes', icon: 'description', route: 'reports' },
    { key: 'configuration', label: 'Configuración de Workspace', icon: 'settings', route: 'configuration' },
  ];

  goToSection(route: string) {
    this.router.navigate([`/${route}`]);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}

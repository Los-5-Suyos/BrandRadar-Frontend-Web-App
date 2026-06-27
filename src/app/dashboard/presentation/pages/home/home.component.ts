import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
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
  styleUrl: './home.component.css'
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

  notifications = [
    { icon: 'warning', color: '#ffb4ab', title: 'Alerta de crisis detectada', desc: 'Sentimiento negativo +40%', time: 'Hace 5 min' },
    { icon: 'trending_down', color: '#c0c1ff', title: 'Reputación bajó 3 puntos', desc: 'Score bajó esta semana', time: 'Hace 1 hora' },
    { icon: 'mark_chat_unread', color: '#4ade80', title: 'Nueva mención positiva', desc: '127 menciones positivas hoy', time: 'Hace 2 horas' }
  ];

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
    return this.workspaces.filter(ws =>
      ws.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getInitials(name: string): string {
    return name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (userId && token) {
        this.loadWorkspaces(userId, token);
      }
    }
  }

  loadWorkspaces(userId: string, token: string) {
    this.loading = true;
    const headers = { 'Authorization': `Bearer ${token}` };
    const url = `${environment.apiBaseUrl}/workspaces/user/${userId}`;

    this.http.get<any[]>(url, { headers }).subscribe({
      next: (data) => {
        this.workspaces = data.map((ws: any, i: number) => ({
          ...ws,
          score: this.wsScores[i % 4],
          mentions: this.wsMentions[i % 4],
          incidents: this.wsIncidents[i % 4],
          color: this.wsColors[i % 4]
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToWorkspace(workspace: any) {
    localStorage.setItem('currentWorkspaceId', workspace.id);
    localStorage.setItem('currentWorkspaceName', workspace.name);
    this.router.navigate(['/dashboard']);
  }

  deleteWorkspace(id: number) {
    this.workspaces = this.workspaces.filter(ws => ws.id !== id);
    this.showDeleteConfirm = null;
    this.cdr.detectChanges();
  }

  addWorkspace() {
    if (this.canAddWorkspace) {
      this.router.navigate(['/workspace']);
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  showMenuId: number | null = null;

  toggleMenu(id: number, event: Event) {
    event.stopPropagation();
    this.showMenuId = this.showMenuId === id ? null : id;
  }

  closeMenus() {
    this.showMenuId = null;
  }

  getLogoUrl(name: string): string {
    const domains: { [key: string]: string } = {
      'netflix': 'netflix.com',
      'uber': 'uber.com',
      'bembos': 'bembos.com.pe',
      'rimac': 'rimac.com.pe',
      'bbva': 'bbva.com',
      'bcp': 'viabcp.com',
      'coca cola': 'coca-cola.com',
      'samsung': 'samsung.com',
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

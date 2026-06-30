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
  showMenuId: number | null = null;

  // Modal crear workspace
  showCreateWorkspace = false;
  newWsName = '';
  newWsLogoPreview: string | null = null;
  newWsInclusionTags: string[] = [];
  newWsExclusionTags: string[] = [];
  newInclusionInput = '';
  newExclusionInput = '';

  channels = [
    { name: 'YouTube', logo: 'https://img.logo.dev/youtube.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ', active: true, locked: false },
    { name: 'Facebook', logo: 'https://img.logo.dev/facebook.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ', active: false, locked: true },
    { name: 'Twitter', logo: 'https://img.logo.dev/twitter.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ', active: false, locked: true },
    { name: 'TikTok', logo: 'https://img.logo.dev/tiktok.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ', active: false, locked: true },
    { name: 'Instagram', logo: 'https://img.logo.dev/instagram.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ', active: false, locked: true },
    { name: 'Reddit', logo: 'https://img.logo.dev/reddit.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ', active: false, locked: true },
  ];

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
    this.router.navigate(['/loading'], { queryParams: { redirect: 'dashboard' } });
  }

  deleteWorkspace(id: number) {
    this.workspaces = this.workspaces.filter(ws => ws.id !== id);
    this.showDeleteConfirm = null;
    this.cdr.detectChanges();
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
    this.newWsInclusionTags = [];
    this.newWsExclusionTags = [];
    this.newInclusionInput = '';
    this.newExclusionInput = '';
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => { this.newWsLogoPreview = e.target?.result as string; };
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
    this.newWsInclusionTags = this.newWsInclusionTags.filter(t => t !== tag);
  }

  addExclusionTag() {
    const val = this.newExclusionInput.trim();
    if (val && !this.newWsExclusionTags.includes(val)) {
      this.newWsExclusionTags.push(val);
    }
    this.newExclusionInput = '';
  }

  removeExclusionTag(tag: string) {
    this.newWsExclusionTags = this.newWsExclusionTags.filter(t => t !== tag);
  }

  createWorkspace() {
    if (!this.newWsName.trim()) return;
    const newWs = {
      id: Date.now(),
      name: this.newWsName.trim(),
      score: 65,
      mentions: 0,
      incidents: 0,
      color: this.wsColors[this.workspaces.length % 4]
    };
    this.workspaces.push(newWs);
    this.closeCreateWorkspace();
    this.cdr.detectChanges();
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

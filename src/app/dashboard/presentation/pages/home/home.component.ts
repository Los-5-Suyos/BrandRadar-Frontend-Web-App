import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
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

  notifications = [
    { icon: 'warning', color: '#ffb4ab', title: 'Alerta de crisis detectada', desc: 'Netflix - Sentimiento negativo +40%', time: 'Hace 5 min' },
    { icon: 'trending_down', color: '#c0c1ff', title: 'Reputación bajó 3 puntos', desc: 'Netflix - Score: 78.5 → 75.2', time: 'Hace 1 hora' },
    { icon: 'mark_chat_unread', color: '#4ade80', title: 'Nueva mención positiva', desc: '127 menciones positivas hoy', time: 'Hace 2 horas' }
  ];

  get userId() {
    return typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';
  }

  get userName() {
    const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
    return email.split('@')[0] || 'Usuario';
  }

  get greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
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
        this.workspaces = [...data];
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

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}

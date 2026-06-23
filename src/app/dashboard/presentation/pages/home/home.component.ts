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
      console.log('userId:', userId);
      console.log('token:', token);
      if (userId && token) {
        this.loadWorkspaces(userId, token);
      }
    }
  }

  loadWorkspaces(userId: string, token: string) {
    this.loading = true;
    const headers = { 'Authorization': `Bearer ${token}` };
    const url = `${environment.apiBaseUrl}/workspaces/user/${userId}`;
    console.log('Llamando URL:', url);

    this.http.get<any[]>(url, { headers }).subscribe({
      next: (data) => {
        console.log('Workspaces recibidos:', data);
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

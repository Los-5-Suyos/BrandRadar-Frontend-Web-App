import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

const DEMO_WORKSPACES = [
  { id: 'w-001', name: 'BrandRadar Agency', status: 'ACTIVA' }
];

@Component({
  selector: 'app-workspace-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workspace-select.html',
  styleUrl: './workspace-select.css',
})
export class WorkspaceSelect implements OnInit {
  private router = inject(Router);

  workspaces: any[] = [];
  isLoading = false; // NO spinner — carga inmediata

  ngOnInit(): void {
    // 1. Mostrar workspaces inmediatamente (sin esperar API)
    this.workspaces = DEMO_WORKSPACES;

    // 2. Intentar enriquecer desde la API en background (sin bloquear UI)
    fetch('http://localhost:3000/workspaces')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length) this.workspaces = data; })
      .catch(() => {}); // silencioso — ya tenemos datos
  }

  select(ws: any): void {
    localStorage.setItem('brandradar_workspace', JSON.stringify(ws));
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    localStorage.removeItem('brandradar_token');
    localStorage.removeItem('brandradar_user');
    localStorage.removeItem('brandradar_workspace');
    this.router.navigate(['/auth/login']);
  }
}

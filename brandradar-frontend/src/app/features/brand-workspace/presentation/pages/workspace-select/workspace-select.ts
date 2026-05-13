import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkspaceService } from '../../../application/services/workspace';
import { WorkspaceStateService } from '../../../../../core/services/workspace-state';
import { WorkspaceModel } from '../../../domain/models/workspace.model';
import { WorkspacePlan } from '../../../domain/enums/workspace-plan.enum';

/**
 * T27 · US10 — Selección de Workspace
 *
 * Muestra los workspaces disponibles para el usuario logueado.
 * DDD: el filtro por acceso ocurre en WorkspaceService, no aquí.
 * Al seleccionar → llama WorkspaceStateService.setActiveWorkspace()
 *                → redirige al dashboard.
 *
 * Casos especiales:
 *  - 1 solo workspace → saltar selección y redirigir directamente
 *  - Sin workspaces   → mostrar estado de error con opción de soporte
 */
@Component({
  selector: 'app-workspace-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workspace-select.html',
  styleUrl: './workspace-select.css',
})
export class WorkspaceSelect implements OnInit {
  private readonly router         = inject(Router);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly wsState          = inject(WorkspaceStateService);

  workspaces: WorkspaceModel[] = [];
  isLoading = true;
  hasError  = false;

  // Exponer el enum al template
  readonly WorkspacePlan = WorkspacePlan;

  ngOnInit(): void {
    this.workspaceService.getMyWorkspaces().subscribe({
      next: (data) => {
        this.isLoading = false;

        if (!data || data.length === 0) {
          // Sin workspaces → mostrar estado de error
          this.hasError = true;
          return;
        }

        if (data.length === 1) {
          // Un solo workspace → saltar selección, ir directo al dashboard
          this._selectAndNavigate(data[0]);
          return;
        }

        // Múltiples workspaces → mostrar lista
        this.workspaces = data;
      },
      error: () => {
        this.isLoading = false;
        this.hasError  = true;
      },
    });
  }

  select(ws: WorkspaceModel): void {
    this._selectAndNavigate(ws);
  }

  logout(): void {
    this.wsState.clearSession();
    localStorage.removeItem('brandradar_token');
    localStorage.removeItem('brandradar_user');
    this.router.navigate(['/auth/login']);
  }

  getPlanLabel(plan: WorkspacePlan): string {
    const labels: Record<WorkspacePlan, string> = {
      [WorkspacePlan.FREE]:       'Free',
      [WorkspacePlan.PRO]:        'Pro',
      [WorkspacePlan.ENTERPRISE]: 'Enterprise',
    };
    return labels[plan] ?? plan;
  }

  getPlanClass(plan: WorkspacePlan): string {
    const classes: Record<WorkspacePlan, string> = {
      [WorkspacePlan.FREE]:       'plan--free',
      [WorkspacePlan.PRO]:        'plan--pro',
      [WorkspacePlan.ENTERPRISE]: 'plan--enterprise',
    };
    return classes[plan] ?? '';
  }

  private _selectAndNavigate(ws: WorkspaceModel): void {
    // Domain: registrar el workspace activo en el estado global
    this.wsState.setActiveWorkspace(ws);
    this.router.navigate(['/dashboard']);
  }
}

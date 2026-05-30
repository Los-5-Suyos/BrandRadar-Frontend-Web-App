import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkspaceService, Workspace } from '../../../../../core/services/workspace.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-workspace-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workspace-select.html',
  styleUrl: './workspace-select.css',
})
export class WorkspaceSelect implements OnInit {
  workspaces = signal<Workspace[]>([]);
  loading = signal(true);
  selected = signal<string | null>(null);
  entering = signal(false);

  constructor(
    private wsService: WorkspaceService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.wsService.getWorkspaces().subscribe({
      next: (data) => {
        this.workspaces.set(data);
        this.loading.set(false);
        if (data.length === 1) this.selected.set(data[0].id);
      },
      error: () => this.loading.set(false)
    });
  }

  selectWs(id: string) { this.selected.set(id); }

  enterWorkspace() {
    const ws = this.workspaces().find(w => w.id === this.selected());
    if (!ws) return;
    this.entering.set(true);
    this.wsService.selectWorkspace(ws);
    setTimeout(() => this.router.navigate(['/dashboard']), 600);
  }

  logout() { this.auth.logout(); }

  get user() { return this.auth.currentUser(); }
}

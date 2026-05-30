import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Workspace {
  id: string;
  name: string;
  status: string;
  ownerId: string;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly API = 'http://localhost:3000';
  private _selectedWorkspace = signal<Workspace | null>(this.loadWorkspace());

  readonly selectedWorkspace = this._selectedWorkspace.asReadonly();

  constructor(private http: HttpClient) {}

  getWorkspaces(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(`${this.API}/workspaces`);
  }

  selectWorkspace(ws: Workspace): void {
    localStorage.setItem('br_workspace', JSON.stringify(ws));
    this._selectedWorkspace.set(ws);
  }

  clearWorkspace(): void {
    localStorage.removeItem('br_workspace');
    this._selectedWorkspace.set(null);
  }

  hasWorkspace(): boolean {
    return !!this._selectedWorkspace();
  }

  private loadWorkspace(): Workspace | null {
    try {
      const raw = localStorage.getItem('br_workspace');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

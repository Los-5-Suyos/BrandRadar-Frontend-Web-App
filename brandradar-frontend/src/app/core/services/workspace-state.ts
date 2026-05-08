import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
// Importaremos las interfaces cuando Jean Franco y Joaquin las creen en Domain
// Por ahora usamos 'any' para que no te de error
@Injectable({
  providedIn: 'root',
})
export class WorkspaceStateService {
  private activeWorkspace$ = new BehaviorSubject<any | null>(null);
  private activeBrand$ = new BehaviorSubject<any | null>(null);

  // Observables para que Topbar y Dashboard se suscriban
  workspace$ = this.activeWorkspace$.asObservable();
  brand$ = this.activeBrand$.asObservable();

  setActiveWorkspace(workspace: any) {
    this.activeWorkspace$.next(workspace);
  }
  setActiveBrand(brand: any) {
    this.activeBrand$.next(brand);
  }

  clearSession() {
    this.activeWorkspace$.next(null);
    this.activeBrand$.next(null);
  }
}

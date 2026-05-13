import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { WorkspaceModel } from '../../features/brand-workspace/domain/models/workspace.model';
import { BrandModel } from '../../features/brand-workspace/domain/models/brand.model';
import { UserRole } from '../../features/brand-workspace/domain/enums/user-role.enum';

/**
 * WorkspaceStateService — T19 (Luis) / usado por Jean Franco en T27
 *
 * Singleton que mantiene el workspace y la marca activos en memoria.
 * Todos los componentes que necesiten saber "en qué workspace estoy"
 * se suscriben aquí en lugar de leer localStorage directamente.
 *
 * DDD: expone también el rol del usuario (canWrite$) para que los
 * componentes muestren/oculten acciones sin duplicar lógica de permisos.
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceStateService {

  private readonly WS_KEY    = 'brandradar_workspace';
  private readonly BRAND_KEY = 'brandradar_active_brand';

  // ── Estado reactivo ──────────────────────────────────────────
  private _activeWorkspace$ = new BehaviorSubject<WorkspaceModel | null>(
    this._loadFromStorage<WorkspaceModel>(this.WS_KEY)
  );
  private _activeBrand$ = new BehaviorSubject<BrandModel | null>(
    this._loadFromStorage<BrandModel>(this.BRAND_KEY)
  );

  // ── Observables públicos ─────────────────────────────────────
  readonly activeWorkspace$: Observable<WorkspaceModel | null> = this._activeWorkspace$.asObservable();
  readonly activeBrand$: Observable<BrandModel | null>         = this._activeBrand$.asObservable();

  /** Rol del usuario en el workspace activo */
  readonly userRole$: Observable<UserRole | null> = this._activeWorkspace$.pipe(
    map(ws => ws?.userRole ?? null)
  );

  /** true si el usuario puede crear/editar/desactivar en el workspace activo */
  readonly canWrite$: Observable<boolean> = this.userRole$.pipe(
    map(role => role === UserRole.ADMIN || role === UserRole.MANAGER)
  );

  // ── Getters síncronos (para guards) ─────────────────────────
  get activeWorkspace(): WorkspaceModel | null { return this._activeWorkspace$.getValue(); }
  get activeBrand(): BrandModel | null          { return this._activeBrand$.getValue(); }
  get userRole(): UserRole | null               { return this.activeWorkspace?.userRole ?? null; }
  get canWrite(): boolean {
    return this.userRole === UserRole.ADMIN || this.userRole === UserRole.MANAGER;
  }

  // ── Mutaciones ───────────────────────────────────────────────
  setActiveWorkspace(workspace: WorkspaceModel): void {
    localStorage.setItem(this.WS_KEY, JSON.stringify(workspace));
    this._activeWorkspace$.next(workspace);
    // Al cambiar de workspace, limpiar la marca activa
    this._activeBrand$.next(null);
    localStorage.removeItem(this.BRAND_KEY);
  }

  setActiveBrand(brand: BrandModel): void {
    localStorage.setItem(this.BRAND_KEY, JSON.stringify(brand));
    this._activeBrand$.next(brand);
  }

  /** Llamado por Victor en logout — limpia todo el estado de sesión */
  clearSession(): void {
    localStorage.removeItem(this.WS_KEY);
    localStorage.removeItem(this.BRAND_KEY);
    this._activeWorkspace$.next(null);
    this._activeBrand$.next(null);
  }

  // ── Helpers privados ─────────────────────────────────────────
  private _loadFromStorage<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }
}

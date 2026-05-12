import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

/**
 * T28 — Session (SessionService)
 * Victor
 *
 * Maneja:
 * - Logout manual (limpia localStorage, redirige)
 * - Timeout de inactividad de 15 minutos con RxJS
 *
 * Cómo usarlo:
 * 1. Llamar session.startInactivityTimer() cuando el usuario haga login.
 * 2. Llamar session.logout() cuando el usuario presione "Cerrar sesión".
 */
@Injectable({
  providedIn: 'root',
})
export class Session implements OnDestroy {
  // 15 minutos en milisegundos
  private readonly TIMEOUT_MS = 15 * 60 * 1000;

  // Suscripción al timer de inactividad (para poder cancelarla)
  private inactivitySub: Subscription | null = null;

  // Callback opcional para mostrar el snackbar — se asigna desde el componente raíz
  private onTimeoutCallback: (() => void) | null = null;

  constructor(private router: Router) {}

  /**
   * Registra una función que se ejecutará cuando el timeout ocurra.
   * Ejemplo desde AppComponent:
   *   this.session.setTimeoutCallback(() => this.snackbar.show('Sesión cerrada por inactividad', true));
   */
  setTimeoutCallback(fn: () => void): void {
    this.onTimeoutCallback = fn;
  }

  /**
   * Inicia el timer de inactividad.
   * Llamar esto justo después de un login exitoso.
   *
   * Escucha click, keydown y mousemove en el documento.
   * Cada vez que el usuario hace algo, reinicia el timer de 15 min.
   * Si no hay actividad en 15 min → logout automático.
   */
  startInactivityTimer(): void {
    // Cancelar timer anterior si existía
    this.stopInactivityTimer();

    // Detectar cualquier actividad del usuario
    const activity$ = merge(
      fromEvent(document, 'click'),
      fromEvent(document, 'keydown'),
      fromEvent(document, 'mousemove'),
    );

    this.inactivitySub = activity$
      .pipe(
        // Cada vez que hay actividad, resetea el timer de 15 minutos
        switchMap(() => timer(this.TIMEOUT_MS)),
      )
      .subscribe(() => {
        this.handleInactivityTimeout();
      });

    // También iniciar el timer desde el principio por si el usuario no hace nada
    timer(this.TIMEOUT_MS).subscribe(() => {
      if (this.inactivitySub && !this.inactivitySub.closed) {
        this.handleInactivityTimeout();
      }
    });
  }

  /**
   * Detiene el timer de inactividad.
   */
  stopInactivityTimer(): void {
    if (this.inactivitySub) {
      this.inactivitySub.unsubscribe();
      this.inactivitySub = null;
    }
  }

  /**
   * Logout manual — el usuario presionó "Cerrar sesión".
   */
  logout(): void {
    this.stopInactivityTimer();
    this.clearAllSessionData();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Lo que pasa cuando el timeout de inactividad se dispara.
   */
  private handleInactivityTimeout(): void {
    this.stopInactivityTimer();
    this.clearAllSessionData();

    if (this.onTimeoutCallback) {
      this.onTimeoutCallback();
    }

    this.router.navigate(['/auth/login'], {
      queryParams: { reason: 'inactivity' },
    });
  }

  /**
   * Limpia TODOS los datos de sesión del localStorage.
   */
  clearAllSessionData(): void {
    localStorage.removeItem('brandradar_token');
    localStorage.removeItem('brandradar_user');
    localStorage.removeItem('brandradar_workspace');
  }

  /**
   * Devuelve true si hay una sesión activa.
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('brandradar_token');
  }

  /**
   * Devuelve el usuario guardado en localStorage, o null si no hay sesión.
   */
  getCurrentUser(): any | null {
    const raw = localStorage.getItem('brandradar_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  ngOnDestroy(): void {
    this.stopInactivityTimer();
  }
}

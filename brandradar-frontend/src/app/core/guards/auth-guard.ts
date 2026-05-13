import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * T18 — AuthGuard
 * Victor
 *
 * Protege cualquier ruta que requiera sesión activa.
 * Si no hay token → redirige a /auth/login.
 * Si el usuario tiene status PENDING_VERIFICATION → redirige a /auth/verify-email.
 *
 * Se aplica en app.routes.ts sobre: /dashboard, /brands, /incidents, /mentions, /workspace
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Verificar si hay token guardado
  const token = localStorage.getItem('brandradar_token');

  if (!token) {
    // No hay sesión activa → ir al login
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  // Verificar estado del usuario (guardado en localStorage por el login de Brianna)
  const userRaw = localStorage.getItem('brandradar_user');

  if (userRaw) {
    try {
      const user = JSON.parse(userRaw);

      // Si el usuario todavía no verificó su email → no puede acceder
      if (user.status === 'PENDING_VERIFICATION') {
        router.navigate(['/auth/verify-email']);
        return false;
      }

      // Si la cuenta está bloqueada → tampoco puede acceder
      if (user.status === 'BLOCKED') {
        router.navigate(['/auth/login']);
        return false;
      }
    } catch {
      // Si el JSON está corrupto → limpiar y redirigir
      localStorage.removeItem('brandradar_user');
      router.navigate(['/auth/login']);
      return false;
    }
  }

  // Token existe y usuario activo → permitir acceso
  return true;
};

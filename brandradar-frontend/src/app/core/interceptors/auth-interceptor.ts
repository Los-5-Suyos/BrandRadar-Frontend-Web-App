import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * T17 — HTTP Interceptor con JWT
 * Victor
 *
 * Lee el token de localStorage con key 'brandradar_token'.
 * Si existe → agrega header Authorization: Bearer {token} a todas las peticiones.
 * Si recibe 401 → limpia sesión y redirige a /auth/login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Leer token del localStorage
  const token = localStorage.getItem('brandradar_token');

  // Clonar la petición añadiendo el header si hay token
  const authReq = token
    ? req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el servidor responde 401 → sesión inválida o expirada
      if (error.status === 401) {
        // Limpiar todo lo que hay en localStorage
        localStorage.removeItem('brandradar_token');
        localStorage.removeItem('brandradar_user');
        localStorage.removeItem('brandradar_workspace');

        // Redirigir al login
        router.navigate(['/auth/login']);
      }

      return throwError(() => error);
    }),
  );
};

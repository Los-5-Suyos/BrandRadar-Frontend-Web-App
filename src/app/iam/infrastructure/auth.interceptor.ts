import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  const authReq =
    token && !isAuthEndpoint
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint) {
        const refreshToken =
          typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

        if (refreshToken) {
          return http
            .post<{
              token: string;
              refreshToken: string;
            }>(`${environment.apiBaseUrl}/auth/refresh`, { refreshToken })
            .pipe(
              switchMap((response) => {
                localStorage.setItem('token', response.token);
                localStorage.setItem('refreshToken', response.refreshToken);
                const retriedReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${response.token}` },
                });
                return next(retriedReq);
              }),
              catchError((refreshError) => {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userId');
                window.location.href = '/login';
                return throwError(() => refreshError);
              }),
            );
        }
      }
      return throwError(() => error);
    }),
  );
};

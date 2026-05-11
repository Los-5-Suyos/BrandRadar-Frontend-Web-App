import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { ENDPOINTS } from '../api/api-endpoints';

@Injectable({ providedIn: 'root' })
export class BrandService {
  constructor(private http: HttpClient) {}

  // Punto 3: Obtiene la marca con Polling para ver cambios en el score
  getBrandById(id: string): Observable<any> {
    return timer(0, 5000).pipe(
      // Revisa cada 5 segundos
      switchMap(() => this.http.get<any>(`http://localhost:3000/brands/${id}`)),
    );
  }
}

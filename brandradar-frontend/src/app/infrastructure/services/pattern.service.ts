import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENDPOINTS } from '../api/api-endpoints';

@Injectable({ providedIn: 'root' })
export class PatternService {
  constructor(private http: HttpClient) {}

  getPatterns(): Observable<any[]> {
    return this.http.get<any[]>(ENDPOINTS.PATTERNS);
  }

  // Dismiss que cambia estado en db.json
  dismissPattern(id: string): Observable<any> {
    return this.http.patch(ENDPOINTS.PATTERNS_DISMISS(id), { status: 'DISMISSED' });
  }
}

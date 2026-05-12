import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENDPOINTS } from '../api/api-endpoints';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private http: HttpClient) {}

  generateReport(brandId: string, type: 'PDF' | 'CSV'): Observable<any> {
    return this.http.post(ENDPOINTS.REPORTS, {
      brandId,
      type,
      status: 'PENDING',
      createdAt: new Date(),
    });
  }

  getReports(brandId: string): Observable<any[]> {
    return this.http.get<any[]>(`${ENDPOINTS.REPORTS}?brandId=${brandId}`);
  }
}

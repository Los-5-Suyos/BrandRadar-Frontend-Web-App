import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuditAdapter {
  private readonly baseUrl = `${environment.apiUrl}/audit`;

  constructor(private http: HttpClient) {}

  logUnauthorizedAccess(data: any) {
    return this.http.post(`${this.baseUrl}/unauthorized-access`, data);
  }

  logIncidentEscalated(data: any) {
    return this.http.post(`${this.baseUrl}/incident-escalated`, data);
  }
}

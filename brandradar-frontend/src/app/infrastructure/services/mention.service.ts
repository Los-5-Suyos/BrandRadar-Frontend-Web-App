import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { ENDPOINTS } from '../api/api-endpoints';
import { MentionAdapter } from '../../features/reputation-monitoring/infrastructure/adapters/mention.adapter';
import { Mention } from '../../features/reputation-monitoring/domain/models/mention.entity';

@Injectable({
  providedIn: 'root',
})
export class MentionService {
  private readonly brandId = 'b-001';

  constructor(
    private http: HttpClient,
    private adapter: MentionAdapter,
  ) {}

  getMentionsWithPolling(): Observable<Mention[]> {
    return timer(0, 10000).pipe(
      switchMap(() => this.http.get<any[]>(ENDPOINTS.MENTIONS(this.brandId))),
      map((data) => this.adapter.adaptResponse(data)),
      catchError(() => of([])),
    );
  }

  // ESTE ES EL QUE NECESITA EL DASHBOARD PARA FILTRAR SIN BUCLES
  getMentions(): Observable<Mention[]> {
    return this.http.get<any[]>(ENDPOINTS.MENTIONS(this.brandId)).pipe(
      map((data) => this.adapter.adaptResponse(data)),
      catchError(() => of([])),
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Provider {
  id?: string;
  href?: string;
  tradingName?: string;
  externalReference?: Array<{
    externalReferenceType?: string;
    name?: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
  private http = inject(HttpClient);
  private readonly endpoint = '/tmf-api/party/v4/organization';

  getProviders(params: { fields?: string; offset?: number; limit?: number } = {}): Observable<Provider[]> {
    let httpParams = new HttpParams();
    if (params.fields) {
      httpParams = httpParams.set('fields', params.fields);
    }
    if (params.offset !== undefined) {
      httpParams = httpParams.set('offset', params.offset.toString());
    }
    if (params.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    
    return this.http.get<Provider[]>(this.endpoint, { params: httpParams });
  }

  getProviderById(id: string): Observable<Provider> {
    return this.http.get<Provider>(`${this.endpoint}/${id}`);
  }
}

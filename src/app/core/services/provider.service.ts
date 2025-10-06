import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  private readonly endpoint = environment.providerApiUrl;

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
    
    const targetUrl = `${this.endpoint}${httpParams.toString() ? '?' + httpParams.toString() : ''}`;
    const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(targetUrl);
    
    return this.http.get<any>(proxyUrl).pipe(
      map(response => {
        try {
          const data = JSON.parse(response.contents);
          return Array.isArray(data) ? data : [];
        } catch (error) {
          console.error('Error parsing providers:', error);
          return [];
        }
      }),
      catchError((error) => {
        console.warn('Provider API failed:', error);
        return of([]);
      })
    );
  }

  getProviderById(id: string): Observable<Provider> {
    const targetUrl = `${this.endpoint}/${id}`;
    const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(targetUrl);
    
    return this.http.get<any>(proxyUrl).pipe(
      map(response => {
        try {
          return JSON.parse(response.contents);
        } catch (error) {
          console.error('Error parsing provider:', error);
          throw error;
        }
      }),
      catchError((error) => {
        console.warn('Provider by ID API failed:', error);
        throw error;
      })
    );
  }

  getProvidersForTender(): Observable<Provider[]> {
    const targetUrl = this.endpoint;
    const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(targetUrl);
    
    return this.http.get<any>(proxyUrl).pipe(
      map(response => {
        try {
          const data = JSON.parse(response.contents);
          return Array.isArray(data) ? data : [];
        } catch (error) {
          console.error('Error parsing providers for tender:', error);
          return [];
        }
      }),
      catchError((error) => {
        console.warn('Providers for tender API failed:', error);
        return of([]);
      })
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SearchOrganizationsFilters } from '../../shared/models/search-organizations-filters.model';
import { TenderFilters } from '../../shared/models/tender-filters.model';
import { FilterOptions} from '../../shared/models/filter-options.model';
import { forkJoin } from 'rxjs';

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

  getProvidersForTenderNew(filters: SearchOrganizationsFilters): Observable<Provider[]> {
    const url = environment.searchOrganizationsEndpoint;

    return this.http.post<any>(url, filters).pipe(
      map((response) => {
        if (Array.isArray(response)) return response as Provider[];
        if (response?.data && Array.isArray(response.data)) return response.data as Provider[];
        return [];
      }),
      catchError((error) => {
        console.warn('Providers for tender (new) API failed:', error);
        return of([]);
      })
    );
  }

  /**
   * Extended provider search for tender filters (name, serviceType, market, solutionCategory, etc.)
   */
  searchProvidersWithTenderFilters(filters: TenderFilters): Observable<Provider[]> {
    const url = environment.searchOrganizationsEndpoint;
    return this.http.post<any>(url, filters).pipe(
      map((response) => {
        if (Array.isArray(response)) return response as Provider[];
        if (response?.data && Array.isArray(response.data)) return response.data as Provider[];
        return [];
      }),
      catchError((error) => {
        console.warn('Extended provider search API failed:', error);
        return of([]);
      })
    );
  }

  // ADD inside ProviderService class
getFilterOptions(): Observable<FilterOptions> {
  const base = environment.searchOrganizationsEndpoint.replace(/\/searchOrganizations$/, '');
  const categories$ = this.http.get<any>(`${base}/categories`).pipe(
    map(res => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [])),
    catchError(err => {
      console.warn('Categories API failed:', err);
      return of<string[]>([]);
    })
  );

  const countries$ = this.http.get<any>(`${base}/countries`).pipe(
    map(res => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [])),
    catchError(err => {
      console.warn('Countries API failed:', err);
      return of<string[]>([]);
    })
  );

  const complianceLevels$ = this.http.get<any>(`${base}/complianceLevels`).pipe(
    map(res => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [])),
    catchError(err => {
      console.warn('ComplianceLevels API failed:', err);
      return of<string[]>([]);
    })
  );

  return forkJoin({
    categories: categories$,
    countries: countries$,
    complianceLevels: complianceLevels$,
  });
}

  // TODO: Replace with real endpoint for saving tender draft when available
  saveTenderDraft(draft: {
    responseDeadline: string;
    attachmentFile: File | null;
    tenderNote: string;
    selectedProviders: string[];
  }): Observable<void> {
    console.warn('[TODO] saveTenderDraft non ancora implementato.', draft);
    return of();
  }
  
}

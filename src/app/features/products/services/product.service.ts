import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of, switchMap } from 'rxjs';
import { 
  ProductSpecification, 
  ProductSpecification_Create, 
  ProductOffering 
} from '@app/shared/models/product.model';
import { environment } from '../../../../environments/environment';

// Interface for the complete product data with providerId
export interface ProductWithProvider extends ProductSpecification {
  providerId?: string;
  productOfferingId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = environment.productApiUrl;
  private productSpecApiUrl = 'https://an-dhub-sbx.dome-project.eu/tmf-api/productCatalogManagement/v4/productSpecification';

  // TMF 620 Product Catalog Management API methods

  /**
   * Get complete product data with provider information
   * This method performs the two-step process:
   * 1. Get productOffering
   * 2. Get productSpecification using the ID from step 1
   * 3. Extract providerId from relatedParty
   */
  getProductWithProvider(fields?: string, offset: number = 210, limit: number = 1): Observable<ProductWithProvider[]> {
    return this.getProductOfferings(fields, offset, limit).pipe(
      switchMap((offerings: any[]) => {
        if (!offerings || offerings.length === 0) {
          console.warn('No product offerings found');
          return of(this.getMockProductSpecifications());
        }

        // Extract productSpecification IDs from offerings
        const specPromises = offerings.map(offering => {
          const specId = offering.productSpecification?.id;
          if (!specId) {
            console.warn('No productSpecification.id found in offering:', offering);
            return of(null);
          }

          // Get the detailed productSpecification
          return this.getProductSpecificationById(specId).pipe(
            map((spec: any) => {
              // Extract providerId from relatedParty
              const providerId = spec.relatedParty?.find((party: any) => party.role === 'provider')?.id 
                              || spec.relatedParty?.[0]?.id;
              
              return {
                ...spec,
                providerId: providerId,
                productOfferingId: offering.id
              } as ProductWithProvider;
            }),
            catchError(error => {
              console.error(`Error fetching productSpecification ${specId}:`, error);
              return of(null);
            })
          );
        });

        // Wait for all productSpecification calls to complete
        return new Observable<ProductWithProvider[]>(observer => {
          const results: (ProductWithProvider | null)[] = [];
          let completed = 0;

          specPromises.forEach((promise, index) => {
            promise.subscribe({
              next: (result) => {
                results[index] = result;
                completed++;
                if (completed === specPromises.length) {
                  const validResults = results.filter(r => r !== null) as ProductWithProvider[];
                  observer.next(validResults.length > 0 ? validResults : this.getMockProductSpecifications());
                  observer.complete();
                }
              },
              error: (error) => {
                console.error('Error in productSpecification call:', error);
                results[index] = null;
                completed++;
                if (completed === specPromises.length) {
                  const validResults = results.filter(r => r !== null) as ProductWithProvider[];
                  observer.next(validResults.length > 0 ? validResults : this.getMockProductSpecifications());
                  observer.complete();
                }
              }
            });
          });
        });
      }),
      catchError(error => {
        console.error('Error in getProductWithProvider:', error);
        return of(this.getMockProductSpecifications());
      })
    );
  }

  /**
   * Get productOfferings (step 1)
   */
  private getProductOfferings(fields?: string, offset: number = 210, limit: number = 1): Observable<any[]> {
    let params = new HttpParams();
    if (fields) params = params.set('fields', fields);
    params = params.set('offset', offset.toString());
    params = params.set('limit', limit.toString());

    const targetUrl = `${this.apiUrl}${params.toString() ? '?' + params.toString() : ''}`;
    const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(targetUrl);
    
    return this.http.get<any>(proxyUrl).pipe(
      map(response => {
        try {
          const data = JSON.parse(response.contents);
          return Array.isArray(data) ? data : [];
        } catch (error) {
          console.error('Error parsing product offerings:', error);
          return [];
        }
      }),
      catchError((error) => {
        console.warn('Product offering API failed:', error);
        return of([]);
      })
    );
  }

  /**
   * Get productSpecification by ID (step 2)
   */
  private getProductSpecificationById(id: string): Observable<any> {
    const targetUrl = `${this.productSpecApiUrl}/${id}`;
    const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(targetUrl);
    
    return this.http.get<any>(proxyUrl).pipe(
      map(response => {
        try {
          return JSON.parse(response.contents);
        } catch (error) {
          console.error('Error parsing product specification:', error);
          throw error;
        }
      })
    );
  }

  /**
   * List or find ProductOffering objects (legacy method, now calls getProductWithProvider)
   * GET /productOffering
   */
  listProductSpecifications(fields?: string, offset: number = 210, limit: number = 1): Observable<ProductSpecification[]> {
    return this.getProductWithProvider(fields, offset, limit);
  }

  /**
   * Mock data for when external API is not accessible
   */
  private getMockProductSpecifications(): ProductWithProvider[] {
    return [
      {
        id: 'mock-1',
        name: 'Sample Product Specification 1',
        description: 'This is a mock product specification for demonstration purposes.',
        brand: 'Sample Brand',
        version: '1.0',
        lifecycleStatus: 'Active',
        isBundle: false,
        productNumber: 'PROD-001',
        lastUpdate: new Date().toISOString(),
        providerId: 'mock-provider-1',
        productOfferingId: 'mock-offering-1',
        productSpecCharacteristic: [
          {
            name: 'Color',
            description: 'Product color options',
            valueType: 'string',
            productSpecCharacteristicValue: [
              { value: 'Red', isDefault: false },
              { value: 'Blue', isDefault: true },
              { value: 'Green', isDefault: false }
            ]
          },
          {
            name: 'Size',
            description: 'Product size',
            valueType: 'string',
            productSpecCharacteristicValue: [
              { value: 'Small', isDefault: false },
              { value: 'Medium', isDefault: true },
              { value: 'Large', isDefault: false }
            ]
          }
        ]
      },
      {
        id: 'mock-2',
        name: 'Sample Product Specification 2',
        description: 'Another mock product specification with different characteristics.',
        brand: 'Another Brand',
        version: '2.1',
        lifecycleStatus: 'Launched',
        isBundle: true,
        productNumber: 'PROD-002',
        lastUpdate: new Date().toISOString(),
        providerId: 'mock-provider-2',
        productOfferingId: 'mock-offering-2',
        productSpecCharacteristic: [
          {
            name: 'Material',
            description: 'Product material',
            valueType: 'string',
            productSpecCharacteristicValue: [
              { value: 'Plastic', isDefault: false },
              { value: 'Metal', isDefault: true },
              { value: 'Wood', isDefault: false }
            ]
          }
        ]
      }
    ];
  }

  /**
   * Retrieves a ProductOffering by ID
   * GET /productOffering/{id}
   */
  retrieveProductSpecification(id: string, fields?: string): Observable<ProductSpecification> {
    let params = new HttpParams();
    if (fields) params = params.set('fields', fields);

    const targetUrl = `${this.apiUrl}/${id}${params.toString() ? '?' + params.toString() : ''}`;
    const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(targetUrl);
    
    return this.http.get<any>(proxyUrl).pipe(
      map(response => {
        try {
          return JSON.parse(response.contents);
        } catch (error) {
          console.error('Error parsing product offering:', error);
          const mockSpecs = this.getMockProductSpecifications();
          return mockSpecs.find(spec => spec.id === id) || mockSpecs[0];
        }
      }),
      catchError(() => {
        // Return mock data if external API fails
        const mockSpecs = this.getMockProductSpecifications();
        const mockSpec = mockSpecs.find(spec => spec.id === id);
        return of(mockSpec || mockSpecs[0]);
      })
    );
  }

  /**
   * Creates a ProductSpecification (if supported by the API)
   * POST /productSpecification
   */
  createProductSpecification(productSpec: ProductSpecification_Create): Observable<ProductSpecification> {
    // Note: This might not be supported by the external API
    return this.http.post<ProductSpecification>(`${this.apiUrl}`, productSpec);
  }

  /**
   * Updates partially a ProductSpecification (if supported by the API)
   * PATCH /productSpecification/{id}
   */
  patchProductSpecification(id: string, productSpec: Partial<ProductSpecification>): Observable<ProductSpecification> {
    // Note: This might not be supported by the external API
    return this.http.patch<ProductSpecification>(`${this.apiUrl}/${id}`, productSpec);
  }

  /**
   * Deletes a ProductSpecification (if supported by the API)
   * DELETE /productSpecification/{id}
   */
  deleteProductSpecification(id: string): Observable<void> {
    // Note: This might not be supported by the external API
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Convenience methods

  /**
   * Get all product specifications (alias for listProductSpecifications)
   */
  getAllProductSpecifications(): Observable<ProductSpecification[]> {
    return this.listProductSpecifications();
  }

  /**
   * Search product specifications by criteria
   */
  searchProductSpecifications(criteria: {
    name?: string;
    brand?: string;
    lifecycleStatus?: string;
    isBundle?: boolean;
    providerId?: string;
  }): Observable<ProductWithProvider[]> {
    return this.getProductWithProvider().pipe(
      map(specs => {
        let filtered = specs;
        
        if (criteria.name) {
          filtered = filtered.filter(spec => 
            spec.name?.toLowerCase().includes(criteria.name!.toLowerCase())
          );
        }
        if (criteria.brand) {
          filtered = filtered.filter(spec => 
            spec.brand?.toLowerCase().includes(criteria.brand!.toLowerCase())
          );
        }
        if (criteria.lifecycleStatus) {
          filtered = filtered.filter(spec => spec.lifecycleStatus === criteria.lifecycleStatus);
        }
        if (criteria.isBundle !== undefined) {
          filtered = filtered.filter(spec => spec.isBundle === criteria.isBundle);
        }
        if (criteria.providerId) {
          filtered = filtered.filter(spec => spec.providerId === criteria.providerId);
        }
        
        return filtered;
      })
    );
  }

  /**
   * Get product specifications with pagination
   */
  getProductSpecificationsPaginated(page: number = 0, size: number = 1): Observable<{
    data: ProductWithProvider[];
    total: number;
    page: number;
    size: number;
  }> {
    const offset = 210 + (page * size); // Start from offset 210 as in original config
    return this.getProductWithProvider(undefined, offset, size).pipe(
      map(data => ({
        data,
        total: data.length, // Note: Real API would provide total count
        page,
        size
      }))
    );
  }

  // Legacy method for backward compatibility
  
  /**
   * @deprecated Use getProductWithProvider instead
   */
  getProductSpecifications(offset: number = 0, limit: number = 10): Observable<any> {
    return this.getProductWithProvider(undefined, offset, limit);
  }

  // Product Offering methods (if needed)

  /**
   * List product offerings (if the API supports it)
   */
  listProductOfferings(fields?: string, offset?: number, limit?: number): Observable<ProductOffering[]> {
    // This would be a different endpoint, e.g., /productOffering
    // For now, return empty array as it's not implemented
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }

  /**
   * Get product offering by ID
   */
  getProductOfferingById(id: string): Observable<ProductOffering> {
    // This would be a different endpoint, e.g., /productOffering/{id}
    // For now, throw error as it's not implemented
    return new Observable(observer => {
      observer.error(new Error('Product offering retrieval not implemented'));
    });
  }
} 
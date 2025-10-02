import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Product } from '../../shared/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends ApiService {
  private readonly endpoint = '/products';

  getProducts(params: { category?: string; status?: string } = {}): Observable<Product[]> {
    let httpParams = new HttpParams();
    if (params.category) {
      httpParams = httpParams.set('category', params.category);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    return this.get<Product[]>(this.endpoint, httpParams);
  }

  getProductById(id: string): Observable<Product> {
    return this.get<Product>(`${this.endpoint}/${id}`);
  }

  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.post<Product>(this.endpoint, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.patch<Product>(`${this.endpoint}/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }

  uploadAttachment(productId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post(`${this.endpoint}/${productId}/attachments`, formData);
  }
} 
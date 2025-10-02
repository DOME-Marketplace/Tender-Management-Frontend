import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, ProductWithProvider } from '../../services/product.service';
import { QuoteRequestModalComponent, QuoteRequestData } from '../../../../shared/components/quote-request-modal/quote-request-modal.component';
import { ProductSpecification } from '@app/shared/models/product.model';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';
import { NotificationService } from '../../../../shared/services/notification.service';
import { LoginService } from '../../../../core/services/login.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, NotificationComponent, QuoteRequestModalComponent],
  template: `
    <app-notification></app-notification>
    
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Product Specifications</h3>
          <button 
            (click)="loadProducts()" 
            [disabled]="loading"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
        
        <div *ngIf="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        
        <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error loading products</h3>
              <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>
        
        <div *ngIf="!loading && !error">
          <!-- Product Specifications Grid -->
          <div *ngIf="productSpecifications.length > 0; else noProducts" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div *ngFor="let spec of productSpecifications" class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div class="p-6">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-lg font-semibold text-gray-900 truncate">
                    {{ spec.name || 'Unnamed Product' }}
                  </h4>
                  <span *ngIf="spec.lifecycleStatus" 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-green-100 text-green-800': spec.lifecycleStatus === 'Active',
                          'bg-yellow-100 text-yellow-800': spec.lifecycleStatus === 'Launched',
                          'bg-gray-100 text-gray-800': spec.lifecycleStatus !== 'Active' && spec.lifecycleStatus !== 'Launched'
                        }">
                    {{ spec.lifecycleStatus }}
                  </span>
                </div>
                
                <p *ngIf="spec.description" class="text-sm text-gray-600 mb-3 line-clamp-3">
                  {{ spec.description }}
                </p>
                
                <div class="space-y-2 text-sm">
                  <div *ngIf="spec.brand" class="flex justify-between">
                    <span class="text-gray-500">Brand:</span>
                    <span class="text-gray-900">{{ spec.brand }}</span>
                  </div>
                  
                  <div *ngIf="spec.version" class="flex justify-between">
                    <span class="text-gray-500">Version:</span>
                    <span class="text-gray-900">{{ spec.version }}</span>
                  </div>
                  
                  <div *ngIf="spec.productNumber" class="flex justify-between">
                    <span class="text-gray-500">Product Number:</span>
                    <span class="text-gray-900">{{ spec.productNumber }}</span>
                  </div>
                  
                  <div *ngIf="spec.isBundle !== undefined" class="flex justify-between">
                    <span class="text-gray-500">Bundle:</span>
                    <span class="text-gray-900">{{ spec.isBundle ? 'Yes' : 'No' }}</span>
                  </div>
                  
                  <div *ngIf="spec.lastUpdate" class="flex justify-between">
                    <span class="text-gray-500">Last Update:</span>
                    <span class="text-gray-900">{{ spec.lastUpdate | date:'dd/MM/yyyy' }}</span>
                  </div>
                  
                  <div *ngIf="spec.providerId" class="flex justify-between">
                    <span class="text-gray-500">Provider ID:</span>
                    <span class="text-gray-900 font-mono text-xs">{{ spec.providerId }}</span>
                  </div>
                  
                  <div *ngIf="spec.productOfferingId" class="flex justify-between">
                    <span class="text-gray-500">Offering ID:</span>
                    <span class="text-gray-900 font-mono text-xs">{{ spec.productOfferingId }}</span>
                  </div>
                </div>
                
                <!-- Characteristics -->
                <div *ngIf="spec.productSpecCharacteristic && spec.productSpecCharacteristic.length > 0" class="mt-4">
                  <h5 class="text-sm font-medium text-gray-900 mb-2">Characteristics</h5>
                  <div class="space-y-1">
                    <div *ngFor="let char of spec.productSpecCharacteristic.slice(0, 3)" class="text-xs text-gray-600">
                      <span class="font-medium">{{ char.name }}:</span>
                      <span *ngIf="char.description">{{ char.description }}</span>
                    </div>
                    <div *ngIf="spec.productSpecCharacteristic.length > 3" class="text-xs text-gray-500">
                      +{{ spec.productSpecCharacteristic.length - 3 }} more characteristics
                    </div>
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="mt-4 flex space-x-2">
                  <button 
                    (click)="viewDetails(spec)"
                    class="flex-1 bg-blue-600 text-white text-sm px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                  <button 
                    (click)="addToQuote(spec)"
                    class="flex-1 bg-green-600 text-white text-sm px-3 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    Add to Quote
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <ng-template #noProducts>
            <div class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No product specifications</h3>
              <p class="mt-1 text-sm text-gray-500">No product specifications were found.</p>
            </div>
          </ng-template>
          
          <!-- Pagination -->
          <div *ngIf="productSpecifications.length > 0" class="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div class="text-sm text-gray-700">
              Showing {{ productSpecifications.length }} product specification(s)
            </div>
            <div class="flex space-x-2">
              <button 
                (click)="loadMore()"
                [disabled]="loading"
                class="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
              >
                Load More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Details Modal (if needed) -->
    <div *ngIf="selectedProduct" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" (click)="closeDetails()">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" (click)="$event.stopPropagation()">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-900">Product Specification Details</h3>
          <button (click)="closeDetails()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="max-h-96 overflow-y-auto">
          <pre class="text-sm text-gray-600 whitespace-pre-wrap">{{ selectedProduct | json }}</pre>
        </div>
      </div>
    </div>

    <!-- Quote Request Modal -->
    <app-quote-request-modal
      *ngIf="showQuoteModal"
      [product]="productForQuote"
      [customerId]="customerId"
      [isOpen]="showQuoteModal"
      (closeModal)="closeQuoteModal()"
      (submitRequest)="onQuoteRequest($event)"
      (quoteCreated)="onQuoteCreated($event)"
    ></app-quote-request-modal>
  `,
  styles: [`
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private loginService = inject(LoginService);
  
  productSpecifications: ProductWithProvider[] = [];
  selectedProduct: ProductWithProvider | null = null;
  loading = false;
  error: string | null = null;
  currentOffset = 0;
  pageSize = 10;
  
  // Quote modal properties
  showQuoteModal = false;
  productForQuote: ProductWithProvider | null = null;
  customerId: string = '';

  ngOnInit() {
    this.loadProducts();
    this.loadCustomerId();
  }

  private loadCustomerId() {
    // Get customer ID from LoginService (stored after login)
    this.customerId = this.loginService.getUserId() || '';
    if (!this.customerId) {
      console.warn('No customer ID found in session. User may need to log in.');
    }
  }

  loadProducts() {
    this.loading = true;
    this.error = null;
    this.currentOffset = 0;
    
    this.productService.listProductSpecifications(undefined, this.currentOffset, this.pageSize).subscribe({
      next: (specifications) => {
        this.productSpecifications = specifications;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load product specifications: ' + (err.message || 'Unknown error');
        this.loading = false;
        console.error('Error loading products:', err);
      }
    });
  }

  loadMore() {
    if (this.loading) return;
    
    this.loading = true;
    this.currentOffset += this.pageSize;
    
    this.productService.listProductSpecifications(undefined, this.currentOffset, this.pageSize).subscribe({
      next: (specifications) => {
        this.productSpecifications = [...this.productSpecifications, ...specifications];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load more products: ' + (err.message || 'Unknown error');
        this.loading = false;
        console.error('Error loading more products:', err);
      }
    });
  }

  viewDetails(product: ProductWithProvider) {
    this.selectedProduct = product;
  }

  closeDetails() {
    this.selectedProduct = null;
  }

  addToQuote(product: ProductWithProvider) {
    this.productForQuote = product;
    this.showQuoteModal = true;
  }

  closeQuoteModal() {
    this.showQuoteModal = false;
    this.productForQuote = null;
  }

  onQuoteRequest(requestData: QuoteRequestData) {
    console.log('Quote request submitted:', requestData);
    // This method is kept for backward compatibility
    // The actual API call is now handled in the modal component
  }

  onQuoteCreated(response: any) {
    console.log('Quote created successfully:', response);
    
    // Show success message
    alert(`Quote created successfully!\n\nQuote ID: ${response.id || 'N/A'}\nStatus: ${response.status || 'Created'}`);
    
    // Optionally navigate to quotes page or refresh data
    // this.router.navigate(['/quotes']);
  }
} 
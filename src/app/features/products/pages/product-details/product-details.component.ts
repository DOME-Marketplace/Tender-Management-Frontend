import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Product } from '../../../../shared/models/product.model';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, NotificationComponent, ConfirmDialogComponent],
  template: `
    <app-notification></app-notification>

    <div class="container mx-auto px-4 py-8" *ngIf="product">
      <div class="bg-white shadow-md rounded-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Product Details</h1>
          <div class="flex space-x-2">
            <button
              (click)="editProduct()"
              class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Edit
            </button>
            <button
              (click)="confirmDelete()"
              class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
          {{ error }}
        </div>

        <div *ngIf="!isLoading && !error" class="grid grid-cols-2 gap-6">
          <div>
            <h2 class="text-lg font-semibold mb-4">Basic Information</h2>
            <dl class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">ID</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ product.id }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Name</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ product.name }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Description</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ product.description || '-' }}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 class="text-lg font-semibold mb-4">Additional Information</h2>
            <dl class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Created At</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ product.createdAt | date:'dd/MM/yyyy' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Updated At</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ product.updatedAt | date:'dd/MM/yyyy' }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <app-confirm-dialog
      [isOpen]="showDeleteConfirm"
      title="Delete Product"
      [message]="deleteConfirmMessage"
      confirmText="Delete"
      confirmButtonClass="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      (confirm)="deleteProduct()"
      (cancel)="showDeleteConfirm = false"
    ></app-confirm-dialog>
  `
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  isLoading = false;
  error: string | null = null;
  showDeleteConfirm = false;
  deleteConfirmMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    }
  }

  loadProduct(id: string) {
    this.isLoading = true;
    this.error = null;

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.isLoading = false;
      },
      error: (error: Error) => {
        this.error = 'Failed to load product. Please try again.';
        this.isLoading = false;
        this.notificationService.showError(this.error);
      }
    });
  }

  editProduct() {
    if (this.product) {
      this.router.navigate(['/products', this.product.id, 'edit']);
    }
  }

  confirmDelete() {
    if (this.product) {
      this.deleteConfirmMessage = `Are you sure you want to delete product ${this.product.name}? This action cannot be undone.`;
      this.showDeleteConfirm = true;
    }
  }

  deleteProduct() {
    if (!this.product) return;

    this.productService.deleteProduct(this.product.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Product deleted successfully');
        this.router.navigate(['/products']);
      },
      error: (error: Error) => {
        this.notificationService.showError('Failed to delete product. Please try again.');
      }
    });

    this.showDeleteConfirm = false;
  }
} 
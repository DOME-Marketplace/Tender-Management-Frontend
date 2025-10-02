import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Product } from '../../../../shared/models/product.model';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NotificationComponent, ConfirmDialogComponent],
  template: `
    <app-notification></app-notification>

    <div class="container mx-auto px-4 py-8">
      <div class="bg-white shadow-md rounded-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">{{ isEditMode ? 'Edit Product' : 'Create Product' }}</h1>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
          {{ error }}
        </div>

        <form *ngIf="!isLoading && !error" [formGroup]="productForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              formControlName="name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              [ngClass]="{'border-red-300': productForm.get('name')?.invalid && productForm.get('name')?.touched}"
            >
            <div *ngIf="productForm.get('name')?.invalid && productForm.get('name')?.touched" class="mt-1 text-sm text-red-600">
              Name is required
            </div>
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              formControlName="description"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              (click)="confirmCancel()"
              class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="productForm.invalid || isSubmitting"
              class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Cancel Confirmation Dialog -->
    <app-confirm-dialog
      [isOpen]="showCancelConfirm"
      title="Discard Changes"
      message="Are you sure you want to discard your changes? Any unsaved changes will be lost."
      confirmText="Discard"
      confirmButtonClass="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      (confirm)="onCancel()"
      (cancel)="showCancelConfirm = false"
    ></app-confirm-dialog>
  `
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  error: string | null = null;
  showCancelConfirm = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private notificationService: NotificationService
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.isEditMode = true;
      this.loadProduct(productId);
    }
  }

  loadProduct(id: string) {
    this.isLoading = true;
    this.error = null;

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          description: product.description
        });
        this.isLoading = false;
      },
      error: (error: Error) => {
        this.error = 'Failed to load product. Please try again.';
        this.isLoading = false;
        this.notificationService.showError(this.error);
      }
    });
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    this.isSubmitting = true;
    const productData = this.productForm.value;

    const request = this.isEditMode
      ? this.productService.updateProduct(this.route.snapshot.paramMap.get('id')!, productData)
      : this.productService.createProduct(productData);

    request.subscribe({
      next: (product) => {
        this.notificationService.showSuccess(
          `Product ${this.isEditMode ? 'updated' : 'created'} successfully`
        );
        this.router.navigate(['/products', product.id]);
      },
      error: (error: Error) => {
        this.error = `Failed to ${this.isEditMode ? 'update' : 'create'} product. Please try again.`;
        this.notificationService.showError(this.error);
        this.isSubmitting = false;
      }
    });
  }

  confirmCancel() {
    if (this.productForm.dirty) {
      this.showCancelConfirm = true;
    } else {
      this.onCancel();
    }
  }

  onCancel() {
    this.router.navigate(['/products']);
  }
} 
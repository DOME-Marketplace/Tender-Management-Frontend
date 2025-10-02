import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuoteService } from '../../../features/quotes/services/quote.service';
import { NotificationService } from '../../services/notification.service';
import { Quote } from '../../models/quote.model';
import { NotificationComponent } from '../notification/notification.component';

@Component({
  selector: 'app-quote-details-modal',
  standalone: true,
  imports: [CommonModule, NotificationComponent],
  template: `
    <!-- Modal Backdrop -->
    <div 
      *ngIf="isOpen" 
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      (click)="closeModal()"
    >
      <!-- Modal Content -->
      <div 
        class="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white"
        (click)="$event.stopPropagation()"
      >
        <!-- Modal Header -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900">Quote Details</h2>
          <button
            (click)="closeModal()"
            class="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
          {{ error }}
        </div>

        <!-- Quote Content -->
        <div *ngIf="!isLoading && !error && quote" class="max-h-96 overflow-y-auto">
          <!-- Customer Message - Main Content -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Customer Message</h3>
            <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md">
              <p class="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">{{ quote.description || 'No message provided' }}</p>
            </div>
          </div>
          
          <!-- Creation Date - Secondary Info -->
          <div class="text-sm text-gray-500 border-t pt-3">
            <span class="font-medium">Created:</span> {{ quote.quoteDate | date:'dd/MM/yyyy' }}
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex justify-end mt-6 pt-4 border-t">
          <button
            (click)="closeModal()"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Close
          </button>
        </div>
      </div>
    </div>


  `
})
export class QuoteDetailsModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() quoteId: string | null = null;
  @Output() close = new EventEmitter<void>();




  quote: Quote | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    public quoteService: QuoteService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    // Load quote when modal opens and quoteId is provided
    if (this.isOpen && this.quoteId) {
      this.loadQuote(this.quoteId);
    }
  }

  ngOnChanges() {
    // Load quote when quoteId changes or modal opens
    if (this.isOpen && this.quoteId) {
      this.loadQuote(this.quoteId);
    } else if (!this.isOpen) {
      // Reset state when modal closes
      this.quote = null;
      this.error = null;
    }
  }

  loadQuote(id: string) {
    this.isLoading = true;
    this.error = null;

    this.quoteService.getQuoteById(id).subscribe({
      next: (quote) => {
        this.quote = quote;
        this.isLoading = false;
      },
      error: (error: Error) => {
        this.error = 'Failed to load quote. Please try again.';
        this.isLoading = false;
        this.notificationService.showError(this.error);
      }
    });
  }

  closeModal() {
    this.close.emit();
  }
} 

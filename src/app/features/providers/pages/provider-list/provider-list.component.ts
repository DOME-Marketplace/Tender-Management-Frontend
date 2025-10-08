import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProviderService, Provider } from '../../../../core/services/provider.service';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';

@Component({
  selector: 'app-provider-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationComponent],
  template: `
    <app-notification></app-notification>
    
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Provider List</h3>
          <div class="flex space-x-2">
            <button 
              (click)="createTender()" 
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create a Tender
            </button>
            <button 
              (click)="loadProviders()" 
              [disabled]="loading"
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {{ loading ? 'Loading...' : 'Refresh' }}
            </button>
          </div>
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
              <h3 class="text-sm font-medium text-red-800">Error loading providers</h3>
              <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>
        
        <div *ngIf="!loading && !error">
          <div *ngIf="providers.length > 0; else noProviders" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div *ngFor="let provider of providers" class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div class="p-6">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-lg font-semibold text-gray-900 truncate">
                    {{ provider.tradingName || 'Unnamed Provider' }}
                  </h4>
                  <span *ngIf="provider.externalReference?.[0]?.externalReferenceType" 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ provider.externalReference?.[0]?.externalReferenceType }}
                  </span>
                </div>
                
                <p *ngIf="provider.href" class="text-sm text-gray-600 mb-3 line-clamp-3">
                  {{ provider.href }}
                </p>
                
                <div class="space-y-2 text-sm">
                  <div *ngIf="provider.id" class="flex justify-between">
                    <span class="text-gray-500">ID:</span>
                    <span class="text-gray-900 font-mono text-xs">{{ provider.id }}</span>
                  </div>
                  
                  <div *ngIf="provider.externalReference?.[0]?.name" class="flex justify-between">
                    <span class="text-gray-500">Reference:</span>
                    <span class="text-gray-900">{{ provider.externalReference?.[0]?.name }}</span>
                  </div>
                </div>
                
                <div class="mt-4 flex space-x-2">
                  <button 
                    (click)="viewDetails(provider)"
                    class="flex-1 bg-blue-600 text-white text-sm px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <ng-template #noProviders>
            <div class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No providers found</h3>
              <p class="mt-1 text-sm text-gray-500">No providers were found.</p>
            </div>
          </ng-template>
          
          <div *ngIf="providers.length > 0" class="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div class="text-sm text-gray-700">
              Showing {{ providers.length }} provider(s)
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
    
    <div *ngIf="selectedProvider" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" (click)="closeDetails()">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" (click)="$event.stopPropagation()">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-900">Provider Details</h3>
          <button (click)="closeDetails()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="max-h-96 overflow-y-auto">
          <pre class="text-sm text-gray-600 whitespace-pre-wrap">{{ selectedProvider | json }}</pre>
        </div>
      </div>
    </div>

    <!-- Tender Creation Modal -->
    <div *ngIf="showTenderModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" (click)="closeTenderModal()">
      <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white" (click)="$event.stopPropagation()">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-900">Create New Tender</h3>
          <button (click)="closeTenderModal()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Tender Form Fields -->
        <div class="mb-6 space-y-4">
          <!-- Response Deadline -->
          <div>
            <label for="responseDeadline" class="block text-sm font-medium text-gray-700 mb-2">
              Response Deadline
            </label>
            <input 
              type="datetime-local" 
              id="responseDeadline"
              [(ngModel)]="responseDeadline"
              [min]="getMinDateTime()"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Select deadline date and time"
            />
          </div>
          
          <!-- Upload Attachment -->
          <div>
            <label for="attachment" class="block text-sm font-medium text-gray-700 mb-2">
              Upload Attachment (PDF only)
            </label>
            <div class="flex items-center space-x-4">
              <input 
                type="file" 
                id="attachment"
                accept=".pdf,application/pdf"
                (change)="onAttachmentSelected($event)"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div *ngIf="attachmentFile" class="flex items-center space-x-2">
                <div class="text-sm text-green-600 flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ attachmentFile.name }}
                </div>
                <button 
                  (click)="removeAttachment()"
                  type="button"
                  class="text-red-600 hover:text-red-800 text-sm flex items-center"
                  title="Remove attachment"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  <span class="ml-1">Remove</span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Note -->
          <div>
            <label for="tenderNote" class="block text-sm font-medium text-gray-700 mb-2">
              Note
            </label>
            <textarea 
              id="tenderNote"
              [(ngModel)]="tenderNote"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter any additional notes for this tender..."
            ></textarea>
          </div>
        </div>
        
        <!-- Divider -->
        <div class="border-t border-gray-200 mb-6"></div>
        
        <!-- Section Title -->
        <h4 class="text-md font-semibold text-gray-900 mb-4">Select Providers to Invite</h4>
        
        <!-- Loading State -->
        <div *ngIf="tenderLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        
        <!-- Error State -->
        <div *ngIf="tenderError" class="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error loading providers</h3>
              <p class="mt-1 text-sm text-red-700">{{ tenderError }}</p>
            </div>
          </div>
        </div>
        
        <!-- Providers Table -->
        <div *ngIf="!tenderLoading && !tenderError" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invite
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let provider of tenderProviders" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ provider.tradingName || 'Unnamed Provider' }}
                  </div>
                  <div *ngIf="provider.id" class="text-sm text-gray-500">
                    ID: {{ provider.id }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    [checked]="selectedProviders.has(provider.id || '')"
                    (change)="toggleProviderSelection(provider.id || '')"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- No providers message -->
          <div *ngIf="tenderProviders.length === 0" class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No providers available</h3>
            <p class="mt-1 text-sm text-gray-500">No providers were found for tender creation.</p>
          </div>
        </div>
        
        <!-- Modal Actions -->
        <div *ngIf="!tenderLoading" class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button 
            (click)="closeTenderModal()" 
            class="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button 
            (click)="saveTenderForm()" 
            class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Save
          </button>
          <button 
            (click)="createTenderWithSelectedProviders()" 
            [disabled]="selectedProviders.size === 0 || !responseDeadline"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Tender ({{ selectedProviders.size }} selected)
          </button>
        </div>
      </div>
    </div>
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
export class ProviderListComponent implements OnInit {
  private providerService = inject(ProviderService);
  
  providers: Provider[] = [];
  selectedProvider: Provider | null = null;
  loading = false;
  error: string | null = null;
  currentOffset = 0;
  pageSize = 10;

  // Properties for tender creation modal
  showTenderModal = false;
  tenderProviders: Provider[] = [];
  selectedProviders: Set<string> = new Set();
  tenderLoading = false;
  tenderError: string | null = null;

  // Tender form fields
  responseDeadline: string = '';
  attachmentFile: File | null = null;
  tenderNote: string = '';

  ngOnInit() {
    this.loadProviders();
  }

  loadProviders() {
    this.loading = true;
    this.error = null;
    this.currentOffset = 0;
    
    this.providerService.getProviders({ offset: this.currentOffset, limit: this.pageSize }).subscribe({
      next: (providers) => {
        this.providers = providers;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load providers: ' + (err.message || 'Unknown error');
        this.loading = false;
        console.error('Error loading providers:', err);
      }
    });
  }

  loadMore() {
    if (this.loading) return;
    
    this.loading = true;
    this.currentOffset += this.pageSize;
    
    this.providerService.getProviders({ offset: this.currentOffset, limit: this.pageSize }).subscribe({
      next: (providers) => {
        this.providers = [...this.providers, ...providers];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load more providers: ' + (err.message || 'Unknown error');
        this.loading = false;
        console.error('Error loading more providers:', err);
      }
    });
  }

  viewDetails(provider: Provider) {
    this.selectedProvider = provider;
  }

  closeDetails() {
    this.selectedProvider = null;
  }

  createTender() {
    this.showTenderModal = true;
    this.selectedProviders.clear();
    this.loadTenderProviders();
  }

  loadTenderProviders() {
    this.tenderLoading = true;
    this.tenderError = null;
    
    this.providerService.getProvidersForTender().subscribe({
      next: (providers) => {
        this.tenderProviders = providers;
        this.tenderLoading = false;
      },
      error: (err) => {
        this.tenderError = 'Failed to load providers: ' + (err.message || 'Unknown error');
        this.tenderLoading = false;
        console.error('Error loading tender providers:', err);
      }
    });
  }

  toggleProviderSelection(providerId: string) {
    if (this.selectedProviders.has(providerId)) {
      this.selectedProviders.delete(providerId);
    } else {
      this.selectedProviders.add(providerId);
    }
  }

  closeTenderModal() {
    this.showTenderModal = false;
    this.selectedProviders.clear();
    this.tenderProviders = [];
    this.tenderError = null;
    this.resetTenderForm();
  }

  resetTenderForm() {
    this.responseDeadline = '';
    this.attachmentFile = null;
    this.tenderNote = '';
  }

  onAttachmentSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'application/pdf') {
        this.attachmentFile = file;
      } else {
        alert('Please select a PDF file only.');
        input.value = '';
      }
    }
  }

  removeAttachment() {
    this.attachmentFile = null;
    // Clear the file input
    const fileInput = document.getElementById('attachment') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getMinDateTime(): string {
    const now = new Date();
    // Add 1 minute to current time to ensure it's in the future
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  }

  saveTenderForm() {
    const draftData = {
      responseDeadline: this.responseDeadline,
      attachmentFile: this.attachmentFile,
      tenderNote: this.tenderNote,
      selectedProviders: Array.from(this.selectedProviders)
    };
    console.log('Saving tender draft:', draftData);
  }

  createTenderWithSelectedProviders() {
    const selectedProviderIds = Array.from(this.selectedProviders);
    const tenderData = {
      responseDeadline: this.responseDeadline,
      attachmentFile: this.attachmentFile,
      tenderNote: this.tenderNote,
      selectedProviders: selectedProviderIds
    };
    console.log('Creating tender with data:', tenderData);
    // TODO: Implement actual tender creation logic
    this.closeTenderModal();
  }
}

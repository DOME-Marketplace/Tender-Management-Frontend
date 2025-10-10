import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuoteService } from '../../services/quote.service';
import { LoginService } from '../../../../core/services/login.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Quote, QuoteStateType } from '../../../../shared/models/quote.model';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { QuoteDetailsModalComponent } from '../../../../shared/components/quote-details-modal/quote-details-modal.component';
import { ChatModalComponent } from '../../../../shared/components/chat-modal/chat-modal.component';
import { AttachmentModalComponent } from '../../../../shared/components/attachment-modal/attachment-modal.component';
import { TenderService } from '../../../../core/services/tender.service';
import { Tender } from '../../../../shared/models/tender.model';

@Component({
  selector: 'app-quote-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationComponent, ConfirmDialogComponent, QuoteDetailsModalComponent, ChatModalComponent, AttachmentModalComponent],
  template: `
    <app-notification></app-notification>
    
    <div class="w-full max-w-7xl mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Tenders</h1>
        <div class="flex space-x-3">
          <button
            (click)="refreshQuotes()"
            [disabled]="loading"
            class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {{ loading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </div>


      <!-- Tenders Section -->
      <div *ngIf="!loading && !error && tenders.length > 0" class="bg-white shadow-md rounded-lg overflow-hidden">
        <div class="bg-indigo-50 px-6 py-3 border-b border-indigo-100">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-indigo-900">My Tenders</h2>
        </div>
      </div>

        <!-- Tenders Header -->
        <div class="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div class="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div class="col-span-1">EXPAND</div>
            <div class="col-span-2">TENDER ID</div>
            <div class="col-span-2">STATE</div>
            <div class="col-span-2">RESPONSE DEADLINE</div>
            <div class="col-span-2">ATTACHMENT</div>
            <div class="col-span-3">ACTIONS</div>
        </div>
      </div>
      
        <!-- Tender Rows -->
        <div *ngFor="let tender of tenders" class="tender-row">
          <!-- Parent Tender Row -->
          <div 
            class="grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-gray-100 transition-colors"
            [class.hover:bg-gray-50]="tender.state === 'draft'"
            [class.cursor-pointer]="tender.state === 'draft'"
            [class.cursor-not-allowed]="tender.state !== 'draft'"
            [class.opacity-60]="tender.state !== 'draft'"
            [class.bg-indigo-50]="isTenderExpanded(tender.id)"
            (click)="openTenderForEdit(tender)"
            [attr.data-tender-id]="tender.id"
            [title]="tender.state === 'draft' ? 'Click to edit' : 'Only draft tenders can be edited'">
            
            <!-- Expand/Collapse Button -->
            <div class="col-span-1">
              <button
                *ngIf="tender.state === 'pre-launched'"
                (click)="toggleTenderExpansion(tender, $event)"
                class="p-1.5 text-indigo-600 hover:text-indigo-800 rounded hover:bg-indigo-100 transition-colors"
                [title]="isTenderExpanded(tender.id) ? 'Collapse' : 'Expand to see child tenders'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform" 
                     [class.rotate-90]="isTenderExpanded(tender.id)"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
              </button>
      </div>
      
            <!-- Tender ID -->
            <div class="col-span-2 text-sm font-medium"
                 [class.text-gray-900]="tender.state === 'pre-launched'"
                 [class.text-gray-500]="tender.state === 'draft'">
              Tender {{ extractTenderShortId(tender.id) }}
        </div>
        
            <!-- State -->
            <div class="col-span-2">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    [ngClass]="getTenderStateClass(tender.state)">
                {{ tender.state }}
              </span>
            </div>
            
            <!-- Response Deadline -->
            <div class="col-span-2 text-sm"
                 [class.text-gray-900]="tender.state === 'pre-launched'"
                 [class.text-gray-500]="tender.state === 'draft'">
              {{ formatTenderDeadline(tender.responseDeadline) }}
            </div>
            
            <!-- Attachment -->
            <div class="col-span-2">
              <button
                *ngIf="tender.attachment"
                (click)="downloadTenderAttachment(tender); $event.stopPropagation()"
                class="p-1.5 text-purple-500 hover:text-purple-700 rounded hover:bg-gray-100 transition-colors"
                title="Download attachment"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <span *ngIf="!tender.attachment" class="text-xs text-gray-400">No attachment</span>
            </div>
              
            <!-- Actions -->
            <div class="col-span-3 flex gap-2" (click)="$event.stopPropagation()">
              <button
                (click)="confirmDeleteTender(tender)"
                class="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-gray-100 transition-colors"
                title="Delete tender"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Child Tenders Section -->
          <div *ngIf="isTenderExpanded(tender.id)" class="bg-gray-50 border-b border-gray-200">
            <div class="px-6 py-4">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">Provider Tenders ({{ getChildTenders(tender.id).length }})</h4>
              
              <div *ngIf="getChildTenders(tender.id).length === 0" class="text-sm text-gray-500 italic py-4">
                No child tenders found. Loading...
              </div>
              
              <!-- Child Tenders Header -->
              <div *ngIf="getChildTenders(tender.id).length > 0" class="bg-gray-100 px-4 py-2 rounded-t-lg">
                <div class="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div class="col-span-3">TENDER ID</div>
                  <div class="col-span-2">STATE</div>
                  <div class="col-span-3">RESPONSE DEADLINE</div>
                  <div class="col-span-2">PROVIDER</div>
                  <div class="col-span-2">ACTIONS</div>
                </div>
              </div>
              
              <div *ngFor="let childTender of getChildTenders(tender.id); let last = last" 
                   class="bg-white border-l border-r border-gray-200"
                   [class.border-b]="last"
                   [class.rounded-b-lg]="last">
                <div class="grid grid-cols-12 gap-4 items-center px-4 py-3">
                  <!-- Tender ID (Parent Tender Name) -->
                  <div class="col-span-3 text-sm font-medium"
                       [class.text-gray-900]="tender.state === 'pre-launched'"
                       [class.text-gray-500]="tender.state === 'draft'">
                    Tender {{ extractTenderShortId(tender.id) }}
                  </div>
                  
                  <!-- State -->
                  <div class="col-span-2">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          [ngClass]="getTenderStateClass(childTender.state)">
                      {{ childTender.state }}
                    </span>
                  </div>
                  
                  <!-- Response Deadline -->
                  <div class="col-span-3 text-sm"
                       [class.text-gray-900]="tender.state === 'pre-launched'"
                       [class.text-gray-500]="tender.state === 'draft'">
                    {{ formatTenderDeadline(childTender.responseDeadline) }}
                  </div>
                  
                  <!-- Provider Name -->
                  <div class="col-span-2 text-sm text-gray-700">
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                      {{ childTender.provider }}
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="col-span-2 flex gap-2 justify-start items-center">
                <button
                      (click)="openChatModal(childTender)"
                      class="p-1 text-blue-500 hover:text-blue-700 rounded hover:bg-gray-100 transition-colors"
                      title="Open chat"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <button
                      (click)="confirmDeleteTender(childTender)"
                      class="p-1 text-red-500 hover:text-red-700 rounded hover:bg-gray-100 transition-colors"
                      title="Delete tender"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
      
      <!-- Error State -->
      <div *ngIf="!loading && error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
            </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- No Tenders Message -->
      <div *ngIf="!loading && !error && tenders.length === 0" class="bg-white shadow-md rounded-lg overflow-hidden">
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No tenders found</h3>
          <p class="mt-1 text-sm text-gray-500">Create your first tender from the Provider List page.</p>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <app-confirm-dialog
      [isOpen]="showDeleteConfirm"
      title="Delete Quote"
      [message]="deleteConfirmMessage"
      confirmText="Delete"
      confirmButtonClass="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      (confirm)="deleteQuote()"
      (cancel)="showDeleteConfirm = false"
    ></app-confirm-dialog>

    <!-- State Update Modal -->
    <div *ngIf="showStateUpdate" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Update Quote State</h3>
          <div class="space-y-3">
            <div *ngFor="let state of availableStates" class="flex items-center">
              <input 
                [id]="'state-' + state" 
                [(ngModel)]="selectedState" 
                [value]="state" 
                type="radio" 
                class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
              >
              <label [for]="'state-' + state" class="ml-3 block text-sm font-medium text-gray-700">
                {{ getStateDisplay(state) }}
              </label>
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button
              (click)="showStateUpdate = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              (click)="confirmStateUpdate()"
              [disabled]="!selectedState"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quote Details Modal -->
    <app-quote-details-modal
      [isOpen]="showQuoteDetailsModal"
      [quoteId]="selectedQuoteId"
      (close)="closeQuoteDetailsModal()"
    ></app-quote-details-modal>

    <!-- Chat Modal -->
    <app-chat-modal
      [isOpen]="showChatModal"
      [quoteId]="selectedChatQuoteId"
      (close)="closeChatModal()"
    ></app-chat-modal>

    <!-- Attachment Modal -->
    <app-attachment-modal
      [isOpen]="showAttachmentModal"
      [quote]="selectedAttachmentQuote"
      (close)="closeAttachmentModal()"
      (uploadSuccess)="onAttachmentUploaded($event)"
    ></app-attachment-modal>

    <!-- Tender Chat Modal -->
    <div *ngIf="showTenderChatModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            Chat - {{ selectedChatTender?.provider || 'Tender' }}
          </h3>
          <button
            (click)="closeTenderChatModal()"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Chat Messages Area -->
        <div class="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4">
          <div *ngIf="chatMessages.length === 0" class="text-center text-gray-500 mt-20">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No messages yet. Start the conversation!</p>
          </div>
          
          <div *ngFor="let message of chatMessages" class="mb-3">
            <div [class.text-right]="message.sender === 'user'">
              <div class="inline-block max-w-xs lg:max-w-md">
                <div class="text-xs text-gray-500 mb-1">
                  {{ message.sender === 'user' ? 'You' : message.sender }}
                </div>
                <div 
                  class="rounded-lg px-4 py-2"
                  [class.bg-indigo-600]="message.sender === 'user'"
                  [class.text-white]="message.sender === 'user'"
                  [class.bg-white]="message.sender !== 'user'"
                  [class.text-gray-900]="message.sender !== 'user'"
                  [class.border]="message.sender !== 'user'"
                  [class.border-gray-200]="message.sender !== 'user'"
                >
                  <p class="text-sm">{{ message.text }}</p>
                  <p class="text-xs mt-1 opacity-75">{{ formatMessageTime(message.timestamp) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Message Input Area -->
        <div class="flex gap-2">
          <textarea
            [(ngModel)]="newChatMessage"
            (keydown.enter)="$event.preventDefault(); sendChatMessage()"
            placeholder="Type your message..."
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows="2"
          ></textarea>
          <button
            (click)="sendChatMessage()"
            [disabled]="!newChatMessage.trim()"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        <div class="mt-4 flex justify-end">
          <button
            (click)="closeTenderChatModal()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Date Picker Modal -->
    <div *ngIf="showDatePickerModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ datePickerType === 'requested' ? 'Add Requested Completion Date' : 'Add Expected Completion Date' }}
          </h3>
          <p class="text-sm text-gray-600 mb-4">
            {{ datePickerType === 'requested' ? 'Select when you need this quote to be completed:' : 'Select when you expect to complete this quote:' }}
          </p>
          
          <div class="mb-6">
            <label for="completion-date" class="block text-sm font-medium text-gray-700 mb-2">
              Completion Date
            </label>
            <input 
              id="completion-date"
              type="date" 
              [(ngModel)]="selectedDate"
              [min]="getTomorrowDate()"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
            <p class="text-xs text-gray-500 mt-1">Date must be in the future</p>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              (click)="closeDatePickerModal()"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              (click)="confirmDateUpdate()"
              [disabled]="!selectedDate || !isDateValid()"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Save Date
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .status-badge {
      @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
    }
    
    .status-pending {
      @apply bg-yellow-100 text-yellow-800;
    }
    
    .status-inProgress {
      @apply bg-blue-100 text-blue-800;
    }
    
    .status-approved {
      @apply bg-green-100 text-green-800;
    }
    
    .status-rejected {
      @apply bg-red-100 text-red-800;
    }
    
    .status-cancelled {
      @apply bg-gray-100 text-gray-800;
    }
    
    .status-accepted {
      @apply bg-emerald-100 text-emerald-800;
    }
    
    .status-unknown {
      @apply bg-gray-100 text-gray-600;
    }
  `]
})
export class QuoteListComponent implements OnInit {
  private router = inject(Router);
  private quoteService = inject(QuoteService);
  private loginService = inject(LoginService);
  private notificationService = inject(NotificationService);
  private tenderService = inject(TenderService);

  quotes: Quote[] = [];
  filteredQuotes: Quote[] = [];
  tenders: Tender[] = [];
  expandedTenders: Set<string> = new Set();
  childTendersMap: Map<string, Tender[]> = new Map();
  loading = false;
  error: string | null = null;
  showDeleteConfirm = false;
  deleteConfirmMessage = '';
  quoteToDelete: Quote | null = null;

  // State update modal
  showStateUpdate = false;
  quoteToUpdate: Quote | null = null;
  selectedState: QuoteStateType | null = null;
  availableStates: QuoteStateType[] = ['pending', 'inProgress', 'approved', 'rejected', 'cancelled', 'accepted'];

  // Role management
  selectedRole: 'customer' | 'seller' = 'customer';
  currentUserId: string | null = null;

  // Filtering
  statusFilter: string = '';

  // Quote Details Modal
  showQuoteDetailsModal = false;
  selectedQuoteId: string | null = null;

  // Chat Modal
  showChatModal = false;
  selectedChatQuoteId: string | null = null;

  // Attachment Modal
  showAttachmentModal = false;
  selectedAttachmentQuote: Quote | null = null;

  // Date Picker Modal
  showDatePickerModal = false;
  selectedDateQuote: Quote | null = null;
  datePickerType: 'requested' | 'expected' | null = null;
  selectedDate: string = '';

  // Tender Chat Modal
  showTenderChatModal = false;
  selectedChatTender: Tender | null = null;
  chatMessages: Array<{ sender: string; text: string; timestamp: Date }> = [];
  newChatMessage: string = '';

  ngOnInit() {
    this.loadTenders();
  }

  loadTenders() {
    this.loading = true;
    this.tenderService.getTenders().subscribe({
      next: (tenders) => {
        // Filter only coordinator tenders for the main list
        this.tenders = tenders.filter(t => t.category === 'coordinator');
        this.loading = false;
        console.log('Loaded coordinator tenders:', this.tenders);
      },
      error: (error) => {
        console.error('Failed to load tenders:', error);
        this.error = 'Failed to load tenders. Please try again.';
        this.loading = false;
      }
    });
  }

  toggleTenderExpansion(tender: Tender, event: Event) {
    event.stopPropagation();
    
    if (!tender.id) return;
    
    if (this.expandedTenders.has(tender.id)) {
      this.expandedTenders.delete(tender.id);
    } else {
      this.expandedTenders.add(tender.id);
      
      // Load child tenders if not already loaded
      if (!this.childTendersMap.has(tender.id)) {
        this.loadChildTenders(tender.id);
      }
    }
  }

  loadChildTenders(parentId: string) {
    this.tenderService.getTendersByExternalId(parentId).subscribe({
      next: (childTenders) => {
        this.childTendersMap.set(parentId, childTenders);
        console.log(`Loaded ${childTenders.length} child tenders for parent ${parentId}`);
      },
      error: (error) => {
        console.error('Error loading child tenders:', error);
        this.notificationService.showError('Failed to load child tenders');
      }
    });
  }

  isTenderExpanded(tenderId: string | undefined): boolean {
    return tenderId ? this.expandedTenders.has(tenderId) : false;
  }

  getChildTenders(tenderId: string | undefined): Tender[] {
    return tenderId ? this.childTendersMap.get(tenderId) || [] : [];
  }

  refreshQuotes() {
    this.loadTenders();
  }

  selectRole(role: 'customer' | 'seller') {
    this.selectedRole = role;
    // Tenders don't need role-based loading
  }

  getRoleTabClass(role: 'customer' | 'seller'): string {
    return this.selectedRole === role
      ? 'bg-white text-indigo-600 shadow-sm'
      : 'text-gray-500 hover:text-gray-700';
  }

  filterQuotesByStatus() {
    if (!this.statusFilter) {
      this.filteredQuotes = [...this.quotes];
    } else {
      this.filteredQuotes = this.quotes.filter(quote => {
        const primaryState = this.getPrimaryState(quote);
        return primaryState === this.statusFilter;
      });
    }
  }

  viewDetails(quote: Quote) {
    this.selectedQuoteId = quote.id!;
    this.showQuoteDetailsModal = true;
  }

  viewQuote(quote: Quote) {
    this.selectedQuoteId = quote.id!;
    this.showQuoteDetailsModal = true;
  }

  closeQuoteDetailsModal() {
    this.showQuoteDetailsModal = false;
    this.selectedQuoteId = null;
  }

  closeChatModal() {
    this.showChatModal = false;
    this.selectedChatQuoteId = null;
  }

  closeAttachmentModal() {
    this.showAttachmentModal = false;
    this.selectedAttachmentQuote = null;
  }

  onAttachmentUploaded(updatedQuote: Quote) {
    // Update the quote in the list
    const index = this.quotes.findIndex(q => q.id === updatedQuote.id);
    if (index !== -1) {
      this.quotes[index] = updatedQuote;
      this.filterQuotesByStatus();
    }

    // If the current user is a provider (seller) and the quote is in progress,
    // automatically update the status to 'approved' after successful PDF upload
    if (this.selectedRole === 'seller' && this.getPrimaryState(updatedQuote) === 'inProgress') {
      console.log('Provider uploaded PDF, updating quote status to approved:', updatedQuote.id);
      
      this.quoteService.updateQuoteStatus(updatedQuote.id!, 'approved').subscribe({
        next: (approvedQuote) => {
          // Update the quote again with the new status
          const approvedIndex = this.quotes.findIndex(q => q.id === approvedQuote.id);
          if (approvedIndex !== -1) {
            this.quotes[approvedIndex] = approvedQuote;
            this.filterQuotesByStatus();
          }
          
          const shortId = this.extractShortId(updatedQuote.id);
          console.log('Quote status automatically updated to approved after PDF upload');
          this.notificationService.showSuccess(`Quote ${shortId} has been approved after PDF upload.`);
        },
        error: (error) => {
          console.error('Error updating quote status to approved:', error);
          this.notificationService.showError(`Error updating quote status: ${error.message || 'Unknown error'}`);
        }
      });
    }
  }







  updateQuoteState(quote: Quote) {
    this.quoteToUpdate = quote;
    this.selectedState = quote.state || null;
    this.showStateUpdate = true;
  }

  confirmStateUpdate() {
    if (this.quoteToUpdate && this.selectedState) {
      this.quoteService.updateQuoteState(this.quoteToUpdate.id!, this.selectedState).subscribe({
        next: (updatedQuote) => {
          const index = this.quotes.findIndex(q => q.id === updatedQuote.id);
          if (index !== -1) {
            this.quotes[index] = updatedQuote;
            this.filterQuotesByStatus();
          }
          this.showStateUpdate = false;
          this.notificationService.showSuccess('Quote state updated successfully');
        },
        error: (error) => {
          console.error('Failed to update quote state:', error);
          this.notificationService.showError('Failed to update quote state');
        }
      });
    }
  }

  confirmDelete(quote: Quote) {
    this.quoteToDelete = quote;
    this.deleteConfirmMessage = `Are you sure you want to delete Quote ${this.extractShortId(quote.id)}? This action cannot be undone.`;
    this.showDeleteConfirm = true;
  }

  deleteQuote() {
    if (this.quoteToDelete) {
      this.quoteService.deleteQuote(this.quoteToDelete.id!).subscribe({
        next: () => {
          this.quotes = this.quotes.filter(q => q.id !== this.quoteToDelete!.id);
          this.filterQuotesByStatus();
          this.showDeleteConfirm = false;
          this.notificationService.showSuccess('Quote deleted successfully');
        },
        error: (error) => {
          console.error('Failed to delete quote:', error);
          this.notificationService.showError('Failed to delete quote');
        }
      });
    }
  }

  // Quote action methods (migrated from QuoteRow.js)
  openChat(quote: Quote) {
    // Open chat modal for messaging
    this.selectedChatQuoteId = quote.id!;
    this.showChatModal = true;
  }

  downloadAttachment(quote: Quote) {
    try {
      this.quoteService.downloadAttachment(quote);
      this.notificationService.showSuccess('Download started');
    } catch (error: any) {
      console.error('Error downloading attachment:', error);
      this.notificationService.showError(error.message || 'Error downloading attachment');
    }
  }

  addAttachment(quote: Quote) {
    // Open the attachment modal
    this.selectedAttachmentQuote = quote;
    this.showAttachmentModal = true;
  }

  acceptQuote(quote: Quote) {
    const shortId = this.extractShortId(quote.id);
    const confirmAccept = confirm(`Are you sure you want to accept this request?`);
    
    if (!confirmAccept) {
      return;
    }

    console.log('Accepting quote request:', quote.id);
    
    this.quoteService.updateQuoteStatus(quote.id!, 'inProgress').subscribe({
      next: (updatedQuote) => {
        const index = this.quotes.findIndex(q => q.id === updatedQuote.id);
        if (index !== -1) {
          this.quotes[index] = updatedQuote;
          this.filterQuotesByStatus();
        }
        console.log('Quote request successfully accepted');
        this.notificationService.showSuccess(`Quote request ${shortId} has been accepted and is now in progress.`);
      },
      error: (error) => {
        console.error('Error accepting quote request:', error);
        this.notificationService.showError(`Error accepting quote request: ${error.message || 'Unknown error'}`);
      }
    });
  }

  acceptQuoteCustomer(quote: Quote) {
    const shortId = this.extractShortId(quote.id);
    const confirmAccept = confirm(`Are you sure you want to accept the quotation?`);
    
    if (!confirmAccept) {
      return;
    }

    console.log('Customer accepting quotation:', quote.id);
    
    this.quoteService.updateQuoteStatus(quote.id!, 'accepted').subscribe({
      next: (updatedQuote) => {
        const index = this.quotes.findIndex(q => q.id === updatedQuote.id);
        if (index !== -1) {
          this.quotes[index] = updatedQuote;
          this.filterQuotesByStatus();
        }
        console.log('Quotation successfully accepted by customer');
        this.notificationService.showSuccess(`Quotation ${shortId} has been accepted successfully.`);
      },
      error: (error) => {
        console.error('Error accepting quotation:', error);
        this.notificationService.showError(`Error accepting quotation: ${error.message || 'Unknown error'}`);
      }
    });
  }

  // Date picker methods
  addRequestedDate(quote: Quote) {
    this.selectedDateQuote = quote;
    this.datePickerType = 'requested';
    this.selectedDate = '';
    this.showDatePickerModal = true;
  }

  addExpectedDate(quote: Quote) {
    this.selectedDateQuote = quote;
    this.datePickerType = 'expected';
    this.selectedDate = '';
    this.showDatePickerModal = true;
  }

  closeDatePickerModal() {
    this.showDatePickerModal = false;
    this.selectedDateQuote = null;
    this.datePickerType = null;
    this.selectedDate = '';
  }

  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  isDateValid(): boolean {
    if (!this.selectedDate) return false;
    const selectedDateObj = new Date(this.selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDateObj > today;
  }

  confirmDateUpdate() {
    if (!this.selectedDateQuote || !this.datePickerType || !this.selectedDate || !this.isDateValid()) {
      return;
    }

    const shortId = this.extractShortId(this.selectedDateQuote.id);
    const dateType = this.datePickerType;
    
    // Format date as DD-MM-YYYY as required by the API
    const dateObj = new Date(this.selectedDate);
    const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`;
    
    console.log(`Setting ${dateType} completion date for quote:`, this.selectedDateQuote.id, 'Date:', formattedDate);
    
    this.quoteService.updateQuoteDate(this.selectedDateQuote.id!, formattedDate, dateType).subscribe({
      next: (updatedQuote) => {
        const index = this.quotes.findIndex(q => q.id === updatedQuote.id);
        if (index !== -1) {
          this.quotes[index] = updatedQuote;
          this.filterQuotesByStatus();
        }
        console.log(`${dateType} completion date successfully updated`);
        this.notificationService.showSuccess(`${dateType === 'requested' ? 'Requested' : 'Expected'} completion date for quote ${shortId} has been set successfully.`);
        this.closeDatePickerModal();
      },
      error: (error) => {
        console.error(`Error setting ${dateType} completion date:`, error);
        this.notificationService.showError(`Error setting ${dateType} completion date: ${error.message || 'Unknown error'}`);
      }
    });
  }

  cancelQuote(quote: Quote) {
    const shortId = this.extractShortId(quote.id);
    const confirmCancel = confirm(`Are you sure you want to cancel quote ${shortId}?\n\nThis action cannot be undone and will disable all other quote actions.`);
    
    if (!confirmCancel) {
      return;
    }

    console.log('Cancelling quote:', quote.id);
    
    this.quoteService.updateQuoteStatus(quote.id!, 'cancelled').subscribe({
      next: (updatedQuote) => {
        const index = this.quotes.findIndex(q => q.id === updatedQuote.id);
        if (index !== -1) {
          this.quotes[index] = updatedQuote;
          this.filterQuotesByStatus();
        }
        console.log('Quote successfully cancelled');
        this.notificationService.showSuccess(`Quote ${shortId} has been cancelled successfully.`);
      },
      error: (error) => {
        console.error('Error cancelling quote:', error);
        this.notificationService.showError(`Error cancelling quote: ${error.message || 'Unknown error'}`);
      }
    });
  }

  // Utility methods (migrated from QuoteRow.js)
  extractShortId(id: string | undefined): string {
    if (!id) return 'N/A';
    // Extract last 8 characters or return full ID if shorter
    return id.length > 8 ? id.slice(-8) : id;
  }

  getPrimaryState(quote: Quote): string {
    // First try quoteItem state (this is where the actual state is stored)
    if (Array.isArray(quote.quoteItem) && quote.quoteItem.length > 0) {
      return quote.quoteItem[0].state || 'unknown';
    }
    
    // Fallback to main quote state if quoteItem state is not available
    if (quote.state) {
      return quote.state;
    }
    
    return 'unknown';
  }

  hasAttachment(quote: Quote): boolean {
    return Array.isArray(quote.quoteItem) && 
           quote.quoteItem.some(qi => qi.attachment && qi.attachment.length > 0);
  }

  isQuoteCancelled(quote: Quote): boolean {
    // Check quoteItem state first (this is where the actual state is stored)
    if (quote.quoteItem?.some(item => item.state === 'cancelled')) {
      return true;
    }
    
    // Fallback to main quote state
    return quote.state === 'cancelled';
  }

  isQuoteAccepted(quote: Quote): boolean {
    // Check quoteItem state first (this is where the actual state is stored)
    if (quote.quoteItem?.some(item => item.state === 'accepted')) {
      return true;
    }
    
    // Fallback to main quote state
    return quote.state === 'accepted';
  }

  isQuoteFinalized(quote: Quote): boolean {
    return this.isQuoteCancelled(quote) || this.isQuoteAccepted(quote);
  }

  isActionDisabled(quote: Quote, actionType: string): boolean {
    const isCancelled = this.isQuoteCancelled(quote);
    const isAccepted = this.isQuoteAccepted(quote);
    const isFinalized = this.isQuoteFinalized(quote);

    switch (actionType) {
      case 'viewDetails':
      case 'chat':
        return isCancelled; // Only disabled for cancelled quotes
      case 'addAttachment':
      case 'cancel':
        return isFinalized; // Disabled for both accepted and cancelled
      case 'downloadAttachment':
        return isCancelled; // Only disabled for cancelled quotes, customers can download when accepted
      case 'accept':
        // Accept button is only for providers when quote is pending
        // It should not be disabled by finalization since it only shows when pending
        return false;
      case 'acceptCustomer':
        // Customer accept button is only for customers when quote is approved
        // It should not be disabled by finalization since it only shows when approved
        return false;
      case 'addRequestedDate':
      case 'addExpectedDate':
        // Date picker buttons should not be disabled
        return false;
      default:
        return false;
    }
  }

  getButtonClass(quote: Quote, actionType: string): string {
    const baseClass = 'px-2 py-1 text-xs font-medium transition-colors rounded border';
    
    if (this.isActionDisabled(quote, actionType)) {
      return `${baseClass} text-gray-400 cursor-not-allowed border-gray-200`;
    }

    switch (actionType) {
      case 'viewDetails':
        return `${baseClass} text-blue-600 hover:text-blue-800 border-blue-200 hover:bg-blue-50`;
      default:
        return `${baseClass} text-indigo-600 hover:text-indigo-800 border-indigo-200 hover:bg-indigo-50`;
    }
  }

  getIconButtonClass(quote: Quote, actionType: string, normalColor: string): string {
    const baseClass = 'p-1.5 text-xs cursor-pointer rounded hover:bg-gray-100 transition-colors';
    
    if (this.isActionDisabled(quote, actionType)) {
      return `${baseClass} text-gray-400 cursor-not-allowed hover:bg-transparent`;
    }
    
    return `${baseClass} ${normalColor}`;
  }

  getActionTitle(quote: Quote, actionType: string): string {
    if (this.isActionDisabled(quote, actionType)) {
      const status = this.isQuoteCancelled(quote) ? 'cancelled' : 'accepted';
      return `Action disabled - quote is ${status}`;
    }
    return '';
  }

  getStateDisplay(state: QuoteStateType | undefined): string {
    if (!state) return 'Unknown';
    
    const stateMap: Record<QuoteStateType, string> = {
      'pending': 'Pending',
      'inProgress': 'In Progress',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'cancelled': 'Cancelled',
      'accepted': 'Accepted'
    };
    
    return stateMap[state] || state;
  }

  getStateClass(state: string): string {
    switch (state) {
      case 'pending':
        return 'status-pending';
      case 'inProgress':
        return 'status-inProgress';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'cancelled':
        return 'status-cancelled';
      case 'accepted':
        return 'status-accepted';
      default:
        return 'status-unknown';
    }
  }

  canUpdateState(state: QuoteStateType | undefined): boolean {
    return state !== 'cancelled' && state !== 'accepted';
  }

  // Tender methods
  extractTenderShortId(id: string | undefined): string {
    if (!id) return 'N/A';
    return id.length > 8 ? id.slice(-8) : id;
  }

  formatTenderDeadline(deadline: string): string {
    if (!deadline) return 'N/A';
    try {
      const date = new Date(deadline);
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return deadline;
    }
  }

  getTenderStateClass(state: string): string {
    switch (state) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pre-launched':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  openTenderForEdit(tender: Tender) {
    // Only allow editing of draft tenders
    if (tender.state !== 'draft') {
      this.notificationService.showError('Only draft tenders can be edited');
      return;
    }
    
    // Navigate to provider list with tender data
    this.router.navigate(['/providers'], {
      state: { tender: tender }
    });
  }

  downloadTenderAttachment(tender: Tender) {
    try {
      this.tenderService.downloadAttachment(tender);
      this.notificationService.showSuccess('Download started');
    } catch (error: any) {
      console.error('Error downloading tender attachment:', error);
      this.notificationService.showError(error.message || 'Error downloading attachment');
    }
  }

  confirmDeleteTender(tender: Tender) {
    const shortId = this.extractTenderShortId(tender.id);
    const confirmDelete = confirm(`Are you sure you want to delete Tender ${shortId}?\n\nThis action cannot be undone.`);
    
    if (!confirmDelete) {
      return;
    }

    this.deleteTender(tender);
  }

  deleteTender(tender: Tender) {
    if (!tender.id) return;

    this.tenderService.deleteTender(tender.id).subscribe({
      next: () => {
        this.tenders = this.tenders.filter(t => t.id !== tender.id);
        const shortId = this.extractTenderShortId(tender.id);
        this.notificationService.showSuccess(`Tender ${shortId} deleted successfully`);
      },
      error: (error) => {
        console.error('Error deleting tender:', error);
        this.notificationService.showError('Failed to delete tender');
      }
    });
  }

  refreshTenders() {
    this.loadTenders();
  }

  // Tender Chat Modal Methods
  openChatModal(tender: Tender) {
    this.selectedChatTender = tender;
    this.showTenderChatModal = true;
    this.loadChatMessages(tender.id);
  }

  closeTenderChatModal() {
    this.showTenderChatModal = false;
    this.selectedChatTender = null;
    this.chatMessages = [];
    this.newChatMessage = '';
  }

  loadChatMessages(tenderId: string | undefined) {
    if (!tenderId) return;
    
    // Load chat messages from localStorage
    const storageKey = `tender_chat_${tenderId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      this.chatMessages = JSON.parse(stored).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } else {
      this.chatMessages = [];
    }
  }

  sendChatMessage() {
    if (!this.newChatMessage.trim() || !this.selectedChatTender?.id) return;

    const message = {
      sender: 'user',
      text: this.newChatMessage.trim(),
      timestamp: new Date()
    };

    this.chatMessages.push(message);
    
    // Save to localStorage
    const storageKey = `tender_chat_${this.selectedChatTender.id}`;
    localStorage.setItem(storageKey, JSON.stringify(this.chatMessages));

    this.newChatMessage = '';
    
    // Scroll to bottom of chat
    setTimeout(() => {
      const chatContainer = document.querySelector('.bg-gray-50.rounded-lg.p-4.h-96');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }

  formatMessageTime(timestamp: Date): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  }
} 

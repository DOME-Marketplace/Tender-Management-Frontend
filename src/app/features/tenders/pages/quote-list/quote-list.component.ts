import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TenderService } from '../../../../core/services/tender.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginService } from '../../../../core/services/login.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Tender, TenderAttachment } from '../../../../shared/models/tender.model';
import { Quote, QuoteStateType } from '../../../../shared/models/quote.model';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { QuoteDetailsModalComponent } from '../../../../shared/components/quote-details-modal/quote-details-modal.component';
import { ChatModalComponent } from '../../../../shared/components/chat-modal/chat-modal.component';
import { AttachmentModalComponent } from '../../../../shared/components/attachment-modal/attachment-modal.component';

@Component({
  selector: 'app-quote-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    NotificationComponent, 
    ConfirmDialogComponent, 
    QuoteDetailsModalComponent, 
    ChatModalComponent, 
    AttachmentModalComponent
  ],
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
          <button
            (click)="createQuote()"
            class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create Quote
          </button>
        </div>
      </div>

      <!-- Role Tabs -->
      <div class="mb-6">
        <div class="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            (click)="selectRole('customer')"
            [class]="getRoleTabClass('customer')"
            class="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors"
          >
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            As Customer
          </button>
          <button
            (click)="selectRole('seller')"
            [class]="getRoleTabClass('seller')"
            class="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors"
          >
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            As Provider
          </button>
        </div>
      </div>

      <!-- Status Filter -->
      <div class="mb-6">
        <div class="flex items-center space-x-4">
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span class="text-sm font-medium text-gray-700">Filter by status</span>
          <select
            [(ngModel)]="statusFilter"
            (ngModelChange)="filterQuotesByStatus()"
            class="form-select rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="inProgress">In Progress</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
            <option value="accepted">Accepted</option>
          </select>
        </div>
      </div>
      
      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      
      <!-- Error State -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading quotes</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>
      
      <!-- Quotes List -->
      <div *ngIf="!loading && !error" class="bg-white shadow-md rounded-lg overflow-hidden">
        <div *ngIf="filteredQuotes.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No quotes found</h3>
          <p class="mt-1 text-sm text-gray-500">No orders found</p>
        </div>
        
        <!-- Quotes Header -->
        <div *ngIf="filteredQuotes.length > 0" class="bg-gray-50 px-6 py-3">
          <div class="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div class="col-span-2">TITLE</div>
            <div class="col-span-1">STATUS</div>
            <div class="col-span-2">REQUESTED DATE</div>
            <div class="col-span-3">EXPECTED DATE</div>
            <div class="col-span-4">ACTIONS</div>
          </div>
        </div>
        
        <!-- Quote Rows -->
        <div *ngFor="let quote of filteredQuotes" class="quote-row">
          <div class="grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-gray-100 transition-colors"
               [class.bg-gray-50]="isQuoteFinalized(quote)"
               [class.hover:bg-gray-50]="!isQuoteFinalized(quote)"
               [attr.data-quote-id]="quote.id">
            
            <!-- Title -->
            <div class="col-span-2 text-sm font-medium text-gray-900">
              {{ quote.description || '(no title)' }}
            </div>
            
            <!-- Status -->
            <div class="col-span-1">
              <span class="status-badge px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    [ngClass]="getStateClass(getQuoteItemState(quote))">
                {{ getQuoteItemState(quote) }}
              </span>
            </div>
            
            <!-- Requested Date -->
            <div class="col-span-2 text-sm text-gray-600">
              {{ quote.requestedQuoteCompletionDate | date:'dd/MM/yyyy' }}
            </div>
            
            <!-- Expected Date -->
            <div class="col-span-3 text-sm text-gray-600">
              {{ quote.expectedQuoteCompletionDate | date:'dd/MM/yyyy' }}
            </div>
            
            <!-- Actions -->
            <div class="col-span-4 flex flex-wrap gap-1">
              <!-- Expand/Collapse button for coordinator quotes (not in pending/draft) -->
              <button
                *ngIf="isCoordinatorExpandable(quote)"
                (click)="toggleExpand(quote)"
                class="px-2 py-1 text-xs font-medium transition-colors rounded border text-indigo-600 hover:text-indigo-800 border-indigo-200 hover:bg-indigo-50"
                [title]="isExpanded(quote.id) ? 'Collapse related quotes' : 'Expand to view related quotes'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline transition-transform" [class.rotate-180]="isExpanded(quote.id)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                {{ isExpanded(quote.id) ? 'Collapse' : 'Expand' }}
              </button>

              <!-- View Details -->
              <button
                [disabled]="isActionDisabled(quote, 'viewDetails')"
                (click)="viewDetails(quote)"
                [class]="getButtonClass(quote, 'viewDetails')"
                [title]="getActionTitle(quote, 'viewDetails')"
              >
                Details
              </button>
              
              <!-- Edit (only for coordinator quotes in pending/draft status) -->
              <button
                *ngIf="quote.category === 'coordinator' && !isCoordinatorExpandable(quote)"
                (click)="editTender(quote)"
                class="px-2 py-1 text-xs font-medium transition-colors rounded border text-green-600 hover:text-green-800 border-green-200 hover:bg-green-50"
                title="Edit tender"
              >
                Edit
              </button>

              
              <!-- Chat -->
              <button
                [disabled]="isActionDisabled(quote, 'chat')"
                (click)="openChat(quote)"
                [class]="getIconButtonClass(quote, 'chat', 'text-blue-500 hover:text-blue-700')"
                title="Chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 21l1.8-4A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              
              <!-- Download Attachment -->
              <button
                *ngIf="hasAttachment(quote)"
                [disabled]="isActionDisabled(quote, 'downloadAttachment')"
                (click)="downloadAttachment(quote)"
                [class]="getIconButtonClass(quote, 'downloadAttachment', 'text-purple-500 hover:text-purple-700')"
                title="Download attachment"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              
              <!-- Add Attachment (Provider only, when quote is inProgress or approved) -->
              <button
                *ngIf="selectedRole === 'seller' && (getPrimaryState(quote) === 'inProgress' || getPrimaryState(quote) === 'approved')"
                [disabled]="isActionDisabled(quote, 'addAttachment')"
                (click)="addAttachment(quote)"
                [class]="getIconButtonClass(quote, 'addAttachment', 'text-green-500 hover:text-green-700')"
                title="Add attachment"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              
              
              <!-- Accept/Cancel buttons or Finalized indicator -->
              <ng-container *ngIf="!isQuoteFinalized(quote)">
                <!-- Accept (Provider only, when quote is pending) -->
                <button
                  *ngIf="selectedRole === 'seller' && getPrimaryState(quote) === 'pending'"
                  [disabled]="isActionDisabled(quote, 'accept')"
                  (click)="acceptQuote(quote)"
                  [class]="getIconButtonClass(quote, 'accept', 'text-emerald-600 hover:text-emerald-700')"
                  title="Accept quote request"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>

                <!-- Accept (Customer only, when quote is approved) -->
                <button
                  *ngIf="selectedRole === 'customer' && getPrimaryState(quote) === 'approved'"
                  [disabled]="isActionDisabled(quote, 'acceptCustomer')"
                  (click)="acceptQuoteCustomer(quote)"
                  [class]="getIconButtonClass(quote, 'acceptCustomer', 'text-emerald-600 hover:text-emerald-700')"
                  title="Accept quotation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                
                <!-- Cancel -->
                <button
                  [disabled]="isActionDisabled(quote, 'cancel')"
                  (click)="cancelQuote(quote)"
                  [class]="getIconButtonClass(quote, 'cancel', 'text-red-500 hover:text-red-700')"
                  title="Cancel quote"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </ng-container>
              
              <!-- Finalized status indicator -->
              <ng-container *ngIf="isQuoteFinalized(quote)">
                <button
                  class="p-2 text-xs text-gray-400 cursor-not-allowed"
                  [title]="'Quote is already ' + (isQuoteCancelled(quote) ? 'cancelled' : 'accepted')"
                  disabled
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          [attr.d]="isQuoteCancelled(quote) ? 'M6 18L18 6M6 6l12 12' : 'M5 13l4 4L19 7'" />
                  </svg>
                </button>
              </ng-container>
            </div>
          </div>

          <!-- Expanded Related Quotes View -->
          <div *ngIf="isExpanded(quote.id)" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div class="ml-8">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">Related Provider Quotes</h4>
              
              <!-- Loading State -->
              <div *ngIf="isLoadingRelatedQuotes(quote.id)" class="flex items-center justify-center py-4">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <span class="ml-2 text-sm text-gray-600">Loading related quotes...</span>
              </div>

              <!-- Related Quotes Table -->
              <div *ngIf="!isLoadingRelatedQuotes(quote.id) && getRelatedQuotes(quote.id).length > 0" class="bg-white rounded-lg shadow-sm border border-gray-200">
                <!-- Header -->
                <div class="bg-gray-100 px-4 py-2 border-b border-gray-200">
                  <div class="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase">
                    <div class="col-span-3">Provider</div>
                    <div class="col-span-2">Status</div>
                    <div class="col-span-2">Requested Date</div>
                    <div class="col-span-2">Expected Date</div>
                    <div class="col-span-3">Actions</div>
                  </div>
                </div>

                <!-- Related Quote Rows -->
                <div *ngFor="let relatedQuote of getRelatedQuotes(quote.id); let last = last" 
                     class="px-4 py-3 hover:bg-gray-50 transition-colors"
                     [class.border-b]="!last"
                     [class.border-gray-200]="!last">
                  <div class="grid grid-cols-12 gap-4 items-center text-sm">
                    <!-- Provider -->
                    <div class="col-span-3 text-gray-900 font-medium">
                      {{ getProviderName(relatedQuote) }}
                    </div>
                    
                    <!-- Status -->
                    <div class="col-span-2">
                      <span class="status-badge px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full"
                            [ngClass]="getStateClass(getQuoteItemState(relatedQuote))">
                        {{ getQuoteItemState(relatedQuote) }}
                      </span>
                    </div>
                    
                    <!-- Requested Date -->
                    <div class="col-span-2 text-gray-600 text-xs">
                      {{ relatedQuote.requestedQuoteCompletionDate | date:'dd/MM/yyyy' }}
                    </div>
                    
                    <!-- Expected Date -->
                    <div class="col-span-2 text-gray-600 text-xs">
                      {{ relatedQuote.expectedQuoteCompletionDate | date:'dd/MM/yyyy' }}
                    </div>
                    
                    <!-- Actions -->
                    <div class="col-span-3 flex gap-1">
                      <!-- View Details -->
                      <button
                        (click)="viewDetails(relatedQuote)"
                        class="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                        title="View details"
                      >
                        Details
                      </button>
                      
                      <!-- Chat -->
                      <button
                        (click)="openChat(relatedQuote)"
                        class="p-1 text-blue-500 hover:text-blue-700 rounded hover:bg-gray-100 transition-colors"
                        title="Chat"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 21l1.8-4A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                      
                      <!-- Download Attachment -->
                      <button
                        *ngIf="hasAttachment(relatedQuote)"
                        (click)="downloadAttachment(relatedQuote)"
                        class="p-1 text-purple-500 hover:text-purple-700 rounded hover:bg-gray-100 transition-colors"
                        title="Download attachment"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No Related Quotes -->
              <div *ngIf="!isLoadingRelatedQuotes(quote.id) && getRelatedQuotes(quote.id).length === 0" 
                   class="text-center py-6 text-sm text-gray-500 bg-white rounded-lg border border-gray-200">
                <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No related provider quotes found</p>
              </div>
            </div>
          </div>
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

    .status-draft {
      @apply bg-yellow-100 text-yellow-800;
    }

    .status-pre-launched {
      @apply bg-blue-100 text-blue-800;
    }

    .status-launched {
      @apply bg-green-100 text-green-800;
    }

    .status-closed {
      @apply bg-gray-100 text-gray-800;
    }

    .rotate-180 {
      transform: rotate(180deg);
    }
  `]
})
export class QuoteListComponent implements OnInit {
  private router = inject(Router);
  private tenderService = inject(TenderService);
  private authService = inject(AuthService);
  private loginService = inject(LoginService);
  private notificationService = inject(NotificationService);

  quotes: Quote[] = [];
  filteredQuotes: Quote[] = [];
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

  // Expanded rows for coordinator quotes
  expandedQuoteIds: Set<string> = new Set();
  relatedQuotesMap: Map<string, Quote[]> = new Map();
  loadingRelatedQuotes: Set<string> = new Set();

  

  ngOnInit() {
    this.currentUserId = this.loginService.getUserId();
    if (this.currentUserId) {
      this.loadQuotes();
    } else {
      this.error = 'User not authenticated';
    }
  }

  loadQuotes() {
    if (!this.currentUserId) {
      this.error = 'User not authenticated';
      return;
    }

    this.loading = true;
    this.error = null;

    // Use specific API endpoints based on role
    let quotesObservable: Observable<Quote[]>;
    
    if (this.selectedRole === 'customer') {
      // Customer view: Get coordinator quotes they created (raw)
      quotesObservable = this.tenderService.getCoordinatorQuotesRaw(this.currentUserId);
    } else {
      // Seller/Provider view: Get tendering quotes they received (raw)
      quotesObservable = this.tenderService.getTenderingQuotesRaw(this.currentUserId);
    }
    
    quotesObservable.subscribe({
      next: (quotes: Quote[]) => {
        // Use quotes as-is to preserve quoteItem.state
        this.quotes = quotes;
        
        // Debug: Log quote states and externalId
        console.log(`Loaded ${this.quotes.length} quotes as ${this.selectedRole}`);
        this.quotes.forEach(quote => {
          console.log(`Quote ${this.extractShortId(quote.id)}:`, {
            category: quote.category,
            state: quote.state,
            quoteItemState: this.getQuoteItemState(quote),
            externalId: quote.externalId,
            id: quote.id
          });
        });
        
        this.filterQuotesByStatus();
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Failed to load quotes:', error);
        this.error = 'Failed to load quotes. Please try again.';
        this.loading = false;
      }
    });
  }

  private mapTenderToQuote(tender: Tender): Quote {
    return {
      id: tender.id,
      href: '',
      description: tender.tenderNote || '',
      quoteDate: tender.createdAt || new Date().toISOString(),
      expectedQuoteCompletionDate: tender.expectedQuoteCompletionDate,
      requestedQuoteCompletionDate: tender.requestedQuoteCompletionDate,
      state: this.mapTenderStateToQuoteState(tender.state),
      category: tender.category,
      externalId: tender.external_id,
      relatedParty: tender.selectedProviders.map(id => ({
        id,
        role: 'Seller',
        name: tender.provider,
        '@referredType': 'Organization'
      })),
      // Provide a minimal quoteItem array carrying the state so the UI can display it.
      // We intentionally cast to any to avoid enforcing the full TMF structure here.
      quoteItem: [
        { state: this.mapTenderStateToQuoteState(tender.state) } as any
      ],
      note: []
    };
  }

  private mapTenderStateToQuoteState(tenderState: 'draft' | 'pre-launched' | 'pending' | 'sent' | 'closed'): QuoteStateType {
    switch (tenderState) {
      case 'draft': return 'inProgress';
      case 'pending': return 'pending';
      case 'sent': return 'approved';
      case 'closed': return 'accepted';
      default: return 'inProgress';
    }
  }

  refreshQuotes() {
    this.loadQuotes();
  }

  selectRole(role: 'customer' | 'seller') {
    this.selectedRole = role;
    this.loadQuotes();
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

  createQuote() {
    this.router.navigate(['/quotes/new']);
  }

  viewDetails(quote: Quote) {
    this.selectedQuoteId = quote.id!;
    this.showQuoteDetailsModal = true;
  }

  editTender(quote: Quote) {
    // Extract attachment from quoteItem if it exists
    let attachment: TenderAttachment | undefined = undefined;
    if (Array.isArray(quote.quoteItem) && quote.quoteItem.length > 0) {
      const firstItem = quote.quoteItem[0];
      if (Array.isArray(firstItem.attachment) && firstItem.attachment.length > 0) {
        const att = firstItem.attachment[0];
        attachment = {
          name: att.name || 'attachment.pdf',
          mimeType: att.mimeType || 'application/pdf',
          content: att.content || '',
          size: att.size?.amount
        };
        console.log('Extracted attachment for edit:', attachment.name);
      }
    }

    // Convert Quote to Tender format for editing
    const tender: Tender = {
      id: quote.id,
      category: quote.category === 'coordinator' ? 'coordinator' : 'tendering',
      state: this.mapQuoteStateToTenderState(quote.state),
      responseDeadline: quote.requestedQuoteCompletionDate || quote.expectedQuoteCompletionDate || new Date().toISOString(),
      tenderNote: quote.description || '',
      attachment: attachment,
      selectedProviders: quote.relatedParty?.filter(p => p.role === 'Seller').map(p => p.id) || [],
      expectedQuoteCompletionDate: quote.expectedQuoteCompletionDate,
      requestedQuoteCompletionDate: quote.requestedQuoteCompletionDate
    };

    console.log('Navigating to edit tender with data:', tender);

    // Navigate to providers page with tender data
    this.router.navigate(['/providers'], {
      state: { tender }
    });
  }

  private mapQuoteStateToTenderState(quoteState: QuoteStateType | undefined): 'draft' | 'pre-launched' | 'pending' | 'sent' | 'closed' {
    if (!quoteState) return 'draft';
    
    switch (quoteState) {
      case 'inProgress': return 'draft';
      case 'pending': return 'pending';
      case 'approved': return 'sent';
      case 'accepted':
      case 'cancelled':
      case 'rejected': return 'closed';
      default: return 'draft';
    }
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
      
      this.tenderService.updateQuoteStatus(updatedQuote.id!, 'approved').subscribe({
        next: (approvedQuote: Quote) => {
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
        error: (error: Error) => {
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
      this.tenderService.updateQuoteState(this.quoteToUpdate.id!, this.selectedState).subscribe({
        next: (updatedQuote: Quote) => {
          const index = this.quotes.findIndex(q => q.id === updatedQuote.id);
          if (index !== -1) {
            this.quotes[index] = updatedQuote;
            this.filterQuotesByStatus();
          }
          this.showStateUpdate = false;
          this.notificationService.showSuccess('Quote state updated successfully');
        },
        error: (error: Error) => {
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
      this.tenderService.deleteQuote(this.quoteToDelete.id!).subscribe({
        next: () => {
          this.quotes = this.quotes.filter(q => q.id !== this.quoteToDelete!.id);
          this.filterQuotesByStatus();
          this.showDeleteConfirm = false;
          this.notificationService.showSuccess('Quote deleted successfully');
        },
        error: (error: Error) => {
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
      this.tenderService.downloadAttachment(quote);
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
    
    this.tenderService.updateQuoteStatus(quote.id!, 'inProgress').subscribe({
      next: (updatedQuote: Quote) => {
        const index = this.quotes.findIndex(q => q.id === updatedQuote.id);
        if (index !== -1) {
          this.quotes[index] = updatedQuote;
          this.filterQuotesByStatus();
        }
        console.log('Quote request successfully accepted');
        this.notificationService.showSuccess(`Quote request ${shortId} has been accepted and is now in progress.`);
      },
      error: (error: Error) => {
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
    
    this.tenderService.updateQuoteStatus(quote.id!, 'accepted').subscribe({
      next: (updatedQuote: Quote) => {
        const index = this.quotes.findIndex(q => q.id === updatedQuote.id);
        if (index !== -1) {
          this.quotes[index] = updatedQuote;
          this.filterQuotesByStatus();
        }
        console.log('Quotation successfully accepted by customer');
        this.notificationService.showSuccess(`Quotation ${shortId} has been accepted successfully.`);
      },
      error: (error: Error) => {
        console.error('Error accepting quotation:', error);
        this.notificationService.showError(`Error accepting quotation: ${error.message || 'Unknown error'}`);
      }
    });
  }

  // Date picker methods
  

  

  cancelQuote(quote: Quote) {
    const shortId = this.extractShortId(quote.id);
    const confirmCancel = confirm(`Are you sure you want to cancel quote ${shortId}?\n\nThis action cannot be undone and will disable all other quote actions.`);
    
    if (!confirmCancel) {
      return;
    }

    console.log('Cancelling quote:', quote.id);
    
    this.tenderService.updateQuoteStatus(quote.id!, 'cancelled').subscribe({
      next: (updatedQuote: Quote) => {
        const index = this.quotes.findIndex(q => q.id === updatedQuote.id);
        if (index !== -1) {
          this.quotes[index] = updatedQuote;
          this.filterQuotesByStatus();
        }
        console.log('Quote successfully cancelled');
        this.notificationService.showSuccess(`Quote ${shortId} has been cancelled successfully.`);
      },
      error: (error: Error) => {
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

  getQuoteItemState(quote: Quote): string {
    let state = 'unknown';
    
    if (Array.isArray(quote.quoteItem) && quote.quoteItem.length > 0) {
      // Scan all items and pick the first defined state
      for (const item of quote.quoteItem) {
        if (item && (item as any).state) {
          state = (item as any).state as string;
          break;
        }
      }
    }
    
    // Apply mapping only for coordinator quotes
    if (quote.category === 'coordinator') {
      return this.mapCoordinatorStatusToGUI(state);
    }
    
    return state;
  }

  /**
   * Map coordinator quote status from backend (TMF) to frontend (GUI) display
   * Only for coordinator quotes
   */
  mapCoordinatorStatusToGUI(backendStatus: string): string {
    const mapping: { [key: string]: string } = {
      'pending': 'draft',
      'inProgress': 'pre-launched',
      'approved': 'launched',
      'accepted': 'closed',
      'cancelled': 'cancelled',
      'rejected': 'rejected'
    };
    return mapping[backendStatus] || backendStatus;
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
        return true;
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
      // Coordinator quote states (mapped)
      case 'draft':
        return 'status-draft';
      case 'pre-launched':
        return 'status-pre-launched';
      case 'launched':
        return 'status-launched';
      case 'closed':
        return 'status-closed';
      default:
        return 'status-unknown';
    }
  }

  canUpdateState(state: QuoteStateType | undefined): boolean {
    return state !== 'cancelled' && state !== 'accepted';
  }

  // ========================================
  // EXPAND/COLLAPSE RELATED QUOTES
  // ========================================

  /**
   * Check if a coordinator quote is expandable
   * (not in pending status, which displays as "draft")
   */
  isCoordinatorExpandable(quote: Quote): boolean {
    if (quote.category !== 'coordinator') {
      return false;
    }
    
    const state = this.getPrimaryState(quote);
    
    // Expandable if NOT pending (backend state "pending" = GUI display "draft")
    // All other states (inProgress/pre-launched, approved/launched, etc.) are expandable
    return state !== 'pending';
  }

  /**
   * Check if a quote row is expanded
   */
  isExpanded(quoteId: string | undefined): boolean {
    return quoteId ? this.expandedQuoteIds.has(quoteId) : false;
  }

  /**
   * Toggle expand/collapse for a coordinator quote
   */
  toggleExpand(quote: Quote): void {
    if (!quote.id) return;

    const isCurrentlyExpanded = this.expandedQuoteIds.has(quote.id);

    if (isCurrentlyExpanded) {
      // Collapse
      console.log(`Collapsing quote ${this.extractShortId(quote.id)}`);
      this.expandedQuoteIds.delete(quote.id);
    } else {
      // Expand - fetch related quotes if not already loaded
      console.log(`Expanding quote ${this.extractShortId(quote.id)}, externalId: ${quote.externalId}`);
      this.expandedQuoteIds.add(quote.id);
      
      if (!this.relatedQuotesMap.has(quote.id)) {
        console.log('Fetching related quotes...');
        this.loadRelatedQuotes(quote);
      } else {
        console.log(`Using cached ${this.relatedQuotesMap.get(quote.id)?.length} related quotes`);
      }
    }
  }

  /**
   * Load related tendering quotes for a coordinator quote
   */
  private loadRelatedQuotes(coordinatorQuote: Quote): void {
    if (!coordinatorQuote.id || !this.currentUserId) {
      console.error('Cannot load related quotes: missing id or userId', {
        id: coordinatorQuote.id,
        userId: this.currentUserId
      });
      return;
    }

    // For coordinator quotes, use the quote's own ID as the externalId
    // because tendering quotes are created with the coordinator quote ID as their externalId
    const externalIdToUse = coordinatorQuote.externalId || coordinatorQuote.id;

    console.log(`Loading related quotes for coordinator ${this.extractShortId(coordinatorQuote.id)}:`, {
      userId: this.currentUserId,
      role: 'Customer',
      externalId: externalIdToUse,
      coordinatorId: coordinatorQuote.id
    });

    this.loadingRelatedQuotes.add(coordinatorQuote.id);

    // Fetch tendering quotes using the coordinator quote's ID as externalId
    this.tenderService.getTenderingQuotesRaw(
      this.currentUserId,
      'Customer',
      externalIdToUse
    ).subscribe({
      next: (relatedQuotes: Quote[]) => {
        this.relatedQuotesMap.set(coordinatorQuote.id!, relatedQuotes);
        this.loadingRelatedQuotes.delete(coordinatorQuote.id!);
        console.log(`✅ Successfully loaded ${relatedQuotes.length} related quotes for coordinator ${this.extractShortId(coordinatorQuote.id)}`);
        if (relatedQuotes.length > 0) {
          console.log('Related quotes:', relatedQuotes.map(q => ({
            id: this.extractShortId(q.id),
            provider: this.getProviderName(q),
            state: this.getQuoteItemState(q)
          })));
        }
      },
      error: (error: Error) => {
        console.error('❌ Failed to load related quotes:', error);
        this.loadingRelatedQuotes.delete(coordinatorQuote.id!);
        this.notificationService.showError('Failed to load related quotes');
      }
    });
  }

  /**
   * Get related quotes for a coordinator quote
   */
  getRelatedQuotes(quoteId: string | undefined): Quote[] {
    if (!quoteId) return [];
    return this.relatedQuotesMap.get(quoteId) || [];
  }

  /**
   * Check if related quotes are loading
   */
  isLoadingRelatedQuotes(quoteId: string | undefined): boolean {
    return quoteId ? this.loadingRelatedQuotes.has(quoteId) : false;
  }

  /**
   * Get provider name from related party
   */
  getProviderName(quote: Quote): string {
    const provider = quote.relatedParty?.find(party => party.role === 'Seller');
    return provider?.name || provider?.id || 'Unknown Provider';
  }
} 

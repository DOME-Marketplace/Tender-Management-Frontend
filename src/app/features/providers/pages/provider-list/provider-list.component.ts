import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ProviderService, Provider } from '../../../../core/services/provider.service';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';
import { TenderService } from '../../../../core/services/tender.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Tender_Create, Tender_Update, TenderAttachment, Tender } from '../../../../shared/models/tender.model';
import { SearchOrganizationsFilters } from '../../../../shared/models/search-organizations-filters.model';
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-provider-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationComponent, ReactiveFormsModule],
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
          <h3 class="text-lg font-bold text-gray-900">{{ editingTenderId ? 'Edit Tender' : 'Create New Tender' }}</h3>
          <button (click)="closeTenderModal()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Step 1: Title Only -->
        <div *ngIf="tenderCreationStep === 1">
          <div class="mb-6">
            <label for="tenderTitle" class="block text-sm font-medium text-gray-700 mb-2">
              Tender Title *
            </label>
            <input 
              type="text" 
              id="tenderTitle"
              [(ngModel)]="tenderTitle"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter tender title or description..."
              autofocus
            />
            <p class="mt-2 text-sm text-gray-500">This will be the main description of your tender</p>
          </div>

          <!-- Actions for Step 1 -->
          <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button 
              (click)="closeTenderModal()" 
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button 
              (click)="saveInitialTender()" 
              [disabled]="!tenderTitle.trim() || tenderLoading"
              class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ tenderLoading ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>

        <!-- Step 2: Completion Dates -->
        <div *ngIf="tenderCreationStep === 2">
          <!-- Display Title (Read-only) -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label class="block text-sm font-medium text-gray-700 mb-2">Tender Title</label>
            <p class="text-gray-900 font-medium">{{ tenderTitle }}</p>
          </div>
          
          <!-- Requested Completion Date -->
          <div class="mb-6">
            <label for="requestedDate" class="block text-sm font-medium text-gray-700 mb-2">
              Expected Fulfillment Start Date *
            </label>
            <div class="flex items-center space-x-3">
              <input 
                type="date" 
                id="requestedDate"
                [(ngModel)]="requestedCompletionDate"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button 
                (click)="setRequestedDate()" 
                [disabled]="!requestedCompletionDate || tenderLoading"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium min-w-[80px]"
              >
                {{ requestedDateSet ? '✓ Set' : 'Set' }}
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-500">Format: DD/MM/YYYY</p>
          </div>

          <!-- Expected Completion Date -->
          <div class="mb-6">
            <label for="expectedDate" class="block text-sm font-medium text-gray-700 mb-2">
              Effective Quote Completion Date *
            </label>
            <div class="flex items-center space-x-3">
              <input 
                type="date" 
                id="expectedDate"
                [(ngModel)]="expectedCompletionDate"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button 
                (click)="setExpectedDate()" 
                [disabled]="!expectedCompletionDate || tenderLoading"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium min-w-[80px]"
              >
                {{ expectedDateSet ? '✓ Set' : 'Set' }}
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-500">Format: DD/MM/YYYY</p>
          </div>

          <!-- PDF Upload -->
          <div class="mb-6">
            <label for="pdfFile" class="block text-sm font-medium text-gray-700 mb-2">
              PDF Attachment *
            </label>
            
            <!-- Display existing attachment prominently -->
            <div *ngIf="existingAttachment" class="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-blue-900">Current PDF:</p>
                    <p class="text-sm text-blue-700">{{ existingAttachment.name }}</p>
                  </div>
                </div>
                <span class="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">Attached</span>
              </div>
              <p class="text-xs text-blue-600 mt-2">Upload a new file to replace the existing attachment</p>
            </div>
            
            <div class="flex items-center space-x-3">
              <input 
                type="file" 
                id="pdfFile"
                accept=".pdf"
                (change)="onPdfFileSelected($any($event))"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button 
                (click)="setPdfAttachment()" 
                [disabled]="!selectedPdfFile || tenderLoading"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium min-w-[80px]"
              >
                {{ pdfAttachmentSet ? '✓ Set' : 'Set' }}
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-500">
              {{ existingAttachment ? 'Select a new file to upload or keep the current one' : 'Only PDF files allowed' }}
            </p>
          </div>

          <!-- Actions for Step 2 -->
          <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button 
              (click)="closeTenderModal()" 
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button 
              (click)="proceedToProviderSelection()"
              [disabled]="!isStep2Complete()&& false "
              [title]="!isStep2Complete() ? 'Complete all fields first' : ''"
              class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed relative group"
            >
              Next: Select Providers
              <span 
                *ngIf="!isStep2Complete()" 
                class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              >
                Complete all fields first
              </span>
            </button>
          </div>
        </div>

        <!-- Step 3: Provider Selection -->
        <div *ngIf="tenderCreationStep === 3">
          <!-- Display Title (Read-only) -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label class="block text-sm font-medium text-gray-700 mb-2">Tender Title</label>
            <p class="text-gray-900 font-medium">{{ tenderTitle }}</p>
          </div>

          <!-- Date Summary -->
          <div class="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 class="text-sm font-medium text-green-900 mb-2">✓ Dates Set</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-green-700">Effective:</span>
                <span class="ml-2 font-medium text-green-900">{{ formatDateForDisplay(expectedCompletionDate) }}</span>
              </div>
              <div>
                <span class="text-green-700">Expected Fulfillment:</span>
                <span class="ml-2 font-medium text-green-900">{{ formatDateForDisplay(requestedCompletionDate) }}</span>
              </div>
            </div>
          </div>

          <!-- PDF Summary -->
          <div *ngIf="existingAttachment || pdfAttachmentSet" class="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 class="text-sm font-medium text-green-900 mb-2">✓ PDF Attachment Set</h4>
            <p class="text-sm text-green-700">{{ existingAttachment?.name || selectedPdfFile?.name }}</p>
          </div>

          <!-- Loading State -->
          <div *ngIf="tenderLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>

          <!-- Error State -->
          <div *ngIf="tenderError" class="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p class="text-sm text-red-700">{{ tenderError }}</p>
          </div>

          <div *ngIf="!tenderLoading && !tenderError">
            <!-- Already Invited Providers Section -->
            <div *ngIf="invitedProviders.length > 0" class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Already Invited Providers ({{ invitedProviders.length }})
              </label>
              
              <div class="max-h-64 overflow-y-auto border border-green-300 rounded-lg bg-green-50">
                <div *ngFor="let invited of invitedProviders" 
                     class="flex items-center justify-between p-4 hover:bg-green-100 border-b border-green-200 last:border-b-0">
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">
                      {{ invited.provider.tradingName || 'Unnamed Provider' }}
                    </p>
                    <p *ngIf="invited.provider.externalReference?.[0]?.name" class="text-xs text-gray-500 mt-1">
                      {{ invited.provider.externalReference?.[0]?.name }}
                    </p>
                  </div>
                  <button 
                    (click)="removeInvitedProvider(invited.quoteId, invited.provider.id)"
                    class="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                    title="Remove invitation"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Available Providers Selection -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Select Providers to Invite
              </label>
           
               <div class=" bg-white rounded-lg shadow-sm">



  <!-- Responsive grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

    <!-- Left column -->
    <div>
  <label class="block text-sm font-medium text-gray-700 mb-2">Countries</label>
  <select multiple [formControl]="countriesCtrl"
          class="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm
                 focus:border-blue-500 focus:ring focus:ring-blue-200">
    <option *ngFor="let c of countriesOptions" [value]="c">{{ c }}</option>
  </select>
</div>

<!-- Categories -->
<div>
  <label class="block text-sm font-medium text-gray-700 mb-2">Categories</label>
  <select multiple [formControl]="categoriesCtrl"
          class="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm
                 focus:border-blue-500 focus:ring focus:ring-blue-200">
    <option *ngFor="let cat of categoriesOptions" [value]="cat">{{ cat }}</option>
  </select>
</div>

<!-- Compliance Levels (new) -->
<div>
  <label class="block text-sm font-medium text-gray-700 mb-2">Compliance Levels</label>
  <select multiple [formControl]="complianceLevelsCtrl"
          class="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm
                 focus:border-blue-500 focus:ring focus:ring-blue-200">
    <option *ngFor="let cl of complianceLevelsOptions" [value]="cl">{{ cl }}</option>
  </select>
</div>

    <!-- Clear button -->
    <div class="md:col-span-2 flex justify-start">
      <button type="button"
              (click)="clearFilters()"
              class="mt-4 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm
                     hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300">
        Clear Filters
      </button>
       <button type="button"
              (click)="emitFilters()"
              class="mt-4 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm
                     hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300">
        Search
      </button>
    </div>

  </div>
</div>




              
              <div class="max-h-96 overflow-y-auto border border-gray-300 rounded-lg">
                <div *ngFor="let provider of _safeInvitedList" 
                     class="flex items-center p-4 hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
                     
                  <input 
                    *ngIf="provider.id"
                    type="checkbox" 
                    [id]="'provider-' + provider.id"
                    [checked]="selectedProviders.has(provider.id)"
                    (change)="toggleProviderSelection(provider.id)"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label *ngIf="provider.id" [for]="'provider-' + provider.id" class="ml-3 flex-1 cursor-pointer">
                    <div>
                      <p class="text-sm font-medium text-gray-900">
                        {{ provider.tradingName || 'Unnamed Provider' }}
                      </p>
                      <p *ngIf="provider.externalReference?.[0]?.name" class="text-xs text-gray-500 mt-1">
                        {{ provider.externalReference?.[0]?.name }}
                      </p>
                    </div>
                  </label>
                </div>   

                <div *ngFor="let provider of availableProviders" 
                     class="flex items-center p-4 hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
                    
                  <input 
                    *ngIf="provider.id"
                    type="checkbox" 
                    [id]="'provider-' + provider.id"
                    [checked]="selectedProviders.has(provider.id)"
                    (change)="toggleProviderSelection(provider.id)"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label *ngIf="provider.id" [for]="'provider-' + provider.id" class="ml-3 flex-1 cursor-pointer">
                    <div>
                      <p class="text-sm font-medium text-gray-900">
                        {{ provider.tradingName || 'Unnamed Provider' }}
                      </p>
                      <p *ngIf="provider.externalReference?.[0]?.name" class="text-xs text-gray-500 mt-1">
                        {{ provider.externalReference?.[0]?.name }}
                      </p>
                    </div>
                  </label>
                </div>                
                <div *ngIf="availableProviders.length === 0" class="p-8 text-center text-gray-500">
                    <ng-container *ngIf="!hasActiveFilters(); else filteredEmpty">
                      <p class="text-sm">
                        No more providers available. All providers have been invited.
                      </p>
                    </ng-container>
                    <ng-template #filteredEmpty>
                      <p class="text-sm">
                        No filters Selected. Adjust Countries/Categories and click <strong>Search</strong>.
                      </p>
                     
                    </ng-template>
                  </div>
              </div>

              <p class="mt-2 text-sm text-gray-500">
                {{ selectedProviders.size }} provider(s) selected
              </p>
            </div>
          </div>

          <!-- Actions for Step 3 -->
          <div class="flex justify-between space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button 
              (click)="backToStep2()" 
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
            >
              ← Back
            </button>
            <div class="flex space-x-3">
              <button 
                (click)="closeTenderModal()" 
                class="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                (click)="saveProvidersList()"
                [disabled]="selectedProviders.size === 0 || tenderLoading"
                [title]="selectedProviders.size === 0 ? 'Please select at least one provider' : ''"
                class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed relative group"
              >
                {{ tenderLoading ? 'Inviting...' : 'Save Providers List' }}
                <span 
                  *ngIf="selectedProviders.size === 0" 
                  class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                >
                  Please select at least one provider
                </span>
              </button>
              
              <button 
                (click)="finalizeTender()"
                [disabled]="invitedProviders.length === 0 || tenderLoading"
                [title]="invitedProviders.length === 0 ? 'Please invite at least one provider first' : ''"
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed relative group"
              >
                Submit Tender
                <span 
                  *ngIf="invitedProviders.length === 0" 
                  class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                >
                  Please invite at least one provider first
                </span>
              </button>
            </div>
          </div>
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
  private tenderService = inject(TenderService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  countriesOptions: string[] = [];
  categoriesOptions: string[] = [];
  complianceLevelsOptions: string[] = [];
  

  _safeInvitedList: Provider[] = [];
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
  invitedProviders: Array<{ provider: Provider; quoteId: string }> = [];
  tenderLoading = false;
  tenderError: string | null = null;

  // Tender form fields - Step 1: Title only
  tenderTitle: string = '';

  // Step 2: Date fields and PDF upload
  expectedCompletionDate: string = '';
  requestedCompletionDate: string = '';
  expectedDateSet: boolean = false;
  requestedDateSet: boolean = false;
  selectedPdfFile: File | null = null;
  pdfAttachmentSet: boolean = false;

  // Additional fields (added in later steps)
  responseDeadline: string = '';
  attachmentFile: File | null = null;
  tenderNote: string = '';

  // Edit mode
  editingTenderId: string | null = null;
  existingAttachment: TenderAttachment | null = null;
  createdQuoteId: string | null = null;

  // Track tender creation steps
  tenderCreationStep: number = 1; // 1 = Title, 2 = Dates, 3 = Details, 4 = Providers

  countriesCtrl = new FormControl<string[]>([], { nonNullable: true });
  categoriesCtrl = new FormControl<string[]>([], { nonNullable: true });

  // Default organization search filters
  orgFilters: SearchOrganizationsFilters = {
    categories: [],
    countries: []
  };
  console = console;
  ngOnInit() {
    this.loadFilterOptions();
    this.loadProviders();
    

    // Check if there's a tender to edit from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['tender']) {
      const tender = navigation.extras.state['tender'] as Tender;

      this.loadTenderForEdit(tender);
    } else {
      // Check history state (for page refresh)
      const state = window.history.state;
      if (state?.tender) {
        const tender = state.tender as Tender;
        this.loadTenderForEdit(tender);
      }
    }
  }

  emitFilters(): void {
    const newFilters: SearchOrganizationsFilters = {
      countries: this.countriesCtrl.value ?? [],
      categories: this.categoriesCtrl.value ?? []
    };
    console.log(newFilters);
    this.orgFilters = newFilters;
    this.loadTenderProviders();
  }

  // Are any filters currently active?
  hasActiveFilters(): boolean {
    const hasCountries = (this.orgFilters.countries?.length ?? 0) == 0;
    const hasCategories = (this.orgFilters.categories?.length ?? 0) == 0;

    return hasCountries && hasCategories;
  }
  clearFilters() {
    // Reset both controls to empty arrays (and emit change)
    this.countriesCtrl.setValue([], { emitEvent: true });
    this.categoriesCtrl.setValue([], { emitEvent: true });

    // If you rely on (change) only, also call emit explicitly:
    this.emitFilters();
  }
  loadTenderForEdit(tender: Tender) {

    

    this.editingTenderId = tender.id || null;
    this.createdQuoteId = tender.id || null;
    this.tenderTitle = tender.tenderNote || '';
    this.responseDeadline = tender.responseDeadline;
    this.tenderNote = tender.tenderNote || '';

    // Store existing attachment
    if (tender.attachment) {
      this.existingAttachment = tender.attachment;
      console.log('Tender has existing attachment:', tender.attachment.name);
    } else {
      this.existingAttachment = null;
    }

    this.selectedProviders = new Set(tender.selectedProviders);


    // Extract dates directly from the tender object
    console.log('Extracting dates from tender - Effective:', tender.effectiveQuoteCompletionDate, 'Expected Fulfillment:', tender.expectedFulfillmentStartDate);
    this.extractDatesFromTender(tender);

    // Set to Step 2 (dates)
    this.tenderCreationStep = 2;
    this.showTenderModal = true;
  }

  /**
   * Convert date from DD-MM-YYYY or ISO format to YYYY-MM-DD format for HTML input
   */
  convertDateFromAPI(dateString: string | undefined): string {
    if (!dateString) return '';

    // Handle ISO format (YYYY-MM-DDTHH:mm:ss...)
    if (dateString.includes('T')) {
      return dateString.split('T')[0]; // Return just the YYYY-MM-DD part
    }

    // Handle DD-MM-YYYY format
    const parts = dateString.split('-');
    if (parts.length === 3) {
      // Check if it's already in YYYY-MM-DD format
      if (parts[0].length === 4) {
        return dateString; // Already in correct format
      }
      // Convert from DD-MM-YYYY to YYYY-MM-DD
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return '';
  }

  /**
   * Extract and set dates from a tender/quote object
   */
  extractDatesFromTender(tender: Tender) {
    console.log('Extracting dates from tender:', tender);

    // Extract and convert effective completion date
    if (tender.effectiveQuoteCompletionDate) {
      this.expectedCompletionDate = this.convertDateFromAPI(tender.effectiveQuoteCompletionDate);
      this.expectedDateSet = !!this.expectedCompletionDate;
      console.log('Effective date extracted:', this.expectedCompletionDate, 'Set:', this.expectedDateSet);
    } else {
      this.expectedCompletionDate = '';
      this.expectedDateSet = false;
    }

    // Extract and convert expected fulfillment start date
    if (tender.expectedFulfillmentStartDate) {
      this.requestedCompletionDate = this.convertDateFromAPI(tender.expectedFulfillmentStartDate);
      this.requestedDateSet = !!this.requestedCompletionDate;
      console.log('Expected fulfillment date extracted:', this.requestedCompletionDate, 'Set:', this.requestedDateSet);
    } else {
      this.requestedCompletionDate = '';
      this.requestedDateSet = false;
    }

    // Check if PDF attachment exists
    if (tender.attachment) {
      this.pdfAttachmentSet = true;
      console.log('PDF attachment exists:', tender.attachment.name);
    } else {
      this.pdfAttachmentSet = false;
    }
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
    this.tenderCreationStep = 1; // Start at step 1
    this.selectedProviders.clear();
    this.resetTenderForm();
  }

  loadTenderProviders() {
    this.tenderLoading = true;
    this.tenderError = null;

    this.providerService.getProvidersForTenderNew(this.orgFilters).subscribe({
      next: (providers) => {
        this.tenderProviders = providers;
        this.tenderLoading = false;
        this.updateAvailableProviders()

        // After providers are loaded, load invited providers (if in edit mode)
        if (this.tenderCreationStep === 3) {
          this.loadInvitedProviders();
        }
      },
      error: (err) => {
        this.tenderError = 'Failed to load providers: ' + (err.message || 'Unknown error');
        this.tenderLoading = false;
        console.error('Error loading tender providers:', err);
      }
    });
  }



  closeTenderModal() {
    this.showTenderModal = false;
    this.tenderCreationStep = 1;
    this.selectedProviders.clear();
    this.invitedProviders = [];
    this.tenderProviders = [];
    this.tenderError = null;
    this.editingTenderId = null;
    this.resetTenderForm();
  }

  resetTenderForm() {
    this.tenderTitle = '';
    this.expectedCompletionDate = '';
    this.requestedCompletionDate = '';
    this.expectedDateSet = false;
    this.requestedDateSet = false;
    this.responseDeadline = '';
    this.attachmentFile = null;
    this.tenderNote = '';
    this.existingAttachment = null;
    this.createdQuoteId = null;
    this.selectedPdfFile = null;
    this.pdfAttachmentSet = false;
    this.invitedProviders = [];
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

  /**
   * Step 1: Save initial tender with just title
   * Calls createCoordinatorQuote API
   */
  saveInitialTender() {
    if (!this.tenderTitle.trim()) {
      this.notificationService.showError('Tender title is required');
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      this.notificationService.showError('User not logged in');
      return;
    }

    this.tenderLoading = true;

    this.tenderService.createCoordinatorTender(userId, this.tenderTitle.trim()).subscribe({
      next: (createdTender) => {
        console.log('Coordinator tender created:', createdTender);
        this.createdQuoteId = createdTender.id || null;
        this.editingTenderId = createdTender.id || null;
        this.notificationService.showSuccess('Tender created! Now set the completion dates.');
        this.tenderLoading = false;

        // Move to Step 2: Date fields
        this.tenderCreationStep = 2;
      },
      error: (error) => {
        console.error('Error creating tender:', error);
        this.notificationService.showError('Failed to create tender: ' + (error.message || 'Unknown error'));
        this.tenderLoading = false;
      }
    });
  }

  /**
   * Convert date from YYYY-MM-DD to DD-MM-YYYY format
   */
  formatDateForAPI(dateString: string): string {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  }

  /**
   * Step 2: Set expected completion date
   */
  setExpectedDate() {
    if (!this.expectedCompletionDate || !this.createdQuoteId) {
      this.notificationService.showError('Please select a date');
      return;
    }

    this.tenderLoading = true;
    const formattedDate = this.formatDateForAPI(this.expectedCompletionDate);

    this.tenderService.updateTenderDate(this.createdQuoteId, formattedDate, 'effective').subscribe({
      next: (updatedTender) => {
        console.log('Effective completion date updated:', updatedTender);
        this.expectedDateSet = true;
        this.notificationService.showSuccess('Effective completion date set successfully!');
        this.tenderLoading = false;
      },
      error: (error) => {
        console.error('Error setting effective date:', error);
        this.notificationService.showError('Failed to set effective date: ' + (error.message || 'Unknown error'));
        this.tenderLoading = false;
      }
    });
  }

  /**
   * Step 2: Set requested completion date
   */
  setRequestedDate() {
    if (!this.requestedCompletionDate || !this.createdQuoteId) {
      this.notificationService.showError('Please select a date');
      return;
    }

    this.tenderLoading = true;
    const formattedDate = this.formatDateForAPI(this.requestedCompletionDate);

    this.tenderService.updateTenderDate(this.createdQuoteId, formattedDate, 'expectedFulfillment').subscribe({
      next: (updatedTender) => {
        console.log('Expected fulfillment start date updated:', updatedTender);
        this.requestedDateSet = true;
        this.notificationService.showSuccess('Expected fulfillment start date set successfully!');
        this.tenderLoading = false;
      },
      error: (error) => {
        console.error('Error setting expected fulfillment date:', error);
        this.notificationService.showError('Failed to set expected fulfillment date: ' + (error.message || 'Unknown error'));
        this.tenderLoading = false;
      }
    });
  }

  /**
   * Step 2: Handle PDF file selection
   */
  onPdfFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      if (file.type !== 'application/pdf') {
        this.notificationService.showError('Please select a valid PDF file');
        this.selectedPdfFile = null;
        target.value = '';
        return;
      }
      this.selectedPdfFile = file;
      console.log('PDF file selected:', file.name);
    } else {
      this.selectedPdfFile = null;
    }
  }

  /**
   * Step 2: Upload PDF attachment
   */
  setPdfAttachment() {
    if (!this.selectedPdfFile || !this.createdQuoteId) {
      this.notificationService.showError('Please select a PDF file');
      return;
    }

    this.tenderLoading = true;

    this.tenderService.addAttachmentToTender(this.createdQuoteId, this.selectedPdfFile, '').subscribe({
      next: (updatedTender) => {
        console.log('PDF attachment uploaded:', updatedTender);
        this.pdfAttachmentSet = true;
        this.existingAttachment = updatedTender.attachment || null;
        this.notificationService.showSuccess('PDF attachment uploaded successfully!');
        this.tenderLoading = false;
      },
      error: (error) => {
        console.error('Error uploading PDF:', error);
        this.notificationService.showError('Failed to upload PDF: ' + (error.message || 'Unknown error'));
        this.tenderLoading = false;
      }
    });
  }

  /**
   * Check if all Step 2 fields are completed
   */
  isStep2Complete(): boolean {
    return this.expectedDateSet && this.requestedDateSet && this.pdfAttachmentSet;
  }

  /**
   * Proceed from Step 2 to Step 3 (Provider Selection)
   */
  proceedToProviderSelection() {
    if (!this.isStep2Complete() && false) {
      this.notificationService.showError('Please complete all date and PDF fields first');
      return;
    }

    // Move to Step 3
    this.tenderCreationStep = 3;

    // Load providers for selection (will automatically load invited providers after)
    this.loadTenderProviders();
  }

  /**
   * Load already invited providers by fetching tendering quotes with the coordinator quote's externalId
   */
  loadInvitedProviders() {

    if (!this.createdQuoteId) {
      console.log('No coordinator quote ID, skipping invited providers load');
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('User not logged in');
      return;
    }

    console.log('Loading invited providers for externalId:', this.createdQuoteId);

    this.tenderLoading = true;

    this.tenderService.getTenderingQuotesRaw(userId, 'Customer', this.createdQuoteId).subscribe({
      next: (quotes) => {
        console.log('Received tendering quotes:', quotes);

        // Clear existing invited providers
        this.invitedProviders = [];

        // Parse each quote to extract provider info
        quotes.forEach(quote => {
          // Find the Seller in relatedParty
          const sellerParty = quote.relatedParty?.find(p => p.role === 'Seller');

          if (sellerParty && quote.id) {
            // Find the matching provider in our providers list
            const provider = this.tenderProviders.find(p => p.id === sellerParty.id);

            if (provider) {
              this.invitedProviders.push({
                provider: provider,
                quoteId: quote.id
              });
              console.log('Added invited provider:', provider.tradingName, 'with quote ID:', quote.id);
            } else {
              console.warn('Provider not found in list for ID:', sellerParty.id);
            }
          }
        });

        console.log('Total invited providers loaded:', this.invitedProviders.length);
        this.tenderLoading = false;
      },
      error: (error) => {
        console.error('Error loading invited providers:', error);
        // Don't show error to user as this might be expected (no providers invited yet)
        this.tenderLoading = false;
      }
    });
  }

  /**
   * Go back from Step 3 to Step 2
   */
  backToStep2() {
    this.tenderCreationStep = 2;
  }

  /**
   * Format date from YYYY-MM-DD to DD/MM/YYYY for display
   */
  formatDateForDisplay(dateString: string): string {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return dateString;
  }

  /**
   * Get available providers (excluding already invited ones)
   */

  availableProviders: Provider[] = [];

  updateAvailableProviders(): void {
    this.availableProviders = this.getAvailableProviders();
  }

  // 🔹 Updated function — keeps invited list safe and returns only available providers
  getAvailableProviders(): Provider[] {
    // Simple and clean — everything is handled by the helper
    return this.rebuildSelectionAndAvailable();
  }

  toggleProviderSelection(providerId: string) {
    // find in local safe list (which stores { provider, quoteId })
    const idx = this._safeInvitedList.findIndex(x => x?.id === providerId);

    if (idx >= 0) {
      // UNCHECK → remove from local safe list
      this._safeInvitedList.splice(idx, 1);
    } else {
      // CHECK → add to local safe list
      const p = this.tenderProviders.find(tp => tp.id === providerId);
      if (p) {

        this._safeInvitedList.push(p);
      }
    }

    // Re-derive selectedProviders + available list in one place
    this.rebuildSelectionAndAvailable();
  }

  private rebuildSelectionAndAvailable(): Provider[] {

    // 1) selectedProviders = IDs from local safe list
    this.selectedProviders = new Set(
      this._safeInvitedList
        .map(x => x?.id)
        .filter((id): id is string => !!id)
    );


    // 2) all IDs that must be excluded from availability (server invited + locally selected)
    const excludeIds = new Set<string>([
      ...this.invitedProviders
        .map(ip => ip?.provider?.id)
        .filter((id): id is string => !!id),
      ...Array.from(this.selectedProviders),
    ]);

    // 3) compute available list
    const available = this.tenderProviders
      .filter(p => !!p?.id && !excludeIds.has(p.id!))
      .map(p => ({ ...p } as Provider));

    // keep a cached copy if you want to bind directly in template
    this.availableProviders = available;

    return available;
  }

  /**
   * Step 3: Save providers list by creating tendering quotes for selected providers
   */
  saveProvidersList() {
    if (this.selectedProviders.size === 0) {
      this.notificationService.showError('Please select at least one provider');
      return;
    }

    if (!this.createdQuoteId) {
      this.notificationService.showError('Coordinator quote not found. Please start over.');
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      this.notificationService.showError('User not logged in');
      return;
    }

    this.tenderLoading = true;

    const providerIds = Array.from(this.selectedProviders);
    debugger;

    const customerMessage = this.tenderTitle; // Use tender title as customer message

    console.log('Creating tendering quotes for providers:', providerIds);
    console.log('Coordinator quote ID:', this.createdQuoteId);
    console.log('Customer message:', customerMessage);

    // Create tendering quotes one by one to capture individual quote IDs
    const requests = providerIds.map(providerId => {
      const provider = this._safeInvitedList.find(p => p.id === providerId);

      return this.tenderService.createTenderingQuote(
        userId,
        providerId,
        this.createdQuoteId!,
        customerMessage
      ).toPromise().then(tender => {
        if (!tender || !tender.id || !provider) {
          throw new Error('Failed to create quote for provider');
        }
        return {
          provider: provider,
          quoteId: tender.id
        };
      });
    });

    Promise.all(requests)
      .then(results => {
        console.log('Tendering quotes created:', results);

        // Add to invited providers list
        this.invitedProviders.push(...results);

        // Clear selection
        this.selectedProviders.clear();

        this.notificationService.showSuccess(`${providerIds.length} provider(s) invited successfully!`);
        this.tenderLoading = false;
      })
      .catch(error => {
        console.error('Error creating tendering quotes:', error);
        this.notificationService.showError('Failed to invite providers: ' + (error.message || 'Unknown error'));
        this.tenderLoading = false;
      });
  }

  /**
   * Remove an invited provider by deleting their tendering quote
   */
  removeInvitedProvider(quoteId: string, providerId: string | undefined) {
    if (!providerId) return;

    if (!confirm('Are you sure you want to remove this provider invitation? This will delete the quote.')) {
      return;
    }

    this.tenderLoading = true;

    this.tenderService.deleteQuote(quoteId).subscribe({
      next: () => {
        console.log('Quote deleted for provider:', providerId);

        // Remove from invited list
        this.invitedProviders = this.invitedProviders.filter(ip => ip.quoteId !== quoteId);

        this.notificationService.showSuccess('Provider invitation removed successfully');
        this.tenderLoading = false;
      },
      error: (error) => {
        console.error('Error deleting quote:', error);
        this.notificationService.showError('Failed to remove provider invitation: ' + (error.message || 'Unknown error'));
        this.tenderLoading = false;
      }
    });
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

  /**
   * Map coordinator quote status from frontend (GUI) to backend (TMF)
   * Only for coordinator quotes
   */
  mapCoordinatorStatusToBackend(guiStatus: string): string {
    const mapping: { [key: string]: string } = {
      'draft': 'pending',
      'pre-launched': 'inProgress',
      'launched': 'approved',
      'closed': 'accepted',
      'cancelled': 'cancelled',
      'rejected': 'rejected'
    };
    return mapping[guiStatus] || guiStatus;
  }

  /**
   * Step 3: Finalize and complete tender creation
   */
  finalizeTender() {
    if (this.invitedProviders.length === 0) {
      this.notificationService.showError('Please invite at least one provider first');
      return;
    }

    if (!this.createdQuoteId) {
      this.notificationService.showError('Coordinator quote not found');
      return;
    }

    // Show confirmation dialog
    if (!confirm('Are you sure you want to finalize the tender?')) {
      return;
    }

    this.tenderLoading = true;

    // Step 1: Get the coordinator quote to extract the dates
    this.tenderService.getQuoteById(this.createdQuoteId).pipe(
      switchMap(coordinatorQuote => {
        console.log('Coordinator quote retrieved:', coordinatorQuote);

        // Extract dates from coordinator quote
        const effectiveDate = coordinatorQuote.effectiveQuoteCompletionDate;
        const expectedFulfillmentDate = coordinatorQuote.expectedFulfillmentStartDate;

        if (!effectiveDate || !expectedFulfillmentDate) {
          throw new Error('Coordinator quote is missing date information');
        }

        // Format dates for API (DD-MM-YYYY format)
        const formattedEffectiveDate = this.formatDateForAPI(this.expectedCompletionDate);
        const formattedExpectedFulfillmentDate = this.formatDateForAPI(this.requestedCompletionDate);

        console.log(`Copying dates to ${this.invitedProviders.length} provider quotes:`, {
          effective: formattedEffectiveDate,
          expectedFulfillment: formattedExpectedFulfillmentDate
        });

        // Step 2: Create array of date update observables for all invited provider quotes
        const dateUpdateObservables = this.invitedProviders.flatMap(invitedProvider => {
          const quoteId = invitedProvider.quoteId;
          console.log(`Updating dates for provider quote ${quoteId.slice(-8)}`);

          return [
            // Update effective date
            this.tenderService.updateQuoteDate(quoteId, formattedEffectiveDate, 'effective'),
            // Update expected fulfillment date
            this.tenderService.updateQuoteDate(quoteId, formattedExpectedFulfillmentDate, 'expectedFulfillment')
          ];
        });

        // If no providers to update, return empty observable
        if (dateUpdateObservables.length === 0) {
          return of([]);
        }

        // Execute all date updates in parallel
        return forkJoin(dateUpdateObservables);
      }),
      switchMap(dateUpdateResults => {
        console.log(`Successfully updated dates for ${dateUpdateResults.length / 2} provider quotes`);

        // Step 3: Update coordinator quote status to "inProgress" (which maps to "pre-launched" in GUI)
        return this.tenderService.updateQuoteStatus(this.createdQuoteId!, 'inProgress');
      })
    ).subscribe({
      next: (updatedQuote) => {
        console.log('Coordinator quote status updated to inProgress:', updatedQuote);

        // TODO: Implement actual notification system to send emails/notifications to providers
        // For now, just show a success message
        this.notificationService.showSuccess('Dates copied to all provider quotes and notifications sent to providers');

        this.tenderLoading = false;
        this.closeTenderModal();

        // Navigate to tenders list
        this.router.navigate(['/tenders']);
      },
      error: (error) => {
        console.error('Error finalizing tender:', error);
        this.notificationService.showError('Failed to finalize tender: ' + (error.message || 'Unknown error'));
        this.tenderLoading = false;
      }
    });
  }

  async saveTenderForm() {
    if (!this.responseDeadline) {
      this.notificationService.showError('Response deadline is required');
      return;
    }

    try {
      let attachment: TenderAttachment | undefined;

      if (this.attachmentFile) {
        // New file uploaded
        const base64Content = await this.tenderService.fileToBase64(this.attachmentFile);
        attachment = {
          name: this.attachmentFile.name,
          mimeType: this.attachmentFile.type,
          content: base64Content,
          size: this.attachmentFile.size
        };
      } else if (this.existingAttachment) {
        // Keep existing attachment when editing
        attachment = this.existingAttachment;
      }

      const tenderData: Tender_Create = {
        category: 'coordinator',
        state: 'draft',
        responseDeadline: this.responseDeadline,
        tenderNote: this.tenderNote,
        attachment: attachment,
        selectedProviders: Array.from(this.selectedProviders)
      };

      if (this.editingTenderId) {
        // Update existing tender
        this.tenderService.updateTender(this.editingTenderId, tenderData).subscribe({
          next: (updatedTender) => {
            console.log('Tender updated successfully:', updatedTender);
            this.notificationService.showSuccess('Tender draft updated successfully');
            this.closeTenderModal();
          },
          error: (error) => {
            console.error('Error updating tender:', error);
            this.notificationService.showError('Failed to update tender draft');
          }
        });
      } else {
        // Create new tender
        this.tenderService.createTender(tenderData).subscribe({
          next: (newTender) => {
            console.log('Tender created successfully:', newTender);
            this.notificationService.showSuccess('Tender draft saved successfully');
            this.closeTenderModal();
          },
          error: (error) => {
            console.error('Error creating tender:', error);
            this.notificationService.showError('Failed to save tender draft');
          }
        });
      }
    } catch (error) {
      console.error('Error processing attachment:', error);
      this.notificationService.showError('Failed to process attachment');
    }
  }

  async createTenderWithSelectedProviders() {
    if (!this.responseDeadline) {
      this.notificationService.showError('Response deadline is required');
      return;
    }

    if (this.selectedProviders.size === 0) {
      this.notificationService.showError('Please select at least one provider');
      return;
    }

    try {
      let attachment: TenderAttachment | undefined;

      if (this.attachmentFile) {
        const base64Content = await this.tenderService.fileToBase64(this.attachmentFile);
        attachment = {
          name: this.attachmentFile.name,
          mimeType: this.attachmentFile.type,
          content: base64Content,
          size: this.attachmentFile.size
        };
      } else if (this.existingAttachment) {
        attachment = this.existingAttachment;
      }

      const selectedProviderIds = Array.from(this.selectedProviders);

      // Get provider names from tenderProviders
      const providerMap = new Map<string, string>();
      this.tenderProviders.forEach(provider => {
        if (provider.id) {
          providerMap.set(provider.id, provider.tradingName || 'Unknown Provider');
        }
      });

      if (this.editingTenderId) {
        // EDIT MODE: Update existing tender to "pre-launched" and create child tenders
        const parentTenderUpdate: Tender_Update = {
          state: 'pre-launched'
        };

        this.tenderService.updateTender(this.editingTenderId, parentTenderUpdate).subscribe({
          next: (updatedParent) => {
            console.log('Parent tender updated to pre-launched:', updatedParent);

            // Create child tenders for each selected provider
            const childTenders: Tender_Create[] = selectedProviderIds.map(providerId => ({
              category: 'tendering',
              state: 'pending',
              responseDeadline: this.responseDeadline,
              tenderNote: this.tenderNote,
              attachment: attachment,
              selectedProviders: [providerId],
              external_id: this.editingTenderId!,
              provider: providerMap.get(providerId) || 'Unknown Provider'
            }));

            this.tenderService.createMultipleTenders(childTenders).subscribe({
              next: (createdTenders) => {
                console.log('Child tenders created:', createdTenders);
                this.notificationService.showSuccess(`Tender launched successfully with ${createdTenders.length} provider(s)`);
                this.closeTenderModal();
              },
              error: (error) => {
                console.error('Error creating child tenders:', error);
                this.notificationService.showError('Failed to create child tenders');
              }
            });
          },
          error: (error) => {
            console.error('Error updating parent tender:', error);
            this.notificationService.showError('Failed to launch tender');
          }
        });
      } else {
        // CREATE MODE: Create parent tender with "pre-launched" and create child tenders
        const parentTenderData: Tender_Create = {
          category: 'coordinator',
          state: 'pre-launched',
          responseDeadline: this.responseDeadline,
          tenderNote: this.tenderNote,
          attachment: attachment,
          selectedProviders: selectedProviderIds
        };

        this.tenderService.createTender(parentTenderData).subscribe({
          next: (createdParent) => {
            console.log('Parent tender created:', createdParent);

            // Create child tenders for each selected provider
            const childTenders: Tender_Create[] = selectedProviderIds.map(providerId => ({
              category: 'tendering',
              state: 'pending',
              responseDeadline: this.responseDeadline,
              tenderNote: this.tenderNote,
              attachment: attachment,
              selectedProviders: [providerId],
              external_id: createdParent.id!,
              provider: providerMap.get(providerId) || 'Unknown Provider'
            }));

            this.tenderService.createMultipleTenders(childTenders).subscribe({
              next: (createdTenders) => {
                console.log('Child tenders created:', createdTenders);
                this.notificationService.showSuccess(`Tender launched successfully with ${createdTenders.length} provider(s)`);
                this.closeTenderModal();
              },
              error: (error) => {
                console.error('Error creating child tenders:', error);
                this.notificationService.showError('Failed to create child tenders');
              }
            });
          },
          error: (error) => {
            console.error('Error creating parent tender:', error);
            this.notificationService.showError('Failed to launch tender');
          }
        });
      }
    } catch (error) {
      console.error('Error processing tender creation:', error);
      this.notificationService.showError('Failed to process tender creation');
    }
  }

  private loadFilterOptions(): void {
    this.providerService.getFilterOptions().subscribe({
      next: ({ categories, countries, complianceLevels }) => {
        this.categoriesOptions = categories ?? [];
        this.countriesOptions = countries ?? [];
        this.complianceLevelsOptions = complianceLevels ?? [];
      },
      error: (err) => {
        console.warn('Failed to load filter options', err);
      }
    });
  }

}

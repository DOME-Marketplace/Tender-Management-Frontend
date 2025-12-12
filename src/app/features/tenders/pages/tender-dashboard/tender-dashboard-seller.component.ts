import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenderService } from '../../../../core/services/tender.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginService } from '../../../../core/services/login.service';
import { Tender } from '../../../../shared/models/tender.model';
import { ChatModalComponent } from '../../../../shared/components/chat-modal/chat-modal.component';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';

@Component({
  selector: 'app-tender-dashboard-seller',
  standalone: true,
  imports: [CommonModule, ChatModalComponent, NotificationComponent],
  template: `
    <app-notification></app-notification>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold text-gray-900">Seller Dashboard</h2>
    </div>

    <div *ngIf="loading" class="py-6 text-center text-sm text-gray-500">Loading invitations...</div>
    <div *ngIf="error" class="py-4 text-red-600 text-sm">{{ error }}</div>

    <div *ngIf="!loading && !error">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tender ID</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acceptance Deadline</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offering Deadline</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let tender of tenders">
              <td class="px-4 py-2 text-sm text-gray-900">{{ tender.tenderCode || tender.id }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ tender.tenderName || tender.tenderNote || '(no title)' }}</td>
              <td class="px-4 py-2 text-sm text-gray-700 capitalize">{{ tender.state }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ tender.acceptanceDeadline | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ tender.offeringDeadline | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="px-4 py-2 text-sm text-gray-700 space-x-2">
                <ng-container [ngSwitch]="tender.state">
                  <ng-container *ngSwitchCase="'started'">
                    <button class="px-3 py-1 text-xs rounded border text-green-700 hover:bg-green-50"
                            title="Participate"
                            (click)="participate(tender)">
                      Participate
                    </button>
                    <button class="px-3 py-1 text-xs rounded border text-red-700 hover:bg-red-50"
                            title="Decline"
                            (click)="decline(tender)">
                      Decline
                    </button>
                  </ng-container>
                  <ng-container *ngSwitchCase="'launched'">
                    <button class="px-3 py-1 text-xs rounded border text-indigo-700 hover:bg-indigo-50"
                            title="Download request"
                            (click)="downloadRequest(tender)">
                      Download
                    </button>
                    <label class="px-3 py-1 text-xs rounded border text-purple-700 hover:bg-purple-50 cursor-pointer"
                           title="Upload proposal">
                      Upload
                      <input type="file" class="hidden" (change)="onProposalSelected($event, tender)" />
                    </label>
                    <button class="px-3 py-1 text-xs rounded border text-blue-700 hover:bg-blue-50"
                            title="Chat/communication"
                            (click)="openChat(tender)">
                      Chat/communication
                    </button>
                  </ng-container>
                  <ng-container *ngSwitchDefault>
                    <button class="px-3 py-1 text-xs rounded border text-indigo-700 hover:bg-indigo-50"
                            title="Download request"
                            (click)="downloadRequest(tender)">
                      Download
                    </button>
                    <button class="px-3 py-1 text-xs rounded border text-blue-700 hover:bg-blue-50"
                            title="Chat/communication"
                            (click)="openChat(tender)">
                      Chat/communication
                    </button>
                  </ng-container>
                </ng-container>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <app-chat-modal
      [isOpen]="chatOpen"
      [quoteId]="chatQuoteId"
      (close)="closeChat()"
    ></app-chat-modal>
  `
})
export class TenderDashboardSellerComponent implements OnInit {
  private tenderService = inject(TenderService);
  private authService = inject(AuthService);
  private loginService = inject(LoginService);

  tenders: Tender[] = [];
  loading = false;
  error: string | null = null;
  chatOpen = false;
  chatQuoteId: string | null = null;

  ngOnInit(): void {
    this.loadTenders();
  }

  private loadTenders(): void {
    const userId = this.authService.getUserId() || this.loginService.getUserId();
    if (!userId) {
      this.error = 'User not logged in';
      return;
    }
    this.loading = true;
    this.tenderService.getTenderingQuotesRaw(userId, 'Seller').subscribe({
      next: (quotes) => {
        this.tenders = (quotes || []).map(q => this.tenderService.toTender(q));
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Failed to load invitations';
        this.loading = false;
      }
    });
  }

  participate(tender: Tender) {
    if (!tender.id) return;
    this.tenderService.updateQuoteStatus(tender.id, 'inProgress').subscribe({
      next: () => this.loadTenders(),
      error: (err) => this.error = err?.message || 'Failed to participate'
    });
  }

  decline(tender: Tender) {
    if (!tender.id) return;
    this.tenderService.updateQuoteStatus(tender.id, 'rejected').subscribe({
      next: () => this.loadTenders(),
      error: (err) => this.error = err?.message || 'Failed to decline'
    });
  }

  downloadRequest(tender: Tender) {
    try {
      this.tenderService.downloadAttachment(tender);
    } catch (err: any) {
      this.error = err?.message || 'No attachment found';
    }
  }

  onProposalSelected(event: Event, tender: Tender) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !tender.id) return;
    const file = input.files[0];
    this.tenderService.addAttachmentToQuote(tender.id, file, 'Proposal upload').subscribe({
      next: () => this.loadTenders(),
      error: (err) => this.error = err?.message || 'Failed to upload proposal'
    });
  }

  openChat(tender: Tender) {
    this.chatQuoteId = tender.id || null;
    this.chatOpen = !!this.chatQuoteId;
  }

  closeChat() {
    this.chatOpen = false;
    this.chatQuoteId = null;
  }
}

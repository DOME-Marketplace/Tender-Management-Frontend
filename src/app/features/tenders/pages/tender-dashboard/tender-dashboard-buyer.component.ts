import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TenderService } from '../../../../core/services/tender.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginService } from '../../../../core/services/login.service';
import { Tender } from '../../../../shared/models/tender.model';
import { ChatModalComponent } from '../../../../shared/components/chat-modal/chat-modal.component';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';

@Component({
  selector: 'app-tender-dashboard-buyer',
  standalone: true,
  imports: [CommonModule, RouterLink, ChatModalComponent, NotificationComponent],
  template: `
    <app-notification></app-notification>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold text-gray-900">Buyer Dashboard</h2>
      <a routerLink="/tenders/new"
         class="px-4 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700">
        New Tender
      </a>
    </div>

    <div *ngIf="loading" class="py-6 text-center text-sm text-gray-500">Loading tenders...</div>
    <div *ngIf="error" class="py-4 text-red-600 text-sm">{{ error }}</div>

    <div *ngIf="!loading && !error">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tender ID</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creation Date</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acceptance Deadline</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offering Deadline</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let tender of tenders">
              <td class="px-4 py-2 text-sm text-gray-900">{{ tender.tenderCode || tender.id }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ tender.tenderName || tender.tenderNote || '(no title)' }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ tender.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ tender.acceptanceDeadline | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ tender.offeringDeadline | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="px-4 py-2 text-sm text-gray-700 capitalize">{{ tender.state }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">
                {{ tender.participantsSummary?.invited || 0 }}
                ({{ tender.participantsSummary?.accepted || 0 }}/{{ tender.participantsSummary?.rejected || 0 }})
              </td>
              <td class="px-4 py-2 text-sm text-gray-700 space-x-2">
                <button class="px-3 py-1 text-xs rounded border text-gray-700 hover:bg-gray-50"
                        title="Tender details"
                        (click)="openDetails(tender)">
                  Tender details
                </button>
                <button class="px-3 py-1 text-xs rounded border text-indigo-700 hover:bg-indigo-50"
                        title="Status management"
                        (click)="openStatus(tender)">
                  Status management
                </button>
                <button class="px-3 py-1 text-xs rounded border text-blue-700 hover:bg-blue-50"
                        title="Chat/communications"
                        (click)="openChat(tender)">
                  Chat/communications
                </button>
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
export class TenderDashboardBuyerComponent implements OnInit {
  private tenderService = inject(TenderService);
  private authService = inject(AuthService);
  private loginService = inject(LoginService);
  private router = inject(Router);

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
    this.tenderService.getCoordinatorTendersByUser(userId).subscribe({
      next: (tenders) => {
        this.tenders = tenders || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Failed to load tenders';
        this.loading = false;
      }
    });
  }

  openDetails(tender: Tender) {
    this.router.navigate(['/tenders/new'], { state: { tender } });
  }

  openStatus(tender: Tender) {
    if (!tender.id) return;
    this.router.navigate(['/tenders', tender.id, 'status']);
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

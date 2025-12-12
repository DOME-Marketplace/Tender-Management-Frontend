import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TenderService } from '../../../../core/services/tender.service';
import { ProviderService, Provider } from '../../../../core/services/provider.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginService } from '../../../../core/services/login.service';
import { Tender, TenderAttachment } from '../../../../shared/models/tender.model';
import { TenderFilters } from '../../../../shared/models/tender-filters.model';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';

@Component({
  selector: 'app-new-tender',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationComponent],
  template: `
    <app-notification></app-notification>
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-900">New Tender</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="block text-sm">
          <span class="text-gray-700">Tender Name</span>
          <input [(ngModel)]="tenderName" name="tenderName" class="mt-1 block w-full border rounded px-3 py-2" placeholder="Enter tender name" />
        </label>
        <label class="block text-sm">
          <span class="text-gray-700">Tender Note</span>
          <input [(ngModel)]="tenderNote" name="tenderNote" class="mt-1 block w-full border rounded px-3 py-2" placeholder="Description" />
        </label>
        <label class="block text-sm">
          <span class="text-gray-700">Acceptance Deadline</span>
          <input [(ngModel)]="acceptanceDeadline" name="acceptanceDeadline" type="datetime-local" class="mt-1 block w-full border rounded px-3 py-2" />
        </label>
        <label class="block text-sm">
          <span class="text-gray-700">Offering Deadline</span>
          <input [(ngModel)]="offeringDeadline" name="offeringDeadline" type="datetime-local" class="mt-1 block w-full border rounded px-3 py-2" />
        </label>
        <label class="block text-sm md:col-span-2">
          <span class="text-gray-700">Attachment (PDF)</span>
          <input type="file" accept=".pdf" (change)="onFileSelected($event)" class="mt-1 block w-full" />
        </label>
      </div>

      <div class="p-4 border rounded">
        <h3 class="text-md font-semibold mb-2">Add / Remove Providers</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input class="border rounded px-3 py-2" placeholder="Name" [(ngModel)]="filters.name" name="name" />
          <input class="border rounded px-3 py-2" placeholder="Service Type" [(ngModel)]="filters.serviceType" name="serviceType" />
          <input class="border rounded px-3 py-2" placeholder="Market" [(ngModel)]="filters.market" name="market" />
          <input class="border rounded px-3 py-2" placeholder="Solution Category" [(ngModel)]="filters.solutionCategory" name="solutionCategory" />
          <input class="border rounded px-3 py-2" placeholder="Country" [(ngModel)]="filters.country" name="country" />
          <input class="border rounded px-3 py-2" placeholder="Certifications (comma separated)" [(ngModel)]="certificationsText" name="certifications" />
        </div>
        <div class="flex space-x-2 mb-3">
          <button class="px-3 py-2 rounded bg-gray-200 text-sm" (click)="searchProviders()">Search</button>
          <button class="px-3 py-2 rounded bg-gray-200 text-sm" (click)="clearFilters()">Clear</button>
        </div>

        <div *ngIf="providerResults.length > 0" class="mb-3">
          <p class="text-sm text-gray-600 mb-2">Results (first {{ providerResults.length }})</p>
          <div class="space-y-2">
            <label *ngFor="let p of providerResults" class="flex items-center space-x-2">
              <input type="checkbox" [checked]="isSelected(p.id)" (change)="toggleProvider(p)" />
              <span class="text-sm">{{ p.tradingName || p.externalReference?.[0]?.name || p.id }}</span>
            </label>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold mb-1">Selected providers ({{ selectedProviders.length }})</h4>
          <ul class="list-disc list-inside text-sm">
            <li *ngFor="let p of selectedProviders">
              {{ p.tradingName || p.externalReference?.[0]?.name || p.id }}
              <button class="ml-2 text-red-600 text-xs" (click)="removeProvider(p.id)">Remove</button>
            </li>
          </ul>
        </div>
      </div>

      <div class="flex space-x-2">
        <button class="px-4 py-2 rounded bg-gray-200" (click)="goBack()">Back</button>
        <button class="px-4 py-2 rounded bg-indigo-600 text-white" (click)="saveTender()" [disabled]="saving">Save</button>
      </div>
      <div *ngIf="error" class="text-sm text-red-600">{{ error }}</div>
      <div *ngIf="success" class="text-sm text-green-600">{{ success }}</div>
    </div>
  `
})
export class NewTenderComponent implements OnInit {
  private tenderService = inject(TenderService);
  private providerService = inject(ProviderService);
  private authService = inject(AuthService);
  private loginService = inject(LoginService);
  private router = inject(Router);

  tenderName = '';
  tenderNote = '';
  acceptanceDeadline = '';
  offeringDeadline = '';
  filters: TenderFilters = {};
  certificationsText = '';
  providerResults: Provider[] = [];
  selectedProviders: Provider[] = [];
  attachmentFile: File | null = null;
  saving = false;
  error: string | null = null;
  success: string | null = null;
  editingTender: Tender | null = null;

  ngOnInit(): void {
    const nav = history.state as any;
    if (nav?.tender) {
      this.loadTender(nav.tender as Tender);
    }
  }

  private loadTender(tender: Tender) {
    this.editingTender = tender;
    this.tenderName = tender.tenderName || tender.tenderNote || '';
    this.tenderNote = tender.tenderNote || '';
    this.acceptanceDeadline = this.toInputDate(tender.acceptanceDeadline);
    this.offeringDeadline = this.toInputDate(tender.offeringDeadline);
  }

  private toInputDate(date?: string): string {
    if (!date) return '';
    // Expecting ISO; trim for datetime-local
    return date.slice(0, 16);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.attachmentFile = input.files[0];
    }
  }

  searchProviders() {
    const filters: TenderFilters = {
      ...this.filters,
      certifications: this.certificationsText ? this.certificationsText.split(',').map(c => c.trim()).filter(Boolean) : undefined
    };
    this.providerService.searchProvidersWithTenderFilters(filters).subscribe({
      next: (providers) => {
        this.providerResults = providers.slice(0, 5);
      },
      error: () => {
        this.error = 'Failed to load providers';
      }
    });
  }

  clearFilters() {
    this.filters = {};
    this.certificationsText = '';
    this.providerResults = [];
  }

  toggleProvider(provider: Provider) {
    if (!provider.id) return;
    if (this.isSelected(provider.id)) {
      this.removeProvider(provider.id);
      return;
    }
    this.selectedProviders.push(provider);
  }

  removeProvider(id?: string) {
    if (!id) return;
    this.selectedProviders = this.selectedProviders.filter(p => p.id !== id);
  }

  isSelected(id?: string): boolean {
    if (!id) return false;
    return this.selectedProviders.some(p => p.id === id);
  }

  async saveTender() {
    this.error = null;
    this.success = null;
    this.saving = true;

    const userId = this.authService.getUserId() || this.loginService.getUserId();
    if (!userId) {
      this.error = 'User not logged in';
      this.saving = false;
      return;
    }

    try {
      const tender = await this.tenderService.createCoordinatorTender(userId, this.tenderName || this.tenderNote || 'New tender').toPromise();

      if (!tender?.id) {
        this.error = 'Failed to create tender';
        this.saving = false;
        return;
      }

      // Deadlines
      if (this.acceptanceDeadline) {
        await this.tenderService.updateQuoteDate(tender.id, this.acceptanceDeadline, 'expectedFulfillment').toPromise();
      }
      if (this.offeringDeadline) {
        await this.tenderService.updateQuoteDate(tender.id, this.offeringDeadline, 'effective').toPromise();
      }

      // Attachment
      if (this.attachmentFile) {
        await this.tenderService.addAttachmentToTender(tender.id, this.attachmentFile, 'Tender request').toPromise();
      }

      // Invite providers
      for (const provider of this.selectedProviders) {
        if (!provider.id) continue;
        await this.tenderService.createTenderingQuote(userId, provider.id, tender.id, this.tenderName || this.tenderNote).toPromise();
      }

      this.success = 'Tender saved and providers invited';
      this.saving = false;
    } catch (err: any) {
      this.error = err?.message || 'Failed to save tender';
      this.saving = false;
    }
  }

  goBack() {
    this.router.navigate(['/tenders/buyer']);
  }
}

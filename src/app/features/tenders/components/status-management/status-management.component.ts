import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TenderService } from '../../../../core/services/tender.service';
import { Tender } from '../../../../shared/models/tender.model';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';

@Component({
  selector: 'app-tender-status-management',
  standalone: true,
  imports: [CommonModule, NotificationComponent],
  template: `
    <app-notification></app-notification>
    <div *ngIf="loading" class="py-6 text-center text-sm text-gray-500">Loading tender...</div>
    <div *ngIf="error" class="py-4 text-red-600 text-sm">{{ error }}</div>

    <div *ngIf="tender && !loading" class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-900">Status management for {{ tender.tenderName || tender.tenderNote || tender.id }}</h2>
      <div class="p-4 border rounded bg-gray-50">
        <p class="text-sm text-gray-700">Current status: <strong class="capitalize">{{ tender.state }}</strong></p>
        <p class="text-sm text-gray-700">Acceptance deadline: {{ tender.acceptanceDeadline | date:'dd/MM/yyyy HH:mm' }}</p>
        <p class="text-sm text-gray-700">Offering deadline: {{ tender.offeringDeadline | date:'dd/MM/yyyy HH:mm' }}</p>
      </div>

      <div class="space-x-2">
        <button class="px-4 py-2 rounded text-sm border text-indigo-700 hover:bg-indigo-50"
                [disabled]="!canMoveTo('started')"
                title="Move from Draft to Started"
                (click)="updateStatus('started')">
          Move to Started
        </button>
        <button class="px-4 py-2 rounded text-sm border text-green-700 hover:bg-green-50"
                [disabled]="!canMoveTo('launched')"
                title="Move from Started to Launched"
                (click)="updateStatus('launched')">
          Move to Launched
        </button>
      </div>
    </div>
  `
})
export class StatusManagementComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tenderService = inject(TenderService);
  private router = inject(Router);

  tender: Tender | null = null;
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid tender id';
      return;
    }
    this.loading = true;
    this.tenderService.getTenderById(id).subscribe({
      next: (tender) => {
        this.tender = tender;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Failed to load tender';
        this.loading = false;
      }
    });
  }

  canMoveTo(target: 'started' | 'launched'): boolean {
    if (!this.tender) return false;
    if (target === 'started') return this.tender.state === 'draft';
    if (target === 'launched') return this.tender.state === 'started';
    return false;
  }

  updateStatus(target: 'started' | 'launched') {
    if (!this.tender?.id) return;
    this.loading = true;
    this.tenderService.updateTenderStatus(this.tender.id, target).subscribe({
      next: (updated) => {
        this.tender = updated;
        this.loading = false;
        // After moving to launched, optionally go back
        if (target === 'launched') {
          this.router.navigate(['/tenders/buyer']);
        }
      },
      error: (err) => {
        this.error = err?.message || 'Failed to update status';
        this.loading = false;
      }
    });
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-tender-management',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  template: `
    <div class="bg-white shadow rounded-lg p-4">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-semibold text-gray-900">Tender Management</h1>
        <div class="flex space-x-2">
          <a routerLink="buyer"
             routerLinkActive="font-semibold text-indigo-600"
             [routerLinkActiveOptions]="{ exact: true }"
             class="px-3 py-2 rounded border border-gray-200 text-sm hover:bg-gray-50">
            Buyer Dashboard
          </a>
          <a routerLink="seller"
             routerLinkActive="font-semibold text-indigo-600"
             [routerLinkActiveOptions]="{ exact: true }"
             class="px-3 py-2 rounded border border-gray-200 text-sm hover:bg-gray-50">
            Seller Dashboard
          </a>
          <a routerLink="new"
             routerLinkActive="font-semibold text-indigo-600"
             [routerLinkActiveOptions]="{ exact: true }"
             class="px-3 py-2 rounded border border-gray-200 text-sm hover:bg-gray-50">
            New Tender
          </a>
        </div>
      </div>
      <router-outlet></router-outlet>
    </div>
  `
})
export class TenderManagementComponent { }

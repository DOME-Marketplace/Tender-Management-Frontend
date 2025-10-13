import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../../../core/services/login.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      <div class="max-w-md w-full mx-4">
        <!-- Logo/Title Section -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">Tender Management</h1>
          <p class="text-gray-600">Login to access the system</p>
        </div>

        <!-- Login Form -->
        <form (ngSubmit)="onLogin()" class="bg-white rounded-lg shadow-xl p-8">
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">User ID</label>
            <input 
              [(ngModel)]="userId" 
              name="userId" 
              type="text"
              required 
              placeholder="Enter your user ID"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
            />
          </div>

          <!-- Quick Select Users -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p class="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Quick Login (For Testing)</p>
            
            <div class="space-y-3">
              <!-- Customer Option -->
              <div class="bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:border-indigo-300 transition-colors">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-semibold text-indigo-600 uppercase">Customer</span>
                  <button 
                    type="button"
                    (click)="quickLogin('customer')"
                    class="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                  >
                    Use This
                  </button>
                </div>
                <p class="text-xs text-gray-600 font-mono break-all">
                  urn:ngsi-ld:individual:ab450747...
                </p>
              </div>

              <!-- Provider Option -->
              <div class="bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:border-green-300 transition-colors">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-semibold text-green-600 uppercase">Provider</span>
                  <button 
                    type="button"
                    (click)="quickLogin('provider')"
                    class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Use This
                  </button>
                </div>
                <p class="text-xs text-gray-600 font-mono break-all">
                  urn:ngsi-ld:organization:38817de3...
                </p>
              </div>
            </div>
          </div>

          <!-- Login Button -->
          <button 
            type="submit" 
            [disabled]="!userId.trim()"
            class="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Login
          </button>

          <!-- Info Notice -->
          <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div class="flex">
              <svg class="h-5 w-5 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-xs text-yellow-800">
                <strong>Testing Mode:</strong> This is a fake login for development. No password required.
              </p>
            </div>
          </div>
        </form>

        <!-- Footer -->
        <p class="text-center text-sm text-gray-600 mt-6">
          Tender Management System v1.0
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  userId = '';
  private router = inject(Router);
  private loginService = inject(LoginService);
  private authService = inject(AuthService);

  private readonly CUSTOMER_ID = 'urn:ngsi-ld:individual:ab450747-7204-448b-8a8c-77b88f46e81f';
  private readonly PROVIDER_ID = 'urn:ngsi-ld:organization:38817de3-8c3e-4141-a344-86ffd915cc3b';

  selectUserId(id: string) {
    this.userId = id;
  }

  quickLogin(userType: 'customer' | 'provider') {
    const id = userType === 'customer' ? this.CUSTOMER_ID : this.PROVIDER_ID;
    this.userId = id;
    this.onLogin();
  }

  onLogin() {
    if (this.userId.trim()) {
      // Set in both services for compatibility
      this.loginService.setUserId(this.userId.trim());
      this.authService.fakeLogin(this.userId.trim()).subscribe(() => {
        this.router.navigate(['/providers']);
      });
    }
  }
} 
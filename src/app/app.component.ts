import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { AuthService } from './core/services/auth.service';
import { LoginService } from './core/services/login.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NotificationComponent],
  template: `
    <app-notification></app-notification>
    <div class="min-h-screen bg-gray-100">
      <!-- Navigation -->
      <nav *ngIf="isLoggedIn()" class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <div class="flex-shrink-0 flex items-center">
                <span class="text-xl font-bold text-indigo-600">Tender Management</span>
              </div>
              <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a
                  routerLink="/providers"
                  routerLinkActive="border-indigo-500 text-gray-900"
                  [routerLinkActiveOptions]="{exact: false}"
                  class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Providers
                </a>
                <a
                  routerLink="/tenders"
                  routerLinkActive="border-indigo-500 text-gray-900"
                  [routerLinkActiveOptions]="{exact: false}"
                  class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Tenders
                </a>
              </div>
            </div>
            
            <!-- User Info & Logout -->
            <div class="flex items-center space-x-4 relative">
              <div class="text-sm text-gray-600">
                <span class="font-medium">User:</span>
                <span class="ml-1 font-mono text-xs">{{ getUserIdShort() }}</span>
              </div>
              <div class="relative">
                <button
                  (click)="toggleUserMenu()"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none"
                  title="Open user menu"
                >
                  ☰
                </button>
                <div *ngIf="userMenuOpen" class="absolute right-0 mt-2 w-48 bg-white shadow rounded border border-gray-200 z-20">
                  <a routerLink="/tenders" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Tender management</a>
                  <button
                    (click)="logout()"
                    class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main [class.py-10]="isLoggedIn()" [class.py-0]="!isLoggedIn()">
        <div [class]="isLoggedIn() ? 'max-w-7xl mx-auto sm:px-6 lg:px-8' : ''">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class AppComponent {
  title = 'Tender Management';
  private authService = inject(AuthService);
  private loginService = inject(LoginService);
  private router = inject(Router);
  userMenuOpen = false;

  isLoggedIn(): boolean {
    return this.loginService.isLoggedIn() || !!this.authService.getUserId();
  }

  getUserIdShort(): string {
    const userId = this.authService.getUserId() || this.loginService.getUserId();
    if (!userId) return '';
    
    // Show last 8 characters for URN IDs
    if (userId.length > 20) {
      return '...' + userId.slice(-8);
    }
    return userId;
  }

  logout(): void {
    this.authService.logout();
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }
}

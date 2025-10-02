import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../../../core/services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen">
      <h2 class="text-2xl font-bold mb-4">Login</h2>
      <form (ngSubmit)="onLogin()" class="w-80 p-6 bg-white rounded shadow">
        <label class="block mb-2 font-medium">User ID</label>
        <input [(ngModel)]="userId" name="userId" required class="w-full p-2 border rounded mb-4" />
        <div class="text-center mb-4">
          <p class="text-sm text-gray-600 mb-2">Click to use:</p>
          <p class="text-sm mb-2">
            <span class="font-medium">Customer ID:</span> 
            <button 
              type="button"
              (click)="selectUserId('urn:ngsi-ld:individual:ab450747-7204-448b-8a8c-77b88f46e81f')"
              class="text-blue-600 hover:text-blue-800 underline cursor-pointer ml-1"
              title="Click to use this ID"
            >
              urn:ngsi-ld:individual:ab450747-7204-448b-8a8c-77b88f46e81f
            </button>
          </p>
          <p class="text-sm">
            <span class="font-medium">Provider ID:</span> 
            <button 
              type="button"
              (click)="selectUserId('urn:ngsi-ld:organization:38817de3-8c3e-4141-a344-86ffd915cc3b')"
              class="text-blue-600 hover:text-blue-800 underline cursor-pointer ml-1"
              title="Click to use this ID"
            >
              urn:ngsi-ld:organization:38817de3-8c3e-4141-a344-86ffd915cc3b
            </button>
          </p>
        </div>
            
        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
      </form>
    </div>
  `
})
export class LoginComponent {
  userId = '';
  private router = inject(Router);
  private loginService = inject(LoginService);

  selectUserId(id: string) {
    this.userId = id;
  }

  onLogin() {
    if (this.userId.trim()) {
      this.loginService.setUserId(this.userId.trim());
      this.router.navigate(['/products']);
    }
  }
} 
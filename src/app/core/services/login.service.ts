import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly USER_KEY = 'userId';

  setUserId(userId: string): void {
    sessionStorage.setItem(this.USER_KEY, userId);
  }

  getUserId(): string | null {
    return sessionStorage.getItem(this.USER_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getUserId();
  }

  logout(): void {
    sessionStorage.removeItem(this.USER_KEY);
  }
} 
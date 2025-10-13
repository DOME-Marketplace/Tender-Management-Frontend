import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_ID_KEY = 'user_id';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  /**
   * Real API login (when backend implements authentication)
   */
  login(username: string, password: string): Observable<{ token: string; userId: string }> {
    return this.http.post<{ token: string; userId: string }>(`${environment.apiUrl}/auth/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_ID_KEY, response.userId);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  /**
   * Fake login for testing (no backend authentication required)
   * Use this while backend has no auth
   */
  fakeLogin(userId: string): Observable<{ token: string; userId: string }> {
    const fakeToken = 'fake-jwt-token-' + Date.now();
    const response = { token: fakeToken, userId: userId };
    
    localStorage.setItem(this.TOKEN_KEY, fakeToken);
    localStorage.setItem(this.USER_ID_KEY, userId);
    sessionStorage.setItem('userId', userId); // For compatibility with LoginService
    this.isAuthenticatedSubject.next(true);
    
    return of(response);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    sessionStorage.removeItem('userId'); // Clear LoginService userId too
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserId(): string | null {
    // Check localStorage first (AuthService), then sessionStorage (LoginService)
    return localStorage.getItem(this.USER_ID_KEY) || sessionStorage.getItem('userId');
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  private hasToken(): boolean {
    // Check if user is logged in via either service
    return !!this.getToken() || !!sessionStorage.getItem('userId');
  }
} 
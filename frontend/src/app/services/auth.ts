import { inject, Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { catchError, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StorageService } from './storage';
interface AuthResponse {
  token: string;
  user: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);

  private apiUri = `${environment.apiUrl}/api/users`;

  constructor(
    private router: Router,
    private storageService: StorageService,
  ) {}

  login(payload: {
    email: string;
    password: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUri}/login`, payload).pipe(
      tap((res) => this.setSession(res)),
      catchError((err) => {
        console.error('Login Failed:', err);
        throw err;
      }),
    );
  }

  signup(payload: {
    name: string;
    email: string;
    password: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUri}/signup`, payload).pipe(
      tap((res) => this.setSession(res)),
      catchError((err) => {
        console.error('Signup Failed:', err);
        throw err;
      }),
    );
  }

  private setSession(authResult: AuthResponse): void {
    this.storageService.saveSession(authResult.token, authResult.user);
  }

  getUser() {
    return this.storageService.getUser();
  }

  getToken() {
    return this.storageService.getToken();
  }

  isLoggedIn() {
    return this.storageService.isLoggedIn();
  }

  logout(): void {
    this.storageService.logout();
    this.router.navigate(['/']);
  }
}

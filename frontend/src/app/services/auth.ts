import { inject, Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { catchError, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
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
  constructor(private router: Router) {}

  login(payload: {
    email: string;
    password: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUri}/login`, payload).pipe(
      tap((res) => this.setSession(res)),
      catchError((err) => {
        console.error('Login Failed : ', err);
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
        console.error('Signup Failed : ', err);
        throw err;
      }),
    );
  }

  private setSession(authResult: AuthResponse) {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('user', JSON.stringify(authResult.user));
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    this.router.navigate(['/']);
  }
}

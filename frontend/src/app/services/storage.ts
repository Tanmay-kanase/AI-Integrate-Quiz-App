import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // Store this in environment.ts
  private readonly SECRET_KEY = 'AI_QUIZ_BY_TANMAY';

  private encrypt(data: any): string {
    return CryptoJS.AES.encrypt(
      JSON.stringify(data),
      this.SECRET_KEY,
    ).toString();
  }

  private decrypt(data: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(data, this.SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      return decrypted ? JSON.parse(decrypted) : null;
    } catch {
      return null;
    }
  }

  setItem(key: string, value: any): void {
    if (!this.isBrowser) return;
    localStorage.setItem(key, this.encrypt(value));
  }

  getItem<T>(key: string): T | null {
    if (!this.isBrowser) return null;

    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    return this.decrypt(encrypted);
  }

  removeItem(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
  }

  clear(): void {
    if (!this.isBrowser) return;
    localStorage.clear();
  }

  // =========================
  // Session Helpers
  // =========================

  saveSession(token: string, user: any): void {
    this.setItem('token', token);
    this.setItem('user', user);
  }

  getToken(): string | null {
    return this.getItem<string>('token');
  }

  getUser(): any {
    return this.getItem<any>('user');
  }

  getUserId(): string | null {
    return this.getUser()?._id ?? null;
  }

  getEmail(): string | null {
    return this.getUser()?.email ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.removeItem('token');
    this.removeItem('user');
  }
}
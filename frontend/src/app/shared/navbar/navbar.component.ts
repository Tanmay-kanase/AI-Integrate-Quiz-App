import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isDarkMode = false;
  isSticky = false;
  isLoggedIn = false;
  isMenuOpen = false;
  user: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') this.enableDarkMode();

    this.user = this.authService.getUser();
    this.isLoggedIn = !!this.user;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isSticky = window.scrollY > 100;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleDarkMode(): void {
    this.isDarkMode ? this.disableDarkMode() : this.enableDarkMode();
  }

  enableDarkMode(): void {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    this.isDarkMode = true;
  }

  disableDarkMode(): void {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    this.isDarkMode = false;
  }

  logout(): void {
    this.authService.logout();
    this.isMenuOpen = false;
  }
}

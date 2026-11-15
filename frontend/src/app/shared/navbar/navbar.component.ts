import {
  ElementRef,
  ViewChild,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isDarkMode = false;
  isSticky = false;
  isLoggedIn = false;
  isMenuOpen = false;
  user: any = null;
  isProfileMenuOpen = false;
  private routeSub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.syncAuthState();
    this.onWindowScroll();

    // The navbar lives outside <router-outlet>, so it isn't recreated on
    // navigation. Re-read the user after every route change so it updates
    // right after sign in / sign out.
    this.routeSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.syncAuthState();
        this.isMenuOpen = false;
      });
  }

  // Profile dropdown reference
  @ViewChild('profileDropdown')
  profileDropdown!: ElementRef<HTMLElement>;

  // Toggle profile dropdown
  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  // Close profile dropdown
  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isSticky = window.scrollY > 100;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (
      this.profileDropdown &&
      !this.profileDropdown.nativeElement.contains(event.target as Node)
    ) {
      this.closeProfileMenu();
    }
  }

  // Close menus using Escape key
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.isProfileMenuOpen = false;
    this.isMenuOpen = false;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
    this.syncAuthState();
    this.router.navigate(['/signin']);
  }

  private syncAuthState(): void {
    this.user = this.authService.getUser();
    this.isLoggedIn = !!this.user;
  }
}

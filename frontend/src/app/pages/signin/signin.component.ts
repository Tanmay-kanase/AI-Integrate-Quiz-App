// src/app/pages/signin/signin.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf, if needed
import { FormsModule } from '@angular/forms'; // For [(ngModel)]
import { Router, RouterLink } from '@angular/router'; // For navigation and routerLink
import { AuthService } from '../../services/auth';
@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink, // Essential for the 'Sign Up' link to work correctly
  ],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'], // Or .css
})
export class SigninComponent implements OnInit {
  email = '';
  password = '';
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {} // Inject Router for navigation and HttpClient

  ngOnInit(): void {
    // Initialization logic if needed
  }

  /**
   * Handles the form submission for email/password sign-in.
   * In a real application, this would call an authentication service.
   */
  onSubmit(): void {
    if (!this.email || !this.password) {
      this.message = '❌ Please enter both email and password.';
      this.messageType = 'error';
      return;
    }

    this.authService
      .login({ email: this.email, password: this.password })
      .subscribe({
        next: () => {
          this.message = 'Signin Successfull';
          this.messageType = 'success';
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.message = err.error?.message || 'Invalid Email and Password !!';
          this.messageType = 'error';
        },
      });
  }

  /**
   * Handles the "Sign in with Google" button click.
   * In a real application, this would initiate a Google OAuth flow.
   */
  signInWithGoogle(): void {
    console.log('Attempting to sign in with Google...');
    // TODO: Implement Google authentication logic here (e.g., Firebase Auth, OAuth)
    // On success:
    // this.router.navigate(['/dashboard']); // Navigate to a dashboard or home page
  }
}

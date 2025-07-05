// src/app/pages/signin/signin.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf, if needed
import { FormsModule } from '@angular/forms'; // For [(ngModel)]
import { Router, RouterLink } from '@angular/router'; // For navigation and routerLink

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

  constructor(private router: Router) {} // Inject Router for navigation

  ngOnInit(): void {
    // Initialization logic if needed
  }

  /**
   * Handles the form submission for email/password sign-in.
   * In a real application, this would call an authentication service.
   */
  onSubmit(): void {
    if (!this.email || !this.password) {
      console.warn('Please enter both email and password.');
      // You'd typically show an error message on the UI
      return;
    }
    console.log('Attempting to sign in with email:', this.email);
    console.log('Password:', this.password);
    // TODO: Implement actual authentication logic here (e.g., call an AuthService)
    // On success:
    // this.router.navigate(['/dashboard']); // Navigate to a dashboard or home page
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

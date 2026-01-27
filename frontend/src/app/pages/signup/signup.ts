import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss'],
})
export class Signup {
  http = inject(HttpClient);
  confirmPassword: string = '';

  formData = {
    name: '',
    email: '',
    password: '',
    profile_image: null as File | null,
  };

  message: string = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.formData.profile_image = file;
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = ''; // fallback image
  }

  onSubmit(): void {
    const payload = {
      name: this.formData.name,
      email: this.formData.email,
      password: this.formData.password,
    };

    this.authService
      .signup({
        name: this.formData.name,
        email: this.formData.email,
        password: this.formData.password,
      })
      .subscribe({
        next: () => {
          this.message = '🎉 Sign up successful!';
          this.messageType = 'success';
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.message = err.error?.message || '❌ Registration failed.';
          this.messageType = 'error';
        },
      });
  }
}

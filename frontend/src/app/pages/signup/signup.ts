import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environment/environment'; // Adjust path if needed
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss'],
})
export class Signup {
  confirmPassword: string = '';

  formData = {
    name: '',
    email: '',
    password: '',
    profile_image: null as File | null,
  };

  message: string = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private http: HttpClient, private router: Router) {}

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.formData.profile_image = file;
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/default-image.png'; // fallback image
  }

  onSubmit(): void {
    const payload = {
      name: this.formData.name,
      email: this.formData.email,
      password: this.formData.password,
    };

    const apiUrl = `${environment.apiUrl}/api/users/register`;

    this.http.post<{ token: string; user: any }>(apiUrl, payload).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));

        this.message = '🎉 Sign up successful!';
        this.messageType = 'success';

        // ✅ Redirect to home after 1 second
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      },
      error: (err) => {
        this.message = err.error?.message || '❌ Registration failed.';
        this.messageType = 'error';
      },
    });
  }
}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-signup',
  imports: [FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  onSubmit(): void {
    if (this.password !== this.confirmPassword) {
      alert('❌ Passwords do not match.');
      return;
    }

    // Simulated signup logic (replace with real API call)
    console.log('✅ Signup submitted:', {
      email: this.email,
      password: this.password,
    });

    alert('🎉 Sign up successful!');
  }
}

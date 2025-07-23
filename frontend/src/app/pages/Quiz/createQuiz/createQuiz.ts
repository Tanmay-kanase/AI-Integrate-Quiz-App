// createQuiz.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule, // ✅ Import this!
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
@Component({
  selector: 'app-create-quiz',
  templateUrl: './createQuiz.html',
  standalone: true,
  styleUrls: ['./createQuiz.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule, // ✅ REQUIRED for [formGroup] and formControlName
    HttpClientModule, // ✅ Needed for HttpClient to work in standalone
    RouterModule, // ✅ Only if you're using routerLink or Router features
  ],
})
export class CreateQuizComponent implements OnInit {
  quizForm!: FormGroup; // Declare quizForm as a FormGroup
  isLoading: boolean = false; // To manage loading state for the button
  successMessage: string = ''; // To display success messages
  errorMessage: string = ''; // To display error messages

  // Inject FormBuilder, HttpClient, and Router
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize the form group with controls and validators
    this.quizForm = this.fb.group({
      title: ['', Validators.required], // Title is required
      description: [''], // Description is optional
      category: [''], // Category is optional
      time: [null, [Validators.min(1)]], // Time is optional, but if entered, must be at least 1
      totalQuestions: [null, [Validators.required, Validators.min(1)]], // Total questions is required and must be at least 1
    });
  }

  /**
   * Handles the form submission.
   * Sends a POST request to the backend API to create a new quiz.
   */
  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.quizForm.valid) {
      this.isLoading = true;
      const quizData = this.quizForm.value;

      for (const key in quizData) {
        if (quizData.hasOwnProperty(key) && quizData[key] === '') {
          delete quizData[key];
        }
      }

      const token = localStorage.getItem('token');

      if (!token) {
        this.isLoading = false;
        this.errorMessage = 'Authentication token is missing.';
        return;
      }

      interface DecodedToken {
        userId: string;
        email: string;
        name?: string;
        exp: number;
        iat: number;
      }

      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const createdBy = decoded.userId;

        if (!createdBy) {
          this.isLoading = false;
          this.errorMessage = 'User ID not found in token.';
          return;
        }

        const payload = {
          ...quizData,
          createdBy,
        };

        this.http
          .post('http://localhost:3000/api/topics', payload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .subscribe({
            next: (response: any) => {
              this.isLoading = false;
              this.successMessage = 'Quiz created successfully!';
              this.quizForm.reset();

              const totalQuestions = payload.totalQuestions;
              const quizTopicId = response._id;

              console.log(totalQuestions, quizTopicId);
              // ✅ Navigate to add-questions route
              this.router.navigate(['/add-questions'], {
                queryParams: {
                  totalQuestions,
                  quizTopicId,
                },
              });
            },
            error: (error: any) => {
              this.isLoading = false;
              this.errorMessage =
                error.error?.message ||
                'Failed to create quiz. Please try again.';
              console.error('Error creating quiz:', error);
            },
          });
      } catch (error) {
        this.isLoading = false;
        this.errorMessage = 'Invalid token.';
        console.error('Token decoding error:', error);
      }
    } else {
      this.quizForm.markAllAsTouched();
      this.errorMessage = 'Please correct the errors in the form.';
    }
  }
}

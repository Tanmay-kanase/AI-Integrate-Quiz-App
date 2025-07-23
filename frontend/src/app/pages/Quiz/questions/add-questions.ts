// add-questions.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs'; // For handling multiple HTTP requests
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-questions',
  templateUrl: './add-questions.html',
  standalone: true,
  styleUrls: ['./add-questions.css'], // Create an empty CSS file or remove if not needed
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
})
export class AddQuestionsComponent implements OnInit {
  questionsForm!: FormGroup;
  totalQuestions: number = 0;
  quizTopicId: string = '';
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  routeReady: boolean = false;
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute, // To get query parameters
    private router: Router // For potential navigation after submission
  ) {}

  ngOnInit(): void {
    console.log('Add Question page is correct');
    this.routeReady = true;
    this.route.queryParams.subscribe((params) => {
      const total = +params['totalQuestions'];
      const id = params['quizTopicId'];

      if (!id || total <= 0) {
        this.router.navigate(['/create-quiz']);
        return;
      }

      // If totalQuestions or quizTopicId change, reset the form
      if (this.totalQuestions !== total || this.quizTopicId !== id) {
        this.totalQuestions = total;
        this.quizTopicId = id;

        // Rebuild the form
        this.questionsForm = this.fb.group({
          questions: this.fb.array([]),
        });

        for (let i = 0; i < this.totalQuestions; i++) {
          this.getQuestions().push(this.buildQuestionFormGroup());
        }
      }
    });
  }

  /**
   * Returns the 'questions' FormArray from the main form group.
   * This is a helper getter for easier access in the template.
   */
  getQuestions(): FormArray {
    return this.questionsForm.get('questions') as FormArray;
  }

  /**
   * Returns the 'options' FormArray for a specific question.
   * @param questionIndex The index of the question in the questions FormArray.
   */
  getOptions(questionIndex: number): FormArray {
    return this.getQuestions().at(questionIndex).get('options') as FormArray;
  }

  /**
   * Builds a FormGroup for a single question with its controls and validators.
   */
  private buildQuestionFormGroup(): FormGroup {
    const questionGroup = this.fb.group({
      questionText: ['', Validators.required],
      options: this.fb.array(
        ['', ''], // Start with two empty options
        [Validators.required, Validators.minLength(2)] // Options are required, min 2
      ),
      correctAnswer: [null, Validators.required], // Correct answer index is required
      explanation: [''],
    });

    // Add a custom validator to the questionGroup to validate correctAnswer against options length
    questionGroup.setValidators(this.validateCorrectAnswerIndex(questionGroup));
    return questionGroup;
  }

  /**
   * Custom validator function to ensure correctAnswer index is within the bounds of options.
   * Applied at the question FormGroup level to access both options and correctAnswer.
   */
  private validateCorrectAnswerIndex(
    questionFormGroup: FormGroup
  ): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const options = group.get('options') as FormArray;
      const correctAnswerControl = group.get('correctAnswer');

      if (
        options &&
        correctAnswerControl &&
        correctAnswerControl.value !== null &&
        correctAnswerControl.value !== undefined
      ) {
        const correctIndex = correctAnswerControl.value;
        // Check if the index is out of bounds or not a valid number
        if (
          correctIndex < 0 ||
          correctIndex >= options.length ||
          !Number.isInteger(correctIndex)
        ) {
          // Set error on the correctAnswer control directly
          correctAnswerControl.setErrors({ invalidCorrectAnswerIndex: true });
          return { invalidCorrectAnswerIndex: true }; // Also set error on the group
        } else {
          // If previously invalid, clear the specific error if it's now valid
          if (correctAnswerControl.hasError('invalidCorrectAnswerIndex')) {
            const errors = correctAnswerControl.errors;
            if (errors) {
              delete errors['invalidCorrectAnswerIndex'];
              if (Object.keys(errors).length === 0) {
                correctAnswerControl.setErrors(null);
              } else {
                correctAnswerControl.setErrors(errors);
              }
            }
          }
        }
      }
      return null;
    };
  }

  /**
   * Adds a new empty option input field to a specific question's options FormArray.
   * @param questionIndex The index of the question to add an option to.
   */
  addOption(questionIndex: number): void {
    this.getOptions(questionIndex).push(this.fb.control(''));
    // Re-validate the question group to update correct answer validation
    this.getQuestions().at(questionIndex).updateValueAndValidity();
  }

  /**
   * Removes an option input field from a specific question's options FormArray.
   * Ensures at least 2 options remain.
   * @param questionIndex The index of the question.
   * @param optionIndex The index of the option to remove.
   */
  removeOption(questionIndex: number, optionIndex: number): void {
    const options = this.getOptions(questionIndex);
    if (options.length > 2) {
      // Ensure at least 2 options remain
      options.removeAt(optionIndex);
      // Re-validate the question group to update correct answer validation
      this.getQuestions().at(questionIndex).updateValueAndValidity();
    }
  }

  /**
   * Handles the form submission.
   * Sends POST requests to the backend API for each question.
   */
  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.questionsForm.invalid) {
      this.questionsForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
      this.errorMessage = 'Please correct all errors before submitting.';
      return;
    }

    this.isLoading = true;
    const questionsData = this.questionsForm.value.questions;
    const httpRequests: Observable<any>[] = [];

    const token = localStorage.getItem('token');

    questionsData.forEach((question: any) => {
      // Add the quizTopic ID to each question object
      const questionToSend = {
        ...question,
        quizTopic: this.quizTopicId,
      };
      // Remove empty explanation if not provided
      if (questionToSend.explanation === '') {
        delete questionToSend.explanation;
      }
      httpRequests.push(
        this.http.post('http://localhost:3000/api/questions/', questionToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
    });

    // Use forkJoin to wait for all HTTP requests to complete
    forkJoin(httpRequests).subscribe({
      next: (responses: any[]) => {
        this.isLoading = false;
        this.successMessage = `Successfully added ${responses.length} questions!`;
        this.questionsForm.reset(); // Reset the form
        // Optionally navigate to a quiz details page or question list
        // this.router.navigate(['/quiz-details', this.quizTopicId]);
        console.log('All questions added:', responses);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message ||
          'Failed to add questions. Please check the form and try again.';
        console.error('Error adding questions:', error);
      },
    });
  }
}

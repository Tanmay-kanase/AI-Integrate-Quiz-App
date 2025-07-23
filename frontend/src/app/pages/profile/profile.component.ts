// src/app/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs'; // Import 'of' for mock data
import { delay } from 'rxjs/operators'; // Import 'delay' for mock data simulation
import { CommonModule } from '@angular/common';

// Assuming you have these interfaces available, or define them here if not globally
// import { IUser, IQuizTopic } from '../../models/your-model-paths'; // Adjust path as needed

export interface IUser {
  _id: string; // Mongoose ID
  name: string;
  email: string;
  password?: string; // Optional for client-side
  role: 'user' | 'admin';
  createdAt: Date;
  profile_image?: string; // Optional for display
}

export interface IQuizTopic {
  _id: string; // Mongoose ID
  title: string;
  description?: string;
  category?: string;
  createdBy?: string; // Will be ObjectId but string on client after populating
  createdAt: Date;
  totalQuestions: number;
  atendeeNumbers: number;
  time: number;
}

// NEW INTERFACE: You'll need to add this to your database models
export interface IQuizAttempt {
  _id: string;
  userId: string;
  quizTopicId: string;
  quizTitle: string; // Denormalized for display
  score: number;
  totalQuestions: number;
  completionDate: Date;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'], // You can add component-specific styles here
  imports: [CommonModule],
})
export class ProfileComponent implements OnInit {
  user: IUser | null = null;
  quizzesCreated: IQuizTopic[] = [];
  recentActivities: IQuizAttempt[] = []; // New property for quiz attempts

  totalQuizzesCreated: number = 0;
  totalQuestionsContributed: number = 0;
  totalQuizzesAttempted: number = 0;
  averageScore: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // For demonstration, let's simulate fetching a user.
    // In a real app, this would come from your auth service.
    // To test admin view, change role to 'admin' in mockUser.
    const mockUser: IUser = {
      _id: 'user_id_123',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      role: 'user', // Change to 'admin' to see admin sections
      createdAt: new Date('2023-07-15T10:00:00Z'),
      profile_image:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Example image
    };

    // Simulate API call for user profile
    of(mockUser)
      .pipe(delay(500))
      .subscribe({
        next: (data) => {
          this.user = data;
          if (this.user) {
            this.fetchUserActivity(this.user._id); // Fetch activity for all users
            if (this.user.role === 'admin') {
              this.fetchQuizzesCreated(this.user._id); // Fetch created quizzes only for admin
            }
          }
        },
        error: (err) => {
          console.error('Error fetching user profile:', err);
        },
      });
  }

  /**
   * Fetches quizzes created by the current user (admin role).
   * @param userId The ID of the user.
   */
  fetchQuizzesCreated(userId: string): void {
    // Mock data for quizzes created by admin
    const mockQuizzes: IQuizTopic[] = [
      {
        _id: 'quiz_id_001',
        title: 'JavaScript Fundamentals',
        description:
          'Test your basic knowledge of JavaScript, including variables, data types, and functions.',
        category: 'Programming',
        createdBy: userId,
        createdAt: new Date('2024-01-10'),
        totalQuestions: 15,
        atendeeNumbers: 50,
        time: 15,
      },
      {
        _id: 'quiz_id_002',
        title: 'CSS Layouts & Flexbox',
        description:
          'Deep dive into modern CSS layout techniques like Flexbox and Grid for responsive design.',
        category: 'Web Development',
        createdBy: userId,
        createdAt: new Date('2024-02-20'),
        totalQuestions: 10,
        atendeeNumbers: 30,
        time: 10,
      },
      {
        _id: 'quiz_id_003',
        title: 'Advanced React Hooks',
        description:
          'Explore complex React hooks and their use cases for state management and side effects.',
        category: 'Frontend Frameworks',
        createdBy: userId,
        createdAt: new Date('2024-03-01'),
        totalQuestions: 20,
        atendeeNumbers: 75,
        time: 25,
      },
    ];

    // Simulate API call
    of(mockQuizzes)
      .pipe(delay(700))
      .subscribe({
        next: (data) => {
          this.quizzesCreated = data;
          this.totalQuizzesCreated = data.length;
          this.calculateTotalQuestionsContributed(data);
        },
        error: (err) => {
          console.error('Error fetching quizzes created:', err);
        },
      });
  }

  /**
   * Calculates the total number of questions contributed by the admin.
   * This sums up questions from quizzes they created.
   * @param quizzes The list of quizzes created by the user.
   */
  calculateTotalQuestionsContributed(quizzes: IQuizTopic[]): void {
    this.totalQuestionsContributed = quizzes.reduce(
      (sum, quiz) => sum + (quiz.totalQuestions || 0),
      0
    );
  }

  /**
   * Fetches recent quiz activity for the user (both 'user' and 'admin' roles).
   * This would typically come from a new `IQuizAttempt` schema in your database.
   * @param userId The ID of the user.
   */
  fetchUserActivity(userId: string): void {
    // Mock data for recent quiz activities
    const mockActivities: IQuizAttempt[] = [
      {
        _id: 'att_001',
        userId: userId,
        quizTopicId: 'quiz_id_001',
        quizTitle: 'JavaScript Fundamentals',
        score: 12,
        totalQuestions: 15,
        completionDate: new Date('2024-06-25'),
      },
      {
        _id: 'att_002',
        userId: userId,
        quizTopicId: 'quiz_id_002',
        quizTitle: 'CSS Layouts & Flexbox',
        score: 7,
        totalQuestions: 10,
        completionDate: new Date('2024-06-20'),
      },
      {
        _id: 'att_003',
        userId: userId,
        quizTopicId: 'quiz_id_004',
        quizTitle: 'Python Basics',
        score: 20,
        totalQuestions: 25,
        completionDate: new Date('2024-06-18'),
      },
      {
        _id: 'att_004',
        userId: userId,
        quizTopicId: 'quiz_id_005',
        quizTitle: 'Data Structures Intro',
        score: 5,
        totalQuestions: 10,
        completionDate: new Date('2024-06-15'),
      },
    ];

    // Simulate API call
    of(mockActivities)
      .pipe(delay(600))
      .subscribe({
        next: (data) => {
          this.recentActivities = data;
          this.totalQuizzesAttempted = data.length;
          this.calculateAverageScore(data);
        },
        error: (err) => {
          console.error('Error fetching recent quiz activities:', err);
        },
      });
  }

  /**
   * Calculates the average score from recent quiz attempts.
   * @param activities The list of quiz attempts.
   */
  calculateAverageScore(activities: IQuizAttempt[]): void {
    if (activities.length === 0) {
      this.averageScore = 0;
      return;
    }
    const totalPercentage = activities.reduce((sum, attempt) => {
      return sum + (attempt.score / attempt.totalQuestions) * 100;
    }, 0);
    this.averageScore = totalPercentage / activities.length;
  }

  /**
   * Handles the click event for editing the user profile.
   */
  onEditProfile(): void {
    console.log('Edit Profile clicked');
    // Implement logic to navigate to an edit profile page or open a modal
    // Example: this.router.navigate(['/edit-profile']);
  }

  /**
   * Handles the click event for viewing all quizzes created by the admin.
   */
  onViewAllQuizzes(): void {
    console.log('View All Quizzes clicked');
    // Implement navigation to a page listing all quizzes created by the user
    // Example: this.router.navigate(['/my-quizzes']);
  }

  /**
   * Handles the click event for viewing all recent quiz activity.
   */
  onViewAllActivity(): void {
    console.log('View All Activity clicked');
    // Implement navigation to a page listing all quiz attempts
    // Example: this.router.navigate(['/my-activity']);
  }

  /**
   * Handles the click event for creating a new quiz (admin role).
   */
  onCreateNewQuiz(): void {
    console.log('Create New Quiz clicked');
    // Implement navigation to the quiz creation page
    // Example: this.router.navigate(['/create-quiz']);
  }

  /**
   * Handles the click event for editing a specific quiz (admin role).
   * @param quizId The ID of the quiz to edit.
   */
  onEditQuiz(quizId: string): void {
    console.log(`Edit Quiz with ID: ${quizId}`);
    // Example: this.router.navigate(['/edit-quiz', quizId]);
  }

  /**
   * Handles the click event for deleting a specific quiz (admin role).
   * @param quizId The ID of the quiz to delete.
   */
  onDeleteQuiz(quizId: string): void {
    console.log(`Delete Quiz with ID: ${quizId}`);
    // Implement confirmation dialog and API call to delete quiz
    // On success, refresh quizzes list
  }

  /**
   * Helper function to format dates for display.
   * @param date The date to format (can be Date object or string).
   * @returns Formatted date string (e.g., "July 2023").
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    // Use Angular's DatePipe in template for more robust formatting
    // For simplicity here, just month and year
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }
}

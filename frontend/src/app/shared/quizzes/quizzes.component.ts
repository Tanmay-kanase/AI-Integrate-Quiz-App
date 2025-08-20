import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

// Interface for a single quiz, simplified for frontend display
export interface Quiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  totalQuestions: number;
  usersAttempted: number;
  createdBy: {
    _id: string;
    name: string;
  }; // Backend will likely return ObjectId -> map to name later
  imageUrl?: string; // Optional, add placeholder if backend doesn’t provide
}

@Component({
  selector: 'app-quizzes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quizzes.component.html',
  styleUrls: ['./quizzes.component.css'],
})
export class QuizzesComponent implements OnInit {
  quizzes: Quiz[] = [];
  loading = true;
  error: string | null = null;

  private apiUrl = 'http://localhost:3000/api/topics'; // adjust if proxied

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchQuizzes();
  }

  fetchQuizzes(): void {
    console.log('Fetching from:', this.apiUrl);

    const token = localStorage.getItem('token');
    this.http
      .get<Quiz[]>(this.apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        catchError((err) => {
          console.error('Error fetching quizzes:', err);
          this.error = 'Failed to load quizzes. Please try again.';
          this.loading = false;
          return of([]);
        })
      )
      .subscribe((data) => {
        // attach a fallback image if API doesn’t return one
        console.log('API response', data);
        this.quizzes = data.map((quiz) => ({
          ...quiz,
          imageUrl:
            quiz.imageUrl ||
            `https://placehold.co/400x200?text=${encodeURIComponent(
              quiz.title
            )}`,
        }));
        this.loading = false;
      });
  }

  startQuiz(quizId: string) {
    this.router.navigate(['/quiz'], { queryParams: { topicId: quizId } });
  }
}

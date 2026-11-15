import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { StorageService } from '../../services/storage';

// Interface for a single quiz, simplified for frontend display
export interface Quiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  time: string;
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
  private storageService = inject(StorageService);
  private apiUrl = 'http://localhost:3000/api/topics'; // adjust if proxied
  page = 1;
  limit = 8;
  hasMore = true;
  loadingMore = false;
  constructor(
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.fetchQuizzes();
  }

  fetchQuizzes(): void {
    this.loading = true;
    this.error = null;
    this.page = 1;
    this.quizzes = [];

    this.loadQuizzes();
  }

  loadMore(): void {
    if (!this.hasMore || this.loadingMore) return;

    this.page++;
    this.loadingMore = true;

    this.loadQuizzes();
  }

  private loadQuizzes(): void {
    const token = this.storageService.getToken();

    this.http
      .get<{
        data: Quiz[];
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
      }>(`${this.apiUrl}?page=${this.page}&limit=${this.limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .subscribe({
        next: (res) => {
          const newQuizzes = res.data.map((quiz) => ({
            ...quiz,
            imageUrl:
              quiz.imageUrl ||
              `https://placehold.co/400x200?text=${encodeURIComponent(
                quiz.title,
              )}`,
          }));

          this.quizzes = [...this.quizzes, ...newQuizzes];
          this.hasMore = res.hasMore;

          this.loading = false;
          this.loadingMore = false;
        },
        error: (err) => {
          console.error('Error fetching quizzes:', err);

          this.error = 'Failed to load quizzes. Please try again.';

          // Allow the same page to be retried.
          if (this.loadingMore) {
            this.page--;
          }

          this.loading = false;
          this.loadingMore = false;
        },
      });
  }

  startQuiz(quizId: string) {
    this.router.navigate(['/quiz'], { queryParams: { topicId: quizId } });
  }
}

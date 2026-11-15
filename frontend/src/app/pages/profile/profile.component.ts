import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../services/storage';

interface Participant {
  attemptId: string;
  userId: string;
  name: string;
  email: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken: number; // seconds
  attemptedAt: string;
}

interface CreatedQuiz {
  quizTopicId: string;
  quizTitle: string;
  description?: string;
  category?: string;
  totalQuestions: number;
  usersAttempted: number;
  createdAt: string;
  participants: Participant[];
}

// quizzesAttended was empty in the sample response, so this shape is a best guess.
// Adjust the field names if your API returns something different.
interface AttendedQuiz {
  attemptId?: string;
  quizTopicId: string;
  quizTitle: string;
  category?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken?: number; // seconds
  attemptedAt: string;
}

interface ProfileData {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
  statistics: {
    totalQuizzesAttended: number;
    totalQuizzesCreated: number;
    totalAttemptsReceived: number;
  };
  quizzesAttended: AttendedQuiz[];
  quizzesCreated: CreatedQuiz[];
}

interface ProfileResponse {
  success: boolean;
  message: string;
  data: ProfileData;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, RouterLink],
})
export class ProfileComponent implements OnInit {
  private readonly http = inject(HttpClient);
  user: any;
  private storageService = inject(StorageService);
  // Change these two to match your backend and how you save the logged-in user.
  private readonly API_URL = 'http://localhost:3000/api/users/profile';
  private readonly USER_ID_KEY = 'userId';

  loading = signal(true);
  error = signal<string | null>(null);
  profile = signal<ProfileData | null>(null);
  activeTab = signal<'attended' | 'created'>('attended');
  expandedQuizId = signal<string | null>(null);

  initial = computed(() => {
    const name = this.profile()?.user.name?.trim();
    return name ? name.charAt(0).toUpperCase() : '?';
  });

  ngOnInit(): void {
    this.user = this.storageService.getUser() || {};
    this.loadProfile();
  }

  loadProfile(): void {
    const userId = this.user?._id || this.user?.id;
    if (!userId) {
      this.loading.set(false);
      this.error.set('Sign in to see your profile.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<ProfileResponse>(`${this.API_URL}/${userId}`, {
        headers: {
          Authorization: `Bearer ${this.storageService.getToken()}`,
        },
      })
      .subscribe({
        next: (res) => {
          const data = res.data;

          // Leaderboard order: highest percentage first, faster time breaks ties.
          data.quizzesCreated.forEach((quiz) =>
            quiz.participants.sort(
              (a, b) =>
                b.percentage - a.percentage || a.timeTaken - b.timeTaken,
            ),
          );

          // Most recent attempts first.
          data.quizzesAttended.sort(
            (a, b) =>
              new Date(b.attemptedAt).getTime() -
              new Date(a.attemptedAt).getTime(),
          );

          this.profile.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(
            err?.error?.message ??
              'We could not load your profile. Check your connection and try again.',
          );
          this.loading.set(false);
        },
      });
  }

  get profileData(): ProfileData | null {
    return this.profile();
  }

  setTab(tab: 'attended' | 'created'): void {
    this.activeTab.set(tab);
  }

  toggleQuiz(quizTopicId: string): void {
    this.expandedQuizId.update((current) =>
      current === quizTopicId ? null : quizTopicId,
    );
  }

  isExpanded(quizTopicId: string): boolean {
    return this.expandedQuizId() === quizTopicId;
  }

  formatDuration(seconds?: number | null): string {
    if (seconds === undefined || seconds === null) return '-';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return rest === 0 ? `${minutes}m` : `${minutes}m ${rest}s`;
  }

  scoreBadge(percentage: number): string {
    if (percentage >= 70) return 'bg-emerald-100 text-emerald-800';
    if (percentage >= 40) return 'bg-amber-100 text-amber-800';
    return 'bg-rose-100 text-rose-800';
  }

  scoreBar(percentage: number): string {
    if (percentage >= 70) return 'bg-emerald-500';
    if (percentage >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  }
}

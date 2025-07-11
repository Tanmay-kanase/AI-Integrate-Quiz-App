import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
// Interface for a single quiz, simplified for frontend display
export interface Quiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  totalQuestions: number;
  createdBy: string; // Assuming we'll display the creator's name
  imageUrl: string; // Placeholder for a quiz-specific image
}

@Component({
  selector: 'app-quizzes',
  
  imports: [CommonModule],
  templateUrl: './quizzes.component.html',
  styleUrls: ['./quizzes.component.css'], // You can remove this if no custom CSS is needed
})
export class QuizzesComponent implements OnInit {
  // This array will hold the quizzes fetched from your backend
  quizzes: Quiz[] = [];

  ngOnInit(): void {
    // In a real application, you would fetch this data from your backend API
    // For now, we'll use mock data to demonstrate the UI
    this.loadMockQuizzes();
  }

  loadMockQuizzes(): void {
    this.quizzes = [
      {
        _id: '686a1158d1f38d810672509d',
        title: 'General Knowledge Quiz',
        description:
          'Test your knowledge across various subjects like history, science, and pop culture.',
        category: 'General',
        totalQuestions: 20,
        createdBy: 'Admin User',
        imageUrl:
          'https://placehold.co/400x200/50bda1/ffffff?text=General+Knowledge',
      },
      {
        _id: '686a1158d1f38d810672509d',
        title: 'Science & Nature',
        description:
          'Explore the wonders of the natural world and scientific principles.',
        category: 'Science',
        totalQuestions: 15,
        createdBy: 'Jane Doe',
        imageUrl:
          'https://placehold.co/400x200/fca311/ffffff?text=Science+%26+Nature',
      },
      {
        _id: 'quiz3',
        title: 'History Buff',
        description:
          'Journey through time and discover significant events and figures.',
        category: 'History',
        totalQuestions: 25,
        createdBy: 'John Smith',
        imageUrl:
          'https://placehold.co/400x200/1e90ff/ffffff?text=History+Buff',
      },
      {
        _id: 'quiz4',
        title: 'Technology Trends',
        description:
          'Stay updated with the latest in tech, gadgets, and innovations.',
        category: 'Technology',
        totalQuestions: 18,
        createdBy: 'Tech Guru',
        imageUrl:
          'https://placehold.co/400x200/9b59b6/ffffff?text=Technology+Trends',
      },
      {
        _id: 'quiz5',
        title: 'Literature & Arts',
        description:
          'Dive into the world of classic novels, poetry, and artistic movements.',
        category: 'Arts',
        totalQuestions: 12,
        createdBy: 'Creative Mind',
        imageUrl:
          'https://placehold.co/400x200/e74c3c/ffffff?text=Literature+%26+Arts',
      },
      {
        _id: 'quiz6',
        title: 'Sports Trivia',
        description:
          'Prove your expertise in various sports, from football to basketball.',
        category: 'Sports',
        totalQuestions: 22,
        createdBy: 'Sports Fan',
        imageUrl:
          'https://placehold.co/400x200/2ecc71/ffffff?text=Sports+Trivia',
      },
    ];
  }

  constructor(private router: Router) {}

  startQuiz(quizId: string) {
    this.router.navigate(['/quiz'], { queryParams: { topicId: quizId } });
  }
}

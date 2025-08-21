import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { InstructionsComponent } from '../../../shared/instructions/instructions.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
  imports: [CommonModule, InstructionsComponent , HttpClientModule], // <-- add HttpClientModule
})
export class QuizComponent implements AfterViewInit, OnDestroy, OnInit {
  currentQuiz: any = null;
  token = localStorage.getItem('token');
  constructor(private route: ActivatedRoute, private http: HttpClient) {}
  timeLeft = 12;
  timerInterval: any;
  showInstructions: boolean = true;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const topicId = params['topicId'];
      if (topicId) {
        this.fetchQuiz(topicId);
      }
    });
  }

  fetchQuiz(topicId: string) {
    this.http
      .get<any>(`http://localhost:3000/api/topics/${topicId}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .subscribe({
        next: (quiz) => {
          console.log('API response', quiz);
          this.currentQuiz = quiz;
        },
        error: (err) => {
          console.error('Failed to load quiz:', err);
        },
      });
  }

  ngAfterViewInit() {
    this.startTimer();
  }

  handleQuizStart(): void {
    this.showInstructions = false;
  }

  startTimer() {
    const timerElement = document.getElementById('timer');
    this.timerInterval = setInterval(() => {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      const display = `${String(minutes).padStart(2, '0')}:${String(
        seconds
      ).padStart(2, '0')}`;

      if (timerElement) {
        timerElement.textContent = display;
        if (this.timeLeft <= 30) {
          timerElement.classList.add('blinking');
        } else {
          timerElement.classList.remove('blinking');
        }
      }

      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
  }
}

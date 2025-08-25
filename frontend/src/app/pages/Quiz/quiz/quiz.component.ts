import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { InstructionsComponent } from '../../../shared/instructions/instructions.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { QuizCompletionComponent } from '../QuizSuccess/quiz-completion.component';

@Component({
  selector: 'app-quiz',
  standalone: true,
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
  imports: [
    CommonModule,
    InstructionsComponent,
    HttpClientModule,
    QuizCompletionComponent,
  ], // <-- add HttpClientModule
})
export class QuizComponent implements AfterViewInit, OnDestroy, OnInit {
  currentQuiz: any = null;
  questions: any[] = [];
  user: any;
  selectedAnswers: { [index: number]: string } = {};
  currentIndex = 0;
  token = localStorage.getItem('token');
  constructor(private route: ActivatedRoute, private http: HttpClient) {}
  timeLeft = 0;
  timerInterval: any;
  showInstructions: boolean = true;
  showCompletionPage: boolean = false;
  quizResult: any; // Store the result from the API call here
  quizStartTime!: number;

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.route.queryParams.subscribe((params) => {
      const topicId = params['topicId'];
      if (topicId) {
        this.fetchQuiz(topicId);
        this.fetchQuestions(topicId);
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
          // initialize timer from quiz time (minutes -> seconds)
          if (quiz?.time) {
            this.timeLeft = +quiz.time * 60;
          }
        },
        error: (err) => {
          console.error('Failed to load quiz:', err);
        },
      });
  }

  /** Fetch all questions for this topic */
  fetchQuestions(topicId: string) {
    this.http
      .get<any[]>(`http://localhost:3000/api/questions/topic/${topicId}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .subscribe({
        next: (data) => {
          this.questions = data;
          console.log('Questions :', data);
        },
        error: (err) => console.error('Failed to load questions:', err),
      });
  }

  ngAfterViewInit() {}

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // 0 -> A, 1 -> B, etc.
  }

  /** Called when instructions are dismissed */
  handleQuizStart(): void {
    this.showInstructions = false;
    this.quizStartTime = Date.now(); // timestamp in ms
    setTimeout(() => this.startTimer(), 0); // start after DOM updates
  }

  /** Timer countdown */
  startTimer() {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return; // safety check
    this.timerInterval = setInterval(() => {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      const display = `${String(minutes).padStart(2, '0')}:${String(
        seconds
      ).padStart(2, '0')}`;
      timerElement.textContent = display;

      if (this.timeLeft <= 30) {
        timerElement.classList.add('blinking');
      } else {
        timerElement.classList.remove('blinking');
      }

      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.timerInterval);
        this.submitQuiz();
      }
    }, 1000);
  }

  /** Save selected answer */
  selectAnswer(option: string) {
    this.selectedAnswers[this.currentIndex] = option;
  }

  /** Move to next question */
  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
    }
  }

  /** Move to previous question */
  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  /** Submit quiz to backend */
  submitQuiz() {
    // Calculate time taken
    const timeTakenMs = Date.now() - this.quizStartTime;
    const minutes = Math.floor(timeTakenMs / 60000);
    const seconds = Math.floor((timeTakenMs % 60000) / 1000);
    const timeTakenStr = `${minutes}:${seconds
      .toString()
      .padStart(2, '0')} minutes`;

    // Calculate score
    let score = 0;
    this.questions.forEach((q, idx) => {
      const selected = this.selectedAnswers[idx];
      const correctIndex = q.correctAnswer; // assuming 0,1,2,3
      if (selected === q.options[correctIndex]) {
        score++;
      }
    });

    this.quizResult = {
      score,
      timeTaken: timeTakenStr,
    };
    this.route.queryParams.subscribe((params) => {
      const topicId = params['topicId'];
      const payload = {
        quizId: this.currentQuiz?._id,
        answers: this.selectedAnswers,
      };

      this.http
        .post(`http://localhost:3000/api/topics/${topicId}/submit`, payload, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .subscribe({
          next: (res) => {
            console.log('Quiz submitted', res);
            alert('Quiz submitted successfully!');
            this.showCompletionPage = true;
          },
          error: (err) => console.error('Submit failed:', err),
        });
    });
    console.log('Selected Answers : ', this.selectedAnswers);
    console.log('Selected Answers:', this.selectedAnswers);
    console.log('Score:', score);
    console.log('Time Taken:', timeTakenStr);
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
  }
}

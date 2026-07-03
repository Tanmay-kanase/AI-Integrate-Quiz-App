import {
  Component,
  AfterViewInit,
  OnDestroy,
  OnInit,
  Inject,
  DOCUMENT,
  HostListener,
} from '@angular/core';
import { InstructionsComponent } from '../../../shared/instructions/instructions.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { QuizCompletionComponent } from '../QuizSuccess/quiz-completion.component';
import { Router } from '@angular/router';
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
  isSubmitting = false;
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
  ) {}
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
    this.enterFullScreen();
    setTimeout(() => this.startTimer(), 0); // start after DOM updates
  }

  // --- FULL SCREEN AND SECURITY LOGIC ---

  enterFullScreen() {
    const elem = this.document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    }
  }

  exitFullScreen() {
    if (this.document.fullscreenElement && this.document.exitFullscreen) {
      this.document.exitFullscreen();
    }
  }

  /** Triggers when user switches tabs or minimizes the window */
  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    if (this.document.hidden && this.isQuizActive()) {
      this.handleViolation('Tab switching is not allowed.');
    }
  }

  /** Triggers when the window loses focus (e.g., clicking on another monitor or app) */
  @HostListener('window:blur')
  onWindowBlur() {
    if (this.isQuizActive()) {
      this.handleViolation('Window lost focus. Please stay on the quiz page.');
    }
  }

  /** Triggers when user presses ESC to exit full screen */
  @HostListener('document:fullscreenchange')
  onFullScreenChange() {
    if (this.isSubmitting) {
      return;
    }

    if (!this.document.fullscreenElement && this.isQuizActive()) {
      this.handleViolation('Exiting full screen is not allowed.');
    }
  }

  isQuizActive(): boolean {
    return !this.showInstructions && !this.showCompletionPage;
  }

  handleViolation(message: string) {
    // You can customize this to give them 1 warning before submitting,
    // but strict mode auto-submits immediately.
    alert(
      `SECURITY WARNING: ${message}\n\nYour quiz is being automatically submitted.`,
    );
    this.submitQuiz();
  }
  /** Timer countdown */
  startTimer() {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return; // safety check
    this.timerInterval = setInterval(() => {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      const display = `${String(minutes).padStart(2, '0')}:${String(
        seconds,
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
  hasSubmitted = false;

  /** Submit quiz to backend */
  submitQuiz() {
    if (this.hasSubmitted) {
      return;
    }

    this.hasSubmitted = true;

    this.isSubmitting = true;

    clearInterval(this.timerInterval);

    this.exitFullScreen();
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

            this.showCompletionPage = true;

            if (this.currentQuiz?.codingAssessment) {
              this.router.navigate(['/coding-assessment'], {
                queryParams: {
                  topicId: this.currentQuiz._id,
                },
              });

              return;
            }
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
    this.exitFullScreen();
    clearInterval(this.timerInterval);
  }
}

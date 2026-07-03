import { Component, DOCUMENT, HostListener, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-coding-assessment',
  imports: [CommonModule, FormsModule],
  templateUrl: './coding-assessment.html',
  styleUrl: './coding-assessment.css',
})
export class CodingAssessment {
  timeLeft = 60 * 60; // 1 hour

  tabSwitchCount = 0;

  showCompletionPage = false;

  isRunning = false;
  isSubmitting = false;

  timerInterval: any;

  assessmentStarted = false;

  violations: string[] = [];

  isResizing = false;

  submitted = false;

  assessment: any = null;

  topicId = '';

  token = localStorage.getItem('token');

  language = 'java';

  code = '';

  leftPanelWidth = 50;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    @Inject(DOCUMENT)
    private document: Document,
  ) {}
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.topicId = params['topicId'];

      if (this.topicId) {
        this.loadAssessment();
      }
    });

    this.startAssessment();
  }

  loadAssessment() {
    this.http
      .get<any>(`http://localhost:3000/api/coding/quiz-topic/${this.topicId}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .subscribe({
        next: (res) => {
          console.log('Assessment', res);

          this.assessment = res.data;

          this.code = `public class Solution {

    public static void main(String[] args) {

    }

}`;
        },

        error: (err: any) => {
          console.error(err);
        },
      });
  }
  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.timerInterval);
        this.autoSubmit();
      }
    }, 1000);
  }
  get formattedTime(): string {
    const hours = Math.floor(this.timeLeft / 3600);
    const minutes = Math.floor((this.timeLeft % 3600) / 60);
    const seconds = this.timeLeft % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  startAssessment() {
    this.assessmentStarted = true;

    this.enterFullScreen();

    this.startTimer();
  }
  enterFullScreen() {
    const elem = this.document.documentElement;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  }
  exitFullScreen() {
    if (this.document.fullscreenElement) {
      this.document.exitFullscreen();
    }
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange() {
    if (
      !this.document.fullscreenElement &&
      this.assessmentStarted &&
      !this.submitted
    ) {
      this.tabSwitchCount++;

      if (this.tabSwitchCount >= 3) {
        this.autoSubmit();
      } else {
        alert(`Fullscreen exit detected. Warning ${this.tabSwitchCount}/3`);

        this.enterFullScreen();
      }
    }
  }
  @HostListener('window:blur')
  onBlur() {
    if (!this.assessmentStarted || this.submitted) {
      return;
    }

    this.tabSwitchCount++;

    if (this.tabSwitchCount >= 3) {
      this.autoSubmit();
    }
  }
  runCode() {
    this.isRunning = true;

    setTimeout(() => {
      this.isRunning = false;
    }, 2000);
  }
  submitCode() {
    this.isSubmitting = true;

    setTimeout(() => {
      this.isSubmitting = false;

      this.autoSubmit();
    }, 2000);
  }
  autoSubmit() {
    if (this.submitted) {
      return;
    }

    this.submitted = true;

    clearInterval(this.timerInterval);

    this.exitFullScreen();

    this.showCompletionPage = true;
  }
  goHome() {
    this.router.navigate(['/']);
  }
  startResize() {
    this.isResizing = true;
  }
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isResizing) {
      return;
    }

    let width = (event.clientX / window.innerWidth) * 100;

    width = Math.max(25, Math.min(75, width));

    this.leftPanelWidth = width;
  }
  @HostListener('document:mouseup')
  onMouseUp() {
    this.isResizing = false;
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    if (!this.assessmentStarted || this.submitted) {
      return;
    }

    if (this.document.hidden) {
      this.tabSwitchCount++;

      alert(
        `Warning ${this.tabSwitchCount}/3: Tab switch detected. After 3 violations your assessment will be submitted automatically.`,
      );

      this.violations.push(`Tab switch ${this.tabSwitchCount}`);

      if (this.tabSwitchCount >= 3) {
        alert('Maximum violations reached. Assessment is being submitted.');

        this.autoSubmit();
      }
    }
  }
}

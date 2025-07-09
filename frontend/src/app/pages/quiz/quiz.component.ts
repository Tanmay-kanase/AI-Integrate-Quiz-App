import { Component, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
})
export class Quiz implements AfterViewInit, OnDestroy {
  timeLeft = 12; // 10:45 in seconds
  timerInterval: any;

  ngAfterViewInit() {
    this.startTimer();
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

        // Add blinking effect under 30 seconds
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

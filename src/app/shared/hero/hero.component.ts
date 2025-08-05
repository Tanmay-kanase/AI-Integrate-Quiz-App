import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent {
  scrollToQuiz(): void {
    const element = document.getElementById('quiz-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

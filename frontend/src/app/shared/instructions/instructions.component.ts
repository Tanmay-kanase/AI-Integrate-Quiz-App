// instructions.component.ts
import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-instructions',
  standalone: true,
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.css'], // You can add component-specific CSS here if needed
  imports: [CommonModule],
})
export class InstructionsComponent {
  @Input() quizTitle!: string;
  @Input() quizDescription!: string;
  @Input() quizCategory!: string;
  @Input() quizTotalQuestions!: number;
  @Input() time!: number;

  // EventEmitter to notify the parent component when the user wants to start the quiz
  @Output() quizStart: EventEmitter<void> = new EventEmitter<void>();

  constructor() {}

  /**
   * Emits an event to the parent component indicating that the user is ready to start the quiz.
   */
  onStartQuiz(): void {
    this.quizStart.emit();
  }
}

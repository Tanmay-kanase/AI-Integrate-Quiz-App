import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HttpClientModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
})
export class HeroComponent {
  quizTopic: string = ''; // Property to store the topic entered by the user
  showTopicModal: boolean = false; // Controls the visibility of the topic input modal
  topic: string = '';
  showGenerateButton = false;

  ngOnInit(): void {
    // Initialization logic if needed
  }
  /**
   * Opens the topic input modal.
   */
  openTopicModal(): void {
    this.showTopicModal = true;
    // Optionally clear the topic when opening the modal
    this.quizTopic = '';
  }
  /**
   * Closes the topic input modal.
   */
  closeTopicModal(): void {
    this.showTopicModal = false;
  }

  /**
   * Placeholder for input change, primarily for Angular's change detection.
   * No specific logic needed here for modal, as button disable handles it.
   */
  onTopicInputChange(): void {
    // This method is still present from previous iterations, but its primary
    // function for the modal is to ensure Angular's change detection
    // updates the disabled state of the "Generate Quiz" button.
    console.log('Current topic input:', this.quizTopic);
  }
  constructor(private http: HttpClient) {}

  onTopicInput(): void {
    this.showGenerateButton = this.topic.trim().length > 0;
  }

  generateQuizAndCloseModal(): void {
    const apiUrl = `http://localhost:5000/api/quiz-generation/${encodeURIComponent(
      this.topic.trim()
    )}`;
    this.http.get(apiUrl).subscribe({
      next: (response) => {
        console.log('Quiz Response:', response);
      },
      error: (error) => {
        console.error('Error fetching quiz:', error);
      },
    });
  }
}

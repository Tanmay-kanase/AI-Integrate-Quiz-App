import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Observable, finalize } from 'rxjs';
import { QuizzesComponent } from '../quizzes/quizzes.component';
import { StorageService } from '../../services/storage';
import {
  PDF_LIMITS,
  PdfExtractionError,
  PdfTextExtractorService,
} from '../../services/test-extracter.service';
import { log } from 'console';

// Mirrors what GET /api/quiz-limits returns. The numbers come from the server's
// .env, so nothing is hard-coded here.

interface GenerateQuizResponse {
  quizTopicId: string;
  meta?: { notices?: string[] }; // only sent for text-based quizzes
}

type QuizSource = 'topic' | 'pdf';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    HttpClientModule,
    QuizzesComponent,
  ],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
})
export class HeroComponent implements OnDestroy {
  private readonly apiBase = 'http://localhost:3000/api'; // move to environment.ts later
  private storageService = inject(StorageService);
  private pdfExtractor = inject(PdfTextExtractorService);
  private spinnerTimer?: ReturnType<typeof setTimeout>;
  private extractionId = 0; // ignores results from an outdated file pick
  readonly PDF_LIMITS = PDF_LIMITS;
  // Modal state
  showTopicModal = false;
  source: QuizSource = 'topic';
  quizTopic = '';
  errorMessage = '';

  // PDF state
  selectedPdf: File | null = null;
  extractedText = '';
  extractNotices: string[] = [];
  isReadingPdf = false;

  // Quiz options
  numQuestions = 10;
  codingQuestions = 2;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate';

  // Loading state
  isLoading = false;
  showSpinner = false;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnDestroy(): void {
    clearTimeout(this.spinnerTimer);
  }

  // ---- Template helpers -------------------------------------------------

  get canGenerate(): boolean {
    return this.source === 'pdf'
      ? !!this.extractedText && !this.isReadingPdf
      : !!this.quizTopic.trim();
  }

  get pdfLabel(): string {
    if (!this.selectedPdf) return 'No PDF selected';
    if (this.isReadingPdf) return `Reading ${this.selectedPdf.name}…`;
    return `${this.selectedPdf.name} (${this.toMB(this.selectedPdf.size)} MB)`;
  }

  // ---- Modal ------------------------------------------------------------

  openTopicModal(): void {
    this.resetModal();
    this.source = 'topic';
    this.showTopicModal = true;
  }

  closeTopicModal(): void {
    this.showTopicModal = false;
  }

  private resetModal(): void {
    this.extractionId++; // invalidate any extraction still running
    this.quizTopic = '';
    this.selectedPdf = null;
    this.extractedText = '';
    this.extractNotices = [];
    this.isReadingPdf = false;
    this.errorMessage = '';
  }

  // ---- PDF selection + extraction (runs in the browser) -----------------

  async onPdfSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // lets the user pick the same file again
    if (!file) return;

    this.resetModal();
    this.source = 'pdf';
    this.showTopicModal = true;

    const error = this.validatePdf(file);
    if (error) {
      this.errorMessage = error;
      return;
    }

    const id = ++this.extractionId;
    this.selectedPdf = file;
    this.isReadingPdf = true;
    try {
      // console.log(file);
      const result = await this.pdfExtractor.extract(file);
      // console.log('Result : ', result);
      if (id !== this.extractionId) return; // user picked another file meanwhile
      this.extractedText = result.text;
      this.extractNotices = result.notices;
    } catch (err) {
      if (id !== this.extractionId) return;
      this.selectedPdf = null;
      this.errorMessage =
        err instanceof PdfExtractionError
          ? err.message
          : 'Could not read this PDF.';
    } finally {
      if (id === this.extractionId) this.isReadingPdf = false;
    }
  }

  // Quick check before reading the file. The server re-checks the text length.
  private validatePdf(file: File): string {
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) return 'Please choose a PDF file.';
    if (file.size === 0) return 'This file is empty.';

    const maxMB = PDF_LIMITS.maxFileMB;

    if (file.size > maxMB * 1024 * 1024) {
      return `This PDF is ${this.toMB(file.size)} MB. The limit is ${maxMB} MB.`;
    }
    return '';
  }

  private toMB(bytes: number): string {
    return (bytes / (1024 * 1024)).toFixed(1);
  }

  // ---- Generate ---------------------------------------------------------

  generateQuizAndCloseModal(): void {
    if (!this.canGenerate || this.isLoading) return;

    this.errorMessage = '';
    this.startLoading();

    const request$ =
      this.source === 'pdf' ? this.requestFromText() : this.requestFromTopic();

    request$.pipe(finalize(() => this.stopLoading())).subscribe({
      next: (response) => {
        // Client-side notices (pages/text cut) + server-side notices (questions reduced)
        const notice = [
          ...(this.source === 'pdf' ? this.extractNotices : []),
          ...(response.meta?.notices ?? []),
        ].join(' ');

        this.closeTopicModal();
        // The quiz page can read history.state.notice to show a banner
        this.router.navigate(['/quiz'], {
          queryParams: { topicId: response.quizTopicId },
          state: { notice },
        });
      },
      error: (error) => {
        console.error('Error generating quiz:', error);
        this.errorMessage =
          error?.error?.message ??
          'Could not generate the quiz. Please try again.';
      },
    });
  }

  private get userId(): string | undefined {
    const user: any = this.storageService.getUser();
    return user?._id;
  }

  private requestFromTopic(): Observable<GenerateQuizResponse> {
    return this.http.post<GenerateQuizResponse>(
      `${this.apiBase}/generateQuiz`,
      {
        topic: this.quizTopic.trim(),
        difficulty: this.difficulty,
        numQuestions: this.numQuestions,
        codingQuestions: this.codingQuestions,
        userId: this.userId,
      },
    );
  }

  // Plain JSON: the PDF itself never leaves the browser, only its text does.
  private requestFromText(): Observable<GenerateQuizResponse> {
    const file = this.selectedPdf as File;
    return this.http.post<GenerateQuizResponse>(
      `${this.apiBase}/generateQuizFromText`,
      {
        sourceText: this.extractedText,
        topic: file.name.replace(/\.pdf$/i, ''),
        difficulty: this.difficulty,
        numQuestions: this.numQuestions,
        codingQuestions: this.codingQuestions,
        userId: this.userId,
      },
    );
  }

  // ---- Spinner ----------------------------------------------------------

  private startLoading(): void {
    this.isLoading = true;
    // Show the spinner once the "Generate Quiz" text finishes its backspace animation
    this.spinnerTimer = setTimeout(() => {
      this.showSpinner = this.isLoading;
    }, 700);
  }

  private stopLoading(): void {
    clearTimeout(this.spinnerTimer);
    this.isLoading = false;
    this.showSpinner = false;
  }
}

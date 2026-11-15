import {
  Component,
  DOCUMENT,
  HostListener,
  inject,
  Inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
type Lang = 'c' | 'cpp' | 'java' | 'python' | 'perl' | 'javascript';

const STARTERS: Record<Lang, string> = {
  python: `class Solution:
    def missingNumber(self, nums):
        # Write your code here
        pass
`,
  javascript: `class Solution {
  missingNumber(nums) {
    // Write your code here
  }
}
`,
  java: `class Solution {
    public int missingNumber(int[] nums) {
        // Write your code here
        return 0;
    }
}
`,
  c: `int missingNumber(int* nums, int numsSize) {
    // Write your code here
    return 0;
}
`,
  cpp: `class Solution {
public:
    int missingNumber(vector<int>& nums) {
        // Write your code here
        return 0;
    }
};
`,
  perl: `sub missing_number {
    my ($nums) = @_;
    # Write your code here
}
`,
};

const EXTENSIONS: Record<Lang, string> = {
  python: 'py',
  javascript: 'js',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  perl: 'pl',
};

@Component({
  selector: 'app-coding-assessment',
  imports: [CommonModule, FormsModule, MonacoEditorModule],
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

  submitted = false;

  assessment: any = null;

  topicId = '';
  private lastViolation = 0;

  private registerViolation(reason: string) {
    const now = Date.now();
    if (now - this.lastViolation < 1500) return; // ignore duplicate events
    this.lastViolation = now;

    this.tabSwitchCount++;
    this.violations.push(`${reason} (${this.tabSwitchCount}/3)`);

    if (this.tabSwitchCount >= 3) this.autoSubmit();
    else setTimeout(() => alert(`Warning ${this.tabSwitchCount}/3: ${reason}`));
  }
  leftPanelWidth = 50;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    @Inject(DOCUMENT)
    private document: Document,
  ) {}

  private storageService = inject(StorageService);
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.topicId = params['topicId'];

      if (this.topicId) {
        this.loadAssessment();
      }
    });

    this.startAssessment();
  }

  token = this.storageService.getToken();

  language: Lang = 'python';
  code = STARTERS[this.language];
  isResizing = false;
  activeTab: 'testcases' | 'output' = 'output';
  output = ''; // you'll fill this after execution
  consoleOpen = true;
  starters = STARTERS;
  editorOptions = {
    theme: 'vs-dark',
    language: 'python',
    automaticLayout: true, // re-layouts when the drag bar resizes the panel
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    fontLigatures: true,
    lineNumbers: 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    tabSize: 4,
    insertSpaces: true,
    padding: { top: 12 },
    renderLineHighlight: 'all',
    bracketPairColorization: { enabled: true },
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    // Optional: for an assessment you may want these off
    // quickSuggestions: false, suggestOnTriggerCharacters: false, parameterHints: { enabled: false },
  };

  get fileName() {
    return `solution.${EXTENSIONS[this.language]}`;
  }

  @HostListener('document:mousemove', ['$event'])
  onMove(e: MouseEvent) {
    if (!this.isResizing) return;
    const pct = (e.clientX / window.innerWidth) * 100;
    this.leftPanelWidth = Math.min(75, Math.max(25, pct));
  }

  @HostListener('document:mouseup')
  onUp() {
    this.isResizing = false;
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

          this.code = STARTERS[this.language];
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

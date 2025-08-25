import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
@Component({
  selector: 'app-quiz-completion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-completion.component.html',
  styleUrls: ['./quiz-completion.component.css'],
})
export class QuizCompletionComponent implements OnInit {
  @Input() quizTitle: string = 'Quiz';
  @Input() userName: string = 'User';
  @Input() score: number = 0;
  @Input() totalQuestions: number = 0;
  @Input() quizTime: string = 'N/A';
  @Input() timeTaken: string = 'N/A';

  constructor() {}

  ngOnInit(): void {}

  get percentage(): number {
    if (this.totalQuestions === 0) {
      return 0;
    }
    return Math.round((this.score / this.totalQuestions) * 100);
  }

  async downloadCertificate() {
    // Create a div dynamically for certificate layout
    const certificateDiv = document.createElement('div');
    certificateDiv.style.width = '800px';
    certificateDiv.style.height = '600px';
    certificateDiv.style.padding = '40px';
    certificateDiv.style.textAlign = 'center';
    certificateDiv.style.border = '10px solid #4A90E2';
    certificateDiv.style.borderRadius = '15px';
    certificateDiv.style.position = 'relative';
    certificateDiv.style.backgroundColor = '#fff';
    certificateDiv.style.fontFamily = 'Times New Roman, serif';

    // College Logo - top left
    const logo = document.createElement('img');
    logo.src = 'logo.png'; // your college logo path
    logo.style.position = 'absolute';
    logo.style.top = '20px';
    logo.style.left = '20px';
    logo.style.width = '100px';
    certificateDiv.appendChild(logo);

    // Symbol Logo - top right
    const symbol = document.createElement('img');
    symbol.src = 'symbol.png';
    symbol.style.position = 'absolute';
    symbol.style.top = '20px';
    symbol.style.right = '20px';
    symbol.style.width = '100px';
    certificateDiv.appendChild(symbol);

    // Certificate Title
    const title = document.createElement('h1');
    title.innerText = 'Certificate of Completion';
    title.style.fontSize = '32px';
    title.style.fontWeight = 'bold';
    title.style.marginTop = '80px';
    certificateDiv.appendChild(title);

    // Subtitle
    const subtitle = document.createElement('p');
    subtitle.innerText = `This is to certify that`;
    subtitle.style.fontSize = '20px';
    subtitle.style.marginTop = '20px';
    certificateDiv.appendChild(subtitle);

    // User Name
    const userNameEl = document.createElement('h2');
    userNameEl.innerText = this.userName;
    userNameEl.style.fontSize = '28px';
    userNameEl.style.fontWeight = 'bold';
    userNameEl.style.marginTop = '10px';
    certificateDiv.appendChild(userNameEl);

    // Quiz Details
    const quizDetails = document.createElement('p');
    quizDetails.innerText = `has successfully completed the quiz "${this.quizTitle}" with a score of ${this.score}/${this.totalQuestions} (${this.percentage}%) in ${this.timeTaken}.`;
    quizDetails.style.fontSize = '18px';
    quizDetails.style.marginTop = '20px';
    certificateDiv.appendChild(quizDetails);

    // Footer: Principal, HOD, Quiz Generator
    const footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.justifyContent = 'space-around';
    footer.style.marginTop = '60px';

    ['Principal', 'HOD', 'Quiz Generator'].forEach((role) => {
      const roleDiv = document.createElement('div');
      roleDiv.innerHTML = `<p style="margin-bottom:50px;">_________________</p><p>${role}</p>`;
      roleDiv.style.textAlign = 'center';
      footer.appendChild(roleDiv);
    });

    certificateDiv.appendChild(footer);

    // Convert div to canvas
    const canvas = await html2canvas(certificateDiv, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    // Generate PDF
    const pdf = new jsPDF('landscape', 'pt', [canvas.width, canvas.height]);
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${this.userName}-certificate.pdf`);
  }
}

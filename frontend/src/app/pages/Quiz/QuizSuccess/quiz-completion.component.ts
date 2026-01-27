import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as QRCode from 'qrcode';
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
    // --- 1. Generate Unique Certificate Data ---
    const userNameInitials = this.userName
      .split(' ')
      .map((n) => n[0])
      .join('');
    const uniqueId = `${userNameInitials}-${Date.now()}`;
    const certificateIdText = `ID: ${uniqueId}`;
    const verificationUrl = `https://your-website.com/verify?id=${uniqueId}`; // IMPORTANT: Change this URL

    // Generate QR Code as a Data URL (image)
    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 120, // Set QR code size
        margin: 1,
        color: {
          dark: '#0D2A4C', // Color of the QR code modules
          light: '#0000', // Transparent background
        },
      });
    } catch (err) {
      console.error('Failed to generate QR Code', err);
    }

    // --- 2. Setup Certificate HTML Template ---
    const certificateId = 'certificate-wrapper';
    let certificateWrapper = document.getElementById(certificateId);
    if (!certificateWrapper) {
      certificateWrapper = document.createElement('div');
      certificateWrapper.id = certificateId;
      certificateWrapper.style.position = 'absolute';
      certificateWrapper.style.left = '-9999px';
      certificateWrapper.style.top = '0';
      document.body.appendChild(certificateWrapper);
    }

    const fontUrl =
      'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Playfair+Display:wght@700&display=swap';
    const fontLink = document.createElement('link');
    fontLink.href = fontUrl;
    fontLink.rel = 'stylesheet';

    certificateWrapper.innerHTML = `
      <style> @import url('${fontUrl}'); </style>
      <div id="certificate" style="width: 1100px; height: 750px; background-color: #f8f9fa; display: flex; font-family: 'Lato', sans-serif; color: #333; border: 1px solid #dee2e6;">
        <div style="width: 250px; background-color: #0D2A4C; display: flex; flex-direction: column; justify-content: flex-start; align-items: center; padding: 50px 0;">
          <img src="logo.png" alt="Logo" style="width: 150px;">
          <h3 style="color: #ffffff; text-align: center; margin-top: 10px; font-size: 16px;">Samartha College of Engineering and Management</h3>
        </div>
        <div style="flex-grow: 1; padding: 60px; position: relative; display: flex; flex-direction: column;">
          <img src="seal.svg" alt="Seal" style="position: absolute; top: 20px; right: 20px; width: 100px; opacity: 0.8;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 48px; color: #3A4750; margin: 0; text-align: center;">
            Certificate of Completion
          </h1>
          <p style="text-align: center; font-size: 18px; margin-top: 25px; color: #555;">This certificate is proudly presented to</p>
          <h2 style="font-family: 'Playfair Display', serif; font-size: 40px; color: #2D9596; text-align: center; margin: 20px 0; border-bottom: 2px solid #ccc; padding-bottom: 15px;">
            ${this.userName}
          </h2>
          <p style="font-size: 17px; line-height: 1.6; text-align: center; margin: 20px 0 40px 0; color: #555;">
            For successfully completing the quiz titled <strong style="color: #0D2A4C;">"${
              this.quizTitle
            }"</strong> with a score of <strong style="color: #0D2A4C;">${
      this.percentage
    }%</strong>.
          </p>
          <div style="display: flex; justify-content: space-around; text-align: center; margin-top: 30px;">
            <div>
              <p style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">Head of Department</p>
              <p style="border-top: 1px solid #333; padding-top: 5px; font-size: 14px; color: #555;">Signature</p>
            </div>
            <div>
              <p style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${new Date().toLocaleDateString()}</p>
              <p style="border-top: 1px solid #333; padding-top: 5px; font-size: 14px; color: #555;">Date Issued</p>
            </div>
          </div>
          
          <div style="margin-top: auto; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #dee2e6;">
            <p style="font-size: 12px; color: #6c757d; margin: 0;">${certificateIdText}</p>
            <img src="${qrCodeDataUrl}" alt="Verification QR Code" style="width: 85px; height: 85px;">
          </div>
        </div>
      </div>
    `;

    // --- 3. Render and Download PDF ---
    document.head.appendChild(fontLink);
    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      const certificateElement =
        certificateWrapper.querySelector('#certificate');
      if (!certificateElement)
        throw new Error('Certificate element not found!');

      const canvas = await html2canvas(certificateElement as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('landscape', 'pt', [canvas.width, canvas.height]);
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${this.userName}-certificate.pdf`);
    } catch (error) {
      console.error('Error generating the certificate PDF:', error);
    } finally {
      document.head.removeChild(fontLink);
    }
  }
}

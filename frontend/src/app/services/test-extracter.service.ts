import { Injectable } from '@angular/core';

// Same shape as `pdf` in GET /api/quiz-limits
export interface PdfLimits {
  maxFileMB: number;
  maxPages: number;
  minTextChars: number;
  maxTextChars: number;
  overflowStrategy: 'truncate' | 'reject';
}

export interface ExtractedPdf {
  text: string;
  totalPages: number;
  pagesRead: number;
  notices: string[]; // user-facing, e.g. "Only the first 50 of 120 pages were used."
}

// Message is safe to show directly to the user.
export class PdfExtractionError extends Error {}

// Used only if /api/quiz-limits could not be loaded, to protect the browser.
// The server still enforces its real limits.
export const PDF_LIMITS: PdfLimits = {
  maxFileMB: 10,
  maxPages: 50,
  minTextChars: 200,
  maxTextChars: 30000,
  overflowStrategy: 'truncate',
};

@Injectable({ providedIn: 'root' })
export class PdfTextExtractorService {
  private pdfjsPromise?: Promise<any>;

  async extract(file: File): Promise<ExtractedPdf> {
    const lim = PDF_LIMITS;

    let pdf: any;
    try {
      const pdfjs = await this.loadPdfjs();
      const data = new Uint8Array(await file.arrayBuffer());
      // isEvalSupported:false hardens against font-eval exploits in old pdf.js versions
      pdf = await pdfjs.getDocument({ data, isEvalSupported: false }).promise;
    } catch (err: any) {
      throw new PdfExtractionError(
        err?.name === 'PasswordException'
          ? 'This PDF is password-protected.'
          : 'Could not read this PDF. It may be corrupted.',
      );
    }

    const notices: string[] = [];
    try {
      const totalPages: number = pdf.numPages;

      if (totalPages > lim.maxPages) {
        if (lim.overflowStrategy === 'reject') {
          throw new PdfExtractionError(
            `This PDF has ${totalPages} pages. The limit is ${lim.maxPages}.`,
          );
        }
        notices.push(
          `Only the first ${lim.maxPages} of ${totalPages} pages were used.`,
        );
      }

      const pagesToRead = Math.min(totalPages, lim.maxPages);
      let raw = '';
      let pagesRead = 0;

      for (let n = 1; n <= pagesToRead; n++) {
        const page = await pdf.getPage(n);
        const content = await page.getTextContent();
        raw += this.pageText(content.items) + '\n\n';
        page.cleanup();
        pagesRead = n;
        // Stop early once there is far more text than we will ever use
        if (raw.length > lim.maxTextChars * 2) break;
      }

      let text = this.cleanText(raw);

      if (text.length < lim.minTextChars) {
        throw new PdfExtractionError(
          "No readable text found in this PDF. Scanned or image-only PDFs aren't supported yet.",
        );
      }

      if (text.length > lim.maxTextChars) {
        if (lim.overflowStrategy === 'reject') {
          throw new PdfExtractionError(
            `This PDF has more text than the limit of ${lim.maxTextChars} characters.`,
          );
        }
        text = this.cutAtBoundary(text, lim.maxTextChars);
        notices.push('The PDF text was long, so only the beginning was used.');
      }

      return { text, totalPages, pagesRead, notices };
    } finally {
      pdf.destroy();
    }
  }

  // pdf.js is ~1 MB, so it is only downloaded the first time someone picks a PDF.
  private loadPdfjs(): Promise<any> {
    this.pdfjsPromise ??= import('pdfjs-dist')
      .then((pdfjs) => {
        // Copied to /pdfjs by an angular.json asset rule (see setup notes)
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs/pdf.worker.min.mjs',
          document.baseURI,
        ).toString();
        return pdfjs;
      })
      .catch((err) => {
        this.pdfjsPromise = undefined; // allow a retry
        throw err;
      });
    return this.pdfjsPromise;
  }

  private pageText(items: any[]): string {
    let out = '';
    for (const item of items) {
      if (typeof item.str !== 'string') continue; // skip marked-content entries
      out += item.str + (item.hasEOL ? '\n' : '');
    }
    return out;
  }

  private cleanText(raw: string): string {
    return raw
      .replace(/\u0000/g, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  // Cut at a paragraph or sentence end near the limit instead of mid-word.
  private cutAtBoundary(text: string, maxChars: number): string {
    const slice = text.slice(0, maxChars);
    const boundary = Math.max(
      slice.lastIndexOf('\n\n'),
      slice.lastIndexOf('. '),
    );
    return boundary > maxChars * 0.8
      ? slice.slice(0, boundary + 1).trim()
      : slice.trim();
  }
}

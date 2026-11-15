// npm i pdf-parse@1.1.1
// (pinned: the 1.x API is `pdfParse(buffer, { max })`; newer majors changed it)
const pdfParse = require("pdf-parse");
const { limits } = require("../config/quizLimits");

class PdfValidationError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = "PdfValidationError";
    this.code = code;
    this.status = status;
  }
}

function assertLooksLikePdf(buffer) {
  // The Content-Type header comes from the client, so check the file signature too.
  if (
    !buffer ||
    buffer.length < 5 ||
    buffer.subarray(0, 5).toString("latin1") !== "%PDF-"
  ) {
    throw new PdfValidationError("NOT_A_PDF", "That file is not a valid PDF.");
  }
}

function cleanText(raw) {
  return raw
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Cut at a paragraph or sentence end near the limit instead of mid-word.
function cutAtBoundary(text, maxChars) {
  const slice = text.slice(0, maxChars);
  const boundary = Math.max(slice.lastIndexOf("\n\n"), slice.lastIndexOf(". "));
  return boundary > maxChars * 0.8
    ? slice.slice(0, boundary + 1).trim()
    : slice.trim();
}

/**
 * Extracts text from a PDF buffer, enforcing the limits in config/quizLimits.js.
 * Returns { text, meta } where meta.notices are user-facing messages
 * (e.g. "Only the first 50 of 120 pages were used.").
 */
async function extractPdfText(buffer, pdfLimits = limits.pdf) {
  assertLooksLikePdf(buffer);

  let parsed;
  try {
    // `max` stops parsing after N pages, so a huge PDF can't tie up the server.
    parsed = await pdfParse(buffer, { max: pdfLimits.maxPages });
  } catch (err) {
    throw new PdfValidationError(
      "PDF_UNREADABLE",
      "Could not read this PDF. It may be corrupted or password-protected.",
    );
  }

  const totalPages = parsed.numpages;
  const pagesRead = Math.min(totalPages, pdfLimits.maxPages);
  const notices = [];

  if (totalPages > pdfLimits.maxPages) {
    if (pdfLimits.overflowStrategy === "reject") {
      throw new PdfValidationError(
        "TOO_MANY_PAGES",
        `This PDF has ${totalPages} pages. The limit is ${pdfLimits.maxPages}.`,
        413,
      );
    }
    notices.push(
      `Only the first ${pagesRead} of ${totalPages} pages were used.`,
    );
  }

  let text = cleanText(parsed.text || "");

  if (text.length < pdfLimits.minTextChars) {
    throw new PdfValidationError(
      "PDF_NO_TEXT",
      "No readable text found in this PDF. Scanned or image-only PDFs aren't supported yet.",
      422,
    );
  }

  if (text.length > pdfLimits.maxTextChars) {
    if (pdfLimits.overflowStrategy === "reject") {
      throw new PdfValidationError(
        "TEXT_TOO_LONG",
        `This PDF has about ${text.length} characters of text. The limit is ${pdfLimits.maxTextChars}.`,
        413,
      );
    }
    text = cutAtBoundary(text, pdfLimits.maxTextChars);
    notices.push("The PDF text was long, so only the beginning was used.");
  }

  return { text, meta: { totalPages, pagesRead, chars: text.length, notices } };
}

module.exports = { extractPdfText, PdfValidationError };

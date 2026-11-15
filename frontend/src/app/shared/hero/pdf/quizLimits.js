// Every limit for PDF uploads and quiz generation lives here and is read from
// environment variables. To scale up, edit .env and restart: no code changes.
//
// Make sure dotenv.config() runs BEFORE this file is first required.

const toPositiveNumber = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const limits = Object.freeze({
  pdf: Object.freeze({
    // Reject uploads bigger than this (enforced by multer while streaming the upload).
    maxFileMB: toPositiveNumber(process.env.PDF_MAX_FILE_MB, 10),
    // Pages read from the PDF.
    maxPages: toPositiveNumber(process.env.PDF_MAX_PAGES, 50),
    // Fewer characters than this usually means a scanned / image-only PDF.
    minTextChars: toPositiveNumber(process.env.PDF_MIN_TEXT_CHARS, 200),
    // Cap on text sent to the model (roughly 4 characters per token in English).
    maxTextChars: toPositiveNumber(process.env.PDF_MAX_TEXT_CHARS, 30000),
    // What to do when a PDF exceeds maxPages / maxTextChars:
    //   'truncate' -> use the first part and tell the user
    //   'reject'   -> return an error
    overflowStrategy:
      process.env.PDF_OVERFLOW_STRATEGY === "reject" ? "reject" : "truncate",
  }),
  quiz: Object.freeze({
    maxQuestions: toPositiveNumber(process.env.QUIZ_MAX_QUESTIONS, 50),
    maxCodingQuestions: toPositiveNumber(
      process.env.QUIZ_MAX_CODING_QUESTIONS,
      50,
    ),
    // Each question needs this much source text, so short PDFs get fewer questions.
    minCharsPerQuestion: toPositiveNumber(
      process.env.QUIZ_MIN_CHARS_PER_QUESTION,
      400,
    ),
  }),
});

/**
 * Total questions (multiple-choice + coding) the extracted text can support.
 * Tweak this one function if you want a different formula.
 */
function questionCapForText(charCount) {
  const byText = Math.floor(charCount / limits.quiz.minCharsPerQuestion);
  return Math.max(1, Math.min(limits.quiz.maxQuestions, byText));
}

module.exports = { limits, questionCapForText };

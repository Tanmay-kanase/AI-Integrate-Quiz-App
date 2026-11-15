// npm i multer
const express = require('express');
const multer = require('multer');
const { limits, questionCapForText } = require('../config/quizLimits');
const {
  extractPdfText,
  PdfValidationError,
} = require('../services/pdfExtractor');
const { buildSourcePrompt } = require('../services/sourcePrompt');

// INTEGRATION POINT: move the model call + DB save from your existing
// /api/generateQuiz handler into a function with this shape and export it:
//   generateQuizFromText({ prompt, topic, difficulty, numQuestions, codingQuestions, userId })
//     -> Promise<{ quizTopicId: string }>
const { generateQuizFromText } = require('../services/quizGenerator');

const router = express.Router();

const upload = multer({
  // Memory storage is fine at 10 MB. If you raise the limit a lot, switch to disk storage.
  storage: multer.memoryStorage(),
  limits: { fileSize: limits.pdf.maxFileMB * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const ok = file.mimetype === 'application/pdf';
    cb(
      ok
        ? null
        : new PdfValidationError('NOT_A_PDF', 'Please upload a PDF file.'),
      ok,
    );
  },
});

const toInt = (value, fallback) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

// The Angular app reads limits from here, so they are never hard-coded in the frontend.
router.get('/quiz-limits', (req, res) => res.json(limits));

router.post(
  '/generateQuizFromPdf',
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file)
        throw new PdfValidationError('NO_FILE', 'No PDF was uploaded.');

      const difficulty = ['Beginner', 'Intermediate', 'Advanced'].includes(
        req.body.difficulty,
      )
        ? req.body.difficulty
        : 'Intermediate';
      const requestedQuestions = toInt(req.body.numQuestions, 10);
      const requestedCoding = toInt(req.body.codingQuestions, 0);

      const { text, meta } = await extractPdfText(req.file.buffer);

      // Dynamic cap: the more text the PDF has, the more questions are allowed.
      const cap = questionCapForText(text.length);
      const numQuestions = Math.max(
        1,
        Math.min(requestedQuestions, limits.quiz.maxQuestions, cap),
      );
      const codingQuestions = Math.min(
        requestedCoding,
        limits.quiz.maxCodingQuestions,
        Math.max(0, cap - numQuestions),
      );
      if (
        numQuestions < requestedQuestions ||
        codingQuestions < requestedCoding
      ) {
        const coding = codingQuestions ? ` + ${codingQuestions} coding` : '';
        meta.notices.push(
          `Questions were reduced to ${numQuestions}${coding} to fit the limits for this PDF.`,
        );
      }

      const topic = (
        req.body.topic || req.file.originalname.replace(/\.pdf$/i, '')
      ).slice(0, 120);
      const prompt = buildSourcePrompt({
        sourceText: text,
        topic,
        difficulty,
        numQuestions,
        codingQuestions,
      });

      const quiz = await generateQuizFromText({
        prompt,
        topic,
        difficulty,
        numQuestions,
        codingQuestions,
        userId: req.body.userId,
      });

      res.json({ quizTopicId: quiz.quizTopicId, meta });
    } catch (err) {
      next(err);
    }
  },
);

// Turn upload / validation errors into clean JSON the frontend can show.
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      code: 'FILE_TOO_LARGE',
      message: `This PDF is larger than ${limits.pdf.maxFileMB} MB.`,
    });
  }
  if (err instanceof PdfValidationError) {
    return res
      .status(err.status)
      .json({ code: err.code, message: err.message });
  }
  next(err);
});

module.exports = router;

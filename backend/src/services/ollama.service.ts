import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateQuizFromGemini = async (
  topic: string,
  difficulty: string,
  numQuestions: number,
  codingQuestions: number,
) => {
  const prompt = `
Generate exactly ${numQuestions} MCQ questions on ${topic}.

Difficulty: ${difficulty}

Return ONLY valid JSON in this format:

{
  "title": "Quiz Title",
  "description": "Quiz Description",
  "questions": [
    {
      "questionText": "Question",
      "options": ["A","B","C","D"],
      "correctAnswer": 0
    }
  ]
}

Do not include markdown.
Do not include \`\`\`json.
Return only raw JSON.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text?.trim() || "";

  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  console.log("CLeaned  : ", cleaned);
  return JSON.parse(cleaned);
};

export const generateQuizFromTextFromGemini = async (
  difficulty: string,
  sourceText: string,
  numQuestions: number,
  codingQuestions: number,
) => {
  const prompt = `
You are an expert quiz generator.

Generate exactly ${numQuestions} MCQ questions based ONLY on the following source text.

Difficulty: ${difficulty}

Source Text:
${sourceText}

Instructions:
1. Generate exactly ${numQuestions} questions.
2. Questions must be based on the provided source text only.
3. Do not generate questions using external knowledge.
4. Each question must have exactly 4 options.
5. Only one option must be correct.
6. correctAnswer must be a zero-based index (0, 1, 2, or 3).
7. Avoid duplicate questions.
8. Questions should match the specified difficulty.

Return ONLY valid JSON in this format:

{
  "title": "Quiz Title",
  "description": "Quiz Description",
  "questions": [
    {
      "questionText": "Question",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0
    }
  ]
}

Do not include markdown.
Do not include code fences.
Return only raw JSON.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text?.trim() || "";

  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  console.log("Gemini Text Quiz Response:", cleaned);

  return JSON.parse(cleaned);
};

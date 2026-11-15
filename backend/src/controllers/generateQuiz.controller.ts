import { Request, Response } from "express";
import {
  generateQuiz,
  generateQuizFromText,
} from "../services/quizGeneration.service";

// Generate Quiz from text
export const generateQuizU = async (req: Request, res: Response) => {
  try {
    const { topic, difficulty, numQuestions, userId, codingQuestions } =
      req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    const result = await generateQuiz(
      topic,
      difficulty || "Intermediate",
      numQuestions || 10,
      userId,
      codingQuestions,
    );
    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    console.log("Result form controller : ", result);

    return res.status(201).json({
      success: true,
      quizTopicId: result.quizTopicId,
      totalQuestions: result.totalQuestions,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Generate Quiz from PDF/File?text
export const generateQuizF = async (req: Request, res: Response) => {
  try {
    const { sourceText, difficulty, numQuestions, userId, codingQuestions } =
      req.body;

    const result = await generateQuizFromText(
      sourceText,
      difficulty || "Intermediate",
      numQuestions || 10,
      userId,
      codingQuestions,
    );
    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    console.log("Result form controller : ", result);

    return res.status(201).json({
      success: true,
      quizTopicId: result.quizTopicId,
      totalQuestions: result.totalQuestions,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

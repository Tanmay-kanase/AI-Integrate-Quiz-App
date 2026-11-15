import { Request, Response, NextFunction } from "express";
import QuizTopicService from "../services/quizTopic.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import quizTopicModel from "../models/quizTopic.model";
const quizTopicService = new QuizTopicService();

export const createQuizTopic = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const topic = await quizTopicService.create(req.body, req.user.userId);
    res.status(201).json(topic);
  } catch (error) {
    next(error);
  }
};

export const submitQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const quizId = req.params.id;

  try {
    // 1. Update usersAttempted count
    await quizTopicModel.findByIdAndUpdate(quizId, {
      $inc: { usersAttempted: 1 },
    });

    // 2. Process submission (evaluate score, store result, etc.)

    res.status(200).json({ message: "Quiz submitted successfully!" });
  } catch (err) {
    next(err);
  }
};
export const getAllQuizTopics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 8));

    const result = await quizTopicService.findAll(page, limit);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getQuizTopicById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const topic = await quizTopicService.findById(req.params.id);
    res.status(200).json(topic);
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import QuizTopicService from '../services/quizTopic.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const quizTopicService = new QuizTopicService();

export const createQuizTopic = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const topic = await quizTopicService.create(req.body, req.user.userId);
    res.status(201).json(topic);
  } catch (error) {
    next(error);
  }
};

export const getAllQuizTopics = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const topics = await quizTopicService.findAll();
    res.status(200).json(topics);
  } catch (error) {
    next(error);
  }
};

export const getQuizTopicById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topic = await quizTopicService.findById(req.params.id);
    res.status(200).json(topic);
  } catch (error) {
    next(error);
  }
};
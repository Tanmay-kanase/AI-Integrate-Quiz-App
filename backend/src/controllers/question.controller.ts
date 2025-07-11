import { Request, Response, NextFunction } from "express";
import questionService from "../services/question.service";

const getQuestionsByTopic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topicId = req.params.topicId;
    const questions = await questionService.getQuestionsByTopic(topicId);
    res.status(200).json(questions);
  } catch (err) {
    next(err);
  }
};

const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createdBy = req.params.userId;
    const question = await questionService.createQuestion(req.body, createdBy);
    res.status(201).json(question);
  } catch (err) {
    next(err);
  }
};

const deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questionId = req.params.id;
    await questionService.deleteQuestion(questionId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export default {
  getQuestionsByTopic,
  createQuestion,
  deleteQuestion,
};

import { Router } from "express";
import {
  createQuizTopic,
  getAllQuizTopics,
  getQuizTopicById,
  submitQuiz,
} from "../controllers/quizTopic.controller";
import { authenticate } from "../middlewares/auth.middleware";

const quizTopicRouter = Router();

quizTopicRouter.post("/", authenticate, createQuizTopic);
quizTopicRouter.get("/", authenticate, getAllQuizTopics);
quizTopicRouter.get("/:id", authenticate, getQuizTopicById);
quizTopicRouter.post("/:id/submit", authenticate, submitQuiz);
export default quizTopicRouter;

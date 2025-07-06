import { Router } from 'express';
import { createQuizTopic, getAllQuizTopics, getQuizTopicById } from '../controllers/quizTopic.controller';
import { authenticate } from '../middlewares/auth.middleware';

const quizTopicRouter = Router();

quizTopicRouter.post('/', authenticate, createQuizTopic);
quizTopicRouter.get('/', getAllQuizTopics);
quizTopicRouter.get('/:id', getQuizTopicById);

export default quizTopicRouter;
import QuizTopic, { IQuizTopic } from '../models/quizTopic.model';
import HttpException from '../exceptions/HttpException';
import { Types } from 'mongoose';
import { CreateQuizTopicDto } from '../types/quizTopic.interface';

class QuizTopicService {
  async create(data: CreateQuizTopicDto, createdBy: string): Promise<IQuizTopic> {
    return await QuizTopic.create({ ...data, createdBy });
  }

  async findAll(): Promise<IQuizTopic[]> {
    return await QuizTopic.find();
  }

  async findById(id: string): Promise<IQuizTopic> {
    if (!Types.ObjectId.isValid(id)) throw new HttpException(400, 'Invalid ID');
    const topic = await QuizTopic.findById(id);
    if (!topic) throw new HttpException(404, 'Quiz topic not found');
    return topic;
  }
}

export default QuizTopicService;
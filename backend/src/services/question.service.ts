import QuestionModel from "../models/questions.model";
import QuizTopicModel from "../models/quizTopic.model";
import HttpException from "../exceptions/HttpException";
import { IQuestion } from "../models/questions.model";

const getQuestionsByTopic = async (topicId: string): Promise<IQuestion[]> => {
  const topicExists = await QuizTopicModel.findById(topicId);
  if (!topicExists) throw new HttpException(404, "Quiz topic not found");

  return await QuestionModel.find({ quizTopic: topicId }).lean();
};

const createQuestion = async (
  data: Partial<IQuestion>,
  createdBy?: string
): Promise<IQuestion> => {
  if (!data.questionText || !data.options || data.correctAnswer === undefined || !data.quizTopic) {
    throw new HttpException(400, "Missing required fields");
  }

  const question = new QuestionModel({
    ...data,
    createdBy,
  });

  await question.save();
  return question;
};

const deleteQuestion = async (id: string): Promise<void> => {
  const exists = await QuestionModel.findById(id);
  if (!exists) throw new HttpException(404, "Question not found");

  await QuestionModel.findByIdAndDelete(id);
};

export default {
  getQuestionsByTopic,
  createQuestion,
  deleteQuestion,
};

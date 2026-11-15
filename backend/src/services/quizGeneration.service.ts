import questionsModel from "../models/questions.model";
import quizTopicModel from "../models/quizTopic.model";
import {
  generateQuizFromGemini,
  generateQuizFromTextFromGemini,
} from "./ollama.service";

export const generateQuiz = async (
  topic: string,
  difficulty: string,
  numQuestions: number,
  userId: string,
  codingQuestions: number,
) => {
  try {
    const aiQuiz = await generateQuizFromGemini(
      topic,
      difficulty,
      numQuestions,
      codingQuestions,
    );
    console.log("Response : ", aiQuiz);
    var totalTime = (2 * aiQuiz.questions.length).toString();
    const quizTopic = await quizTopicModel.create({
      title: aiQuiz.title,
      description: aiQuiz.description,
      category: topic,
      time: totalTime,
      totalQuestions: aiQuiz.questions.length,
      usersAttempted: 0,
      createdBy: userId,
      codingAssessment: false,
    });

    const questions = aiQuiz.questions.map((q: any) => ({
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: `Option ${q.correctAnswer} is correct.`,
      quizTopic: quizTopic._id,
      createdBy: userId,
    }));

    await questionsModel.insertMany(questions);

    return {
      quizTopicId: quizTopic._id,
      totalQuestions: questions.length,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error:", error.message);
    } else {
      console.log("Unknown error:", error);
    }
  }
};

export const generateQuizFromText = async (
  sourceText: string,
  difficulty: string,
  numQuestions: number,
  userId: string,
  codingQuestions: number,
) => {
  try {
    const aiQuiz = await generateQuizFromTextFromGemini(
      difficulty,
      sourceText,
      numQuestions,
      codingQuestions,
    );
    console.log("Response : ", aiQuiz);
    var totalTime = (2 * aiQuiz.questions.length).toString();
    const quizTopic = await quizTopicModel.create({
      title: aiQuiz.title,
      description: aiQuiz.description,
      category: "PDF Extracted",
      time: totalTime,
      totalQuestions: aiQuiz.questions.length,
      usersAttempted: 0,
      createdBy: userId,
      codingAssessment: false,
    });

    const questions = aiQuiz.questions.map((q: any) => ({
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: `Option ${q.correctAnswer} is correct.`,
      quizTopic: quizTopic._id,
      createdBy: userId,
    }));

    await questionsModel.insertMany(questions);

    return {
      quizTopicId: quizTopic._id,
      totalQuestions: questions.length,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error:", error.message);
    } else {
      console.log("Unknown error:", error);
    }
  }
};

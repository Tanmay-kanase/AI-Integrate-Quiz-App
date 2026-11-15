import quizAttemptModel from "../models/quizAttemp.model";
import quizTopicModel from "../models/quizTopic.model";

export const createQuizAttempt = async (data: any, userId: string) => {
  const quiz = await quizTopicModel.findById(data.quizTopic);

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  const attempt = await quizAttemptModel.create({
    ...data,
    user: userId,
  });

  await quizTopicModel.findByIdAndUpdate(data.quizTopic, {
    $inc: { usersAttempted: 1 },
  });

  return attempt;
};

export const getAllAttempts = async () => {
  return await quizAttemptModel
    .find()
    .populate("user", "name email profile_image")
    .populate("quizTopic", "title category")
    .populate("answers.question")
    .sort({ createdAt: -1 });
};

export const getAttemptById = async (id: string) => {
  return await quizAttemptModel
    .findById(id)
    .populate("user", "name email")
    .populate("quizTopic", "title category")
    .populate("answers.question");
};

export const getMyAttempts = async (userId: string) => {
  return await quizAttemptModel
    .find({
      user: userId,
    })
    .populate("quizTopic", "title category totalQuestions")
    .sort({ createdAt: -1 });
};

export const updateAttempt = async (id: string, userId: string, data: any) => {
  return await quizAttemptModel.findOneAndUpdate(
    {
      _id: id,
      user: userId,
    },
    data,
    {
      new: true,
      runValidators: true,
    },
  );
};

export const deleteAttempt = async (id: string, userId: string) => {
  const attempt = await quizAttemptModel.findOneAndDelete({
    _id: id,
    user: userId,
  });

  if (attempt) {
    await quizTopicModel.findByIdAndUpdate(attempt.quizTopic, {
      $inc: { usersAttempted: -1 },
    });
  }

  return attempt;
};

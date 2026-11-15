import userModel from "../models/user.model";
import quizTopicModel from "../models/quizTopic.model";
import quizAttemptModel from "../models/quizAttemp.model";
export const getUserProfile = async (userId: string) => {
  // 1. Get User Details
  const user = await userModel.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  // 2. Get Quizzes Attended By User
  const attendedAttempts = await quizAttemptModel
    .find({
      user: userId,
    })
    .populate("quizTopic", "title category totalQuestions")
    .sort({ createdAt: -1 });

  const quizzesAttended = attendedAttempts.map((attempt: any) => {
    const total = attempt.totalQuestions || 0;

    return {
      attemptId: attempt._id,
      quizTopicId: attempt.quizTopic?._id,
      quizTitle: attempt.quizTopic?.title,
      category: attempt.quizTopic?.category,

      score: attempt.score,
      totalQuestions: total,

      percentage: total > 0 ? Math.round((attempt.score / total) * 100) : 0,

      timeTaken: attempt.timeTaken,
      attemptedAt: attempt.createdAt,
    };
  });

  // 3. Get Quizzes Created By User
  const createdQuizzes = await quizTopicModel
    .find({
      createdBy: userId,
    })
    .sort({ createdAt: -1 });

  // 4. Get Participants Of Each Quiz
  const quizzesCreated = await Promise.all(
    createdQuizzes.map(async (quiz) => {
      const attempts = await quizAttemptModel
        .find({
          quizTopic: quiz._id,
        })
        .populate("user", "name email profile_image")
        .sort({ createdAt: -1 });

      const participants = attempts.map((attempt: any) => {
        const total = attempt.totalQuestions || 0;

        return {
          attemptId: attempt._id,

          userId: attempt.user?._id,
          name: attempt.user?.name,
          email: attempt.user?.email,
          profile_image: attempt.user?.profile_image,

          score: attempt.score,
          totalQuestions: total,

          percentage: total > 0 ? Math.round((attempt.score / total) * 100) : 0,

          timeTaken: attempt.timeTaken,
          attemptedAt: attempt.createdAt,
        };
      });

      return {
        quizTopicId: quiz._id,
        quizTitle: quiz.title,
        description: quiz.description,
        category: quiz.category,

        totalQuestions: quiz.totalQuestions,
        usersAttempted: quiz.usersAttempted,

        createdAt: quiz.createdAt,

        participants,
      };
    }),
  );

  // 5. Final Profile Response
  return {
    user,

    statistics: {
      totalQuizzesAttended: quizzesAttended.length,
      totalQuizzesCreated: quizzesCreated.length,
      totalAttemptsReceived: quizzesCreated.reduce(
        (sum, quiz) => sum + quiz.participants.length,
        0,
      ),
    },

    quizzesAttended,
    quizzesCreated,
  };
};

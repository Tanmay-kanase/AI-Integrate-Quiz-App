import { Schema, model, Document, Types } from "mongoose";

export interface IQuizAttempt extends Document {
  user: Types.ObjectId;
  quizTopic: Types.ObjectId;
  score: number; // number of correct answers
  totalQuestions: number; // snapshot at the time of attempt
  answers: {
    question: Types.ObjectId;
    selectedOption: number;
    isCorrect: boolean;
  }[];
  timeTaken?: number; // seconds, optional
  createdAt: Date;
}

const quizAttemptSchema = new Schema<IQuizAttempt>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  quizTopic: { type: Schema.Types.ObjectId, ref: "QuizTopic", required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  answers: [
    {
      question: { type: Schema.Types.ObjectId, ref: "Question" },
      selectedOption: Number,
      isCorrect: Boolean,
    },
  ],
  timeTaken: Number,
  createdAt: { type: Date, default: Date.now },
});
quizAttemptSchema.index({ quizTopic: 1, createdAt: -1 });
export default model<IQuizAttempt>("QuizAttempt", quizAttemptSchema);

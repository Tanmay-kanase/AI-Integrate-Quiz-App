import { Schema, model, Document, Types } from "mongoose";

export interface IQuizTopic extends Document {
  title: string;
  description?: string;
  category?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  totalQuestions: number;
}

const quizTopicSchema = new Schema<IQuizTopic>({
  title: { type: String, required: true, unique: true },
  description: String,
  category: String,
  totalQuestions: Number,
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default model<IQuizTopic>("QuizTopic", quizTopicSchema);

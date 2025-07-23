import { Schema, model, Document, Types } from "mongoose";

export interface IQuizTopic extends Document {
  title: string;
  description?: string;
  category?: string;
  time?: string;
  usersAttempted: number;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  totalQuestions: number;
}

const quizTopicSchema = new Schema<IQuizTopic>({
  title: { type: String, required: true, unique: true },
  description: String,
  category: String,
  time: { type: String }, // new field
  usersAttempted: { type: Number, default: 0 }, // new field
  totalQuestions: Number,
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default model<IQuizTopic>("QuizTopic", quizTopicSchema);

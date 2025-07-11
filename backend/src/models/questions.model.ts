import { Schema, model, Document, Types } from "mongoose";

// Interface for Question
export interface IQuestion extends Document {
  questionText: string;
  options: string[];
  correctAnswer: number; // index of the correct option
  explanation?: string;
  quizTopic: Types.ObjectId;
  createdBy?: Types.ObjectId;
  createdAt: Date;
}

// Schema
const questionSchema = new Schema<IQuestion>({
  questionText: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: [
      (val: string[]) => val.length >= 2,
      "At least 2 options required",
    ],
  },
  correctAnswer: {
    type: Number,
    required: true,
    validate: {
      validator: function (this: IQuestion, val: number) {
        return this.options && val >= 0 && val < this.options.length;
      },
      message: "Correct answer index must be within options range",
    },
  },
  explanation: { type: String },
  quizTopic: { type: Schema.Types.ObjectId, ref: "QuizTopic", required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default model<IQuestion>("Question", questionSchema);

import { Schema, model, Document, Types } from "mongoose";

interface IExample {
  inputDisplay: string;
  outputDisplay: string;
  explanation?: string;
}

interface ITestCase {
  input: string;
  output: string;
  hidden: boolean;
}

export interface ICodingAssessment extends Document {
  quizTopicId: Types.ObjectId;

  title: string;
  description: string;

  constraints: string[];

  examples: IExample[];

  testCases: ITestCase[];

  createdAt: Date;
}

const codingAssessmentSchema = new Schema<ICodingAssessment>({
  quizTopicId: {
    type: Schema.Types.ObjectId,
    ref: "QuizTopic",
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  constraints: [
    {
      type: String,
    },
  ],

  examples: [
    {
      inputDisplay: String,
      outputDisplay: String,
      explanation: String,
    },
  ],

  testCases: [
    {
      input: String,
      output: String,
      hidden: {
        type: Boolean,
        default: true,
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model<ICodingAssessment>(
  "CodingAssessment",
  codingAssessmentSchema,
);

import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema(
  {
    questionId: String,
    selected: String,
    correct: String,
    isCorrect: Boolean,
  },
  { _id: false }
);

const ExamResultSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    userExamCode: { type: String, required: true },
    userContact: { type: String },

    role: { type: String, required: true },

    score: { type: Number, required: true },
    total: { type: Number, required: true },

    answers: { type: [AnswerSchema], default: [] },

    startedAt: { type: Date, required: true },
    finishedAt: { type: Date, required: true },
    duration: { type: Number },
  },
  { timestamps: true }
);

export const ExamResult =
  mongoose.models.ExamResult ||
  mongoose.model("ExamResult", ExamResultSchema);
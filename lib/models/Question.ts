import mongoose, { Schema, models } from "mongoose";

const QuestionSchema = new Schema(
  {
    role: {
      type: String,
      required: true,
      index: true, // ค้นหาตามอาชีพเร็วขึ้น
    },
    question: {
      type: String,
      required: true,
    },
    choices: {
      type: [String],
      required: true,
    },
    correctIndex: {
      type: Number,
      required: true,
    },

    isDeleted: { type: Boolean, default: false }, // ไม่เอาข้อสอบที่ลบไป
  },
  {
    timestamps: true,
  }
);

// กัน error ตอน hot reload
export const Question =
  models.Question || mongoose.model("Question", QuestionSchema);
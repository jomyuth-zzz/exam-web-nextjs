import mongoose from "mongoose";

/* =========================
   คำตอบแต่ละข้อ
========================= */
const AnswerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    selected: { type: String, required: true },
    correct: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

/* =========================
   ผลการสอบ
========================= */
const ExamResultSchema = new mongoose.Schema(
  {
    /* =====================
       👤 ข้อมูลผู้สอบ
    ===================== */
    userId: { type: String }, // เผื่ออนาคตมีระบบ login

    userName: {
      type: String,
      required: true,
      trim: true,
    },

    userExamCode: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    // 👉 เก็บใน DB อย่างเดียว (ไม่จำเป็นต้องแสดงหน้า admin)
    userContact: {
      type: String,
      trim: true,
    },

    /* =====================
       🧑‍💼 อาชีพ
    ===================== */
    role: {
      type: String,
      required: true,
      index: true,
    },

    /* =====================
       📊 คะแนน
    ===================== */
    score: { type: Number, required: true },
    total: { type: Number, required: true },

    /* =====================
       📝 คำตอบ
    ===================== */
    answers: {
      type: [AnswerSchema],
      default: [],
    },

    /* =====================
       ⏱ เวลา
    ===================== */
    startedAt: { type: Date, required: true },
    finishedAt: { type: Date, required: true },

    // นาที (fallback จาก API)
    duration: { type: Number },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

export const ExamResult =
  mongoose.models.ExamResult ||
  mongoose.model("ExamResult", ExamResultSchema);
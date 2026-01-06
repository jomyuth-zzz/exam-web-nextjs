import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ExamResult } from "@/lib/models/ExamResult";

/* =========================
   GET: ดึงประวัติการสอบ
   /api/exam-result?role=&examCode=
========================= */
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const examCode = searchParams.get("examCode");

    const query: any = {};
    if (role) query.role = role;
    if (examCode) query.userExamCode = examCode;

    const results = await ExamResult.find(query)
      .select(
        "userName userExamCode userContact role score total startedAt finishedAt duration createdAt"
      )
      .sort({ createdAt: -1 }) // ใหม่ → เก่า
      .lean();

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("❌ GET EXAM RESULT ERROR:", error);
    return NextResponse.json(
      { success: false, error: "โหลดประวัติการสอบไม่สำเร็จ" },
      { status: 500 }
    );
  }
}

/* =========================
   POST: บันทึกผลสอบ
   /api/exam-result
========================= */
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      userName,
      userExamCode,
      userContact,
      role,
      score,
      total,
      answers,
      startedAt,
      finishedAt,
    } = body;

    /* =========================
       validate ขั้นต่ำ
    ========================= */
    if (!role || typeof score !== "number" || typeof total !== "number") {
      return NextResponse.json(
        { success: false, error: "ข้อมูลไม่ครบหรือไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    /* =========================
       fallback ข้อมูลผู้สอบ
    ========================= */
    const safeUserName =
      typeof userName === "string" && userName.trim()
        ? userName.trim()
        : "ไม่ระบุชื่อ";

    const safeExamCode =
      typeof userExamCode === "string" && userExamCode.trim()
        ? userExamCode.trim()
        : crypto.randomUUID();

    /* =========================
       เวลา (รองรับกรณีไม่ส่งมา)
    ========================= */
    const start = startedAt ? new Date(startedAt) : new Date();
    const end = finishedAt ? new Date(finishedAt) : new Date();

    const duration =
      end.getTime() > start.getTime()
        ? Math.ceil((end.getTime() - start.getTime()) / 60000)
        : 1;

    /* =========================
       answers (sanitize)
    ========================= */
    const safeAnswers = Array.isArray(answers)
      ? answers.map((a: any) => ({
          questionId: String(a?.questionId ?? ""),
          selected: String(a?.selected ?? ""),
          correct: String(a?.correct ?? ""),
          isCorrect: Boolean(a?.isCorrect),
        }))
      : [];

    /* =========================
       CREATE
    ========================= */
    const result = await ExamResult.create({
      userName: safeUserName,
      userExamCode: safeExamCode,
      userContact,
      role,
      score,
      total,
      answers: safeAnswers,
      startedAt: start,
      finishedAt: end,
      duration,
    });

    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ SAVE EXAM RESULT ERROR:", error);
    return NextResponse.json(
      { success: false, error: "บันทึกผลสอบไม่สำเร็จ" },
      { status: 500 }
    );
  }
}

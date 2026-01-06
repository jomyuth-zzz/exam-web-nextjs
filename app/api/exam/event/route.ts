import { NextResponse } from "next/server";
import { getIO } from "@/lib/socket"; // ฟังก์ชัน get io instance

/* =========================
   Anti-Cheat Event API
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      attemptId,
      examCode,
      role,
      type,
      time,
      meta,
      question,
    } = body;

    if (!attemptId || !examCode || !role || !type) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    /* =========================
       วิเคราะห์ความรุนแรง
    ========================= */
    let severity: "warning" | "cheat" = "warning";

    if (
      type === "devtools" ||
      type === "multi_tab"
    ) {
      severity = "cheat";
    }

    const log = {
      examCode,
      role,
      action: type,
      question: question ?? null,
      time: time ?? new Date().toISOString(),
      severity,
    };

    /* =========================
       ส่งเข้า Dashboard (Realtime)
    ========================= */
    const io = getIO();
    io.emit("anti-cheat:new", log);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ANTI-CHEAT ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
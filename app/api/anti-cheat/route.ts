import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, action, question, severity } = body;

    if (!sessionId || !action || !question || !severity) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const log = await prisma.antiCheatLog.create({
      data: {
        sessionId,
        action,
        question,
        severity,
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (err) {
    console.error("❌ Anti-Cheat API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
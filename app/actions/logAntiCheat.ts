"use server";

import { prisma } from "@/lib/prisma";

export async function logAntiCheat(
  sessionId: string,
  action: string,
  question: number,
  severity: "warning" | "cheat"
) {
  try {
    await prisma.antiCheatLog.create({
      data: {
        sessionId,
        action,
        question,
        severity,
      },
    });
  } catch (err) {
    console.error("❌ logAntiCheat error:", err);
  }
}
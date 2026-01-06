// app/actions/startExam.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function startExam({
  examCode,
  userName,
  role,
}: {
  examCode: string;
  userName: string;
  role: string;
}) {
  return prisma.examSession.create({
    data: {
      examCode,
      userName,
      role,
      status: "in_progress",
      startedAt: new Date(),
    },
  });
}
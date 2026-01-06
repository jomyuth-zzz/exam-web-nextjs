import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { examCode, role } = await req.json()

  const attempt = await prisma.examAttempt.create({
    data: { examCode, role }
  })

  return NextResponse.json({
    attemptId: attempt.id,
    startedAt: attempt.startedAt
  })
}
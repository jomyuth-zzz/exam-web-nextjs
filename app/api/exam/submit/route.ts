export async function POST(req: Request) {
  const { attemptId } = await req.json()

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId }
  })

  if (!attempt || attempt.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "Invalid submit" }, { status: 400 })
  }

  // TODO: grading logic
  await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      status: "SUBMITTED",
      endedAt: new Date()
    }
  })

  return NextResponse.json({ success: true })
}

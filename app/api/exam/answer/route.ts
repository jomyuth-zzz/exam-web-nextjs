export async function POST(req: Request) {
  const { attemptId, answer, index } = await req.json()

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId }
  })

  if (!attempt || attempt.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "Invalid attempt" }, { status: 400 })
  }

  // ❗ กันข้ามข้อ / refresh
  if (index !== attempt.currentIndex) {
    return NextResponse.json(
      { error: "Invalid question order" },
      { status: 403 }
    )
  }

  const updatedAnswers = {
    ...(attempt.answers || {}),
    [index]: answer
  }

  await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      answers: updatedAnswers,
      currentIndex: index + 1
    }
  })

  return NextResponse.json({ success: true })
}
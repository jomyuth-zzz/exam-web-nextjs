import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ExamAttempt from "@/models/ExamAttempt";

export async function GET() {
  await dbConnect();
  const data = await ExamAttempt.find()
    .sort({ createdAt: -1 })
    .limit(200);

  return NextResponse.json(data);
}
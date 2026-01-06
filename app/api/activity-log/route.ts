// app/api/activity-log/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ActivityLog } from "@/lib/models/ActivityLog";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    await ActivityLog.create({
      ...body,
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "log failed" }, { status: 500 });
  }
}

export async function GET() {
  await connectDB();
  const logs = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return NextResponse.json(logs);
}
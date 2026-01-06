import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Question } from "@/lib/models/Question";

/* =========================
   POST → เพิ่มข้อสอบ
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, question, choices, correctIndex } = body;

    // ✅ validate
    if (
      !role ||
      !question ||
      !Array.isArray(choices) ||
      choices.length !== 4 ||
      typeof correctIndex !== "number"
    ) {
      return NextResponse.json(
        { error: "choices ต้องมี 4 ตัวเลือก" },
        { status: 400 }
      );
    }

    if (correctIndex < 0 || correctIndex > 3) {
      return NextResponse.json(
        { error: "correctIndex ต้องอยู่ระหว่าง 0-3" },
        { status: 400 }
      );
    }

    await connectDB();

    const newQuestion = await Question.create({
      role,
      question,
      choices,
      correctIndex,
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "POST error" }, { status: 500 });
  }
}

/* =========================
   GET → ปกติ / ถังขยะ
========================= */
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const trash = searchParams.get("trash");
    const query: any = {};

    if (trash === "true") {
      query.isDeleted = true;
    } else {
      query.$or = [
        { isDeleted: false },
        { isDeleted: { $exists: false } },
      ];
    }

    if (role) query.role = role;

    const questions = await Question.find(query).sort({ updatedAt: -1 });
    return NextResponse.json(questions);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "GET error" }, { status: 500 });
  }
}

/* =========================
   PUT → แก้ไข / กู้คืน
========================= */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, restore, question, choices, correctIndex } = body;

    if (!id) {
      return NextResponse.json({ error: "ไม่พบ id" }, { status: 400 });
    }

    if (choices && (!Array.isArray(choices) || choices.length !== 4)) {
      return NextResponse.json(
        { error: "choices ต้องมี 4 ตัวเลือก" },
        { status: 400 }
      );
    }

    if (
      typeof correctIndex === "number" &&
      (correctIndex < 0 || correctIndex > 3)
    ) {
      return NextResponse.json(
        { error: "correctIndex ต้องอยู่ระหว่าง 0-3" },
        { status: 400 }
      );
    }

    await connectDB();

    // ♻️ กู้คืนจากถังขยะ
    if (restore === true) {
      await Question.findByIdAndUpdate(id, { isDeleted: false });
      return NextResponse.json({ success: true });
    }

    // ✏️ แก้ไขข้อสอบ
    const updated = await Question.findByIdAndUpdate(
      id,
      { question, choices, correctIndex },
      { new: true }
    );

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "PUT error" }, { status: 500 });
  }
}

/* =========================
   DELETE → soft / ถาวร
========================= */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const permanent = searchParams.get("permanent");

    if (!id) {
      return NextResponse.json({ error: "ไม่พบ id" }, { status: 400 });
    }

    await connectDB();

    if (permanent === "true") {
      await Question.deleteOne({ _id: id });
      return NextResponse.json({ success: true, permanent: true });
    }

    await Question.updateOne(
      { _id: id },
      { $set: { isDeleted: true } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "DELETE error" }, { status: 500 });
  }
}
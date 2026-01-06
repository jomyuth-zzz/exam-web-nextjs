"use client";

import { useEffect, useState } from "react";

type Question = {
  _id: string;
  role: string;
  question: string;
  choices: string[];
  correctIndex: number;
};

const rolesMap: Record<string, string> = {
  "store-manager": "ผู้จัดการหน้าร้าน",
  "warehouse-manager": "ผู้จัดการคลังพัสดุ",
  "procurement-manager": "ผู้จัดการจัดซื้อ",
  "account-manager": "ผู้จัดการบัญชี",
  "hr-manager": "ผู้จัดการบุคคล",
  "finance-manager": "ผู้จัดการการเงิน",
  "system-integration": "ที่ปรึกษา / นักวางระบบ",
};

export default function TrashPage() {
  const [questions, setQuestions] = useState<Question[]>([]);

  const loadTrash = async () => {
    const res = await fetch("/api/questions?trash=true");
    setQuestions(await res.json());
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const restoreQuestion = async (id: string) => {
    await fetch("/api/questions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, restore: true }),
    });

    loadTrash();
  };

  const deleteForever = async (id: string) => {
    if (!confirm("⚠️ ลบถาวร ไม่สามารถกู้คืนได้")) return;

    await fetch(`/api/questions?id=${id}&permanent=true`, {
      method: "DELETE",
    });

    loadTrash();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow space-y-6">
        <h1 className="text-3xl font-bold text-red-600">
          🗑️ ถังขยะข้อสอบ
        </h1>

        {questions.length === 0 && (
          <p className="text-gray-500">ไม่มีข้อสอบในถังขยะ</p>
        )}

        {questions.map((q, i) => (
          <div
            key={q._id}
            className="border border-red-200 bg-red-50 p-4 rounded space-y-3"
          >
            {/* อาชีพ */}
            <p className="text-sm text-red-700 font-semibold">
              🧑‍💼 อาชีพ: {rolesMap[q.role] || q.role}
            </p>

            {/* คำถาม */}
            <p className="font-semibold text-gray-900">
              {i + 1}. {q.question}
            </p>

            {/* ตัวเลือก */}
            <ul className="list-disc pl-5 space-y-1">
              {q.choices.map((choice, idx) => (
                <li
                  key={idx}
                  className={
                    idx === q.correctIndex
                      ? "text-green-700 font-semibold"
                      : "text-gray-800"
                  }
                >
                  {choice}
                  {idx === q.correctIndex && " ✅ (คำตอบที่ถูก)"}
                </li>
              ))}
            </ul>

            {/* ปุ่ม */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => restoreQuestion(q._id)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
              >
                ♻️ กู้คืน
              </button>

              <button
                onClick={() => deleteForever(q._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                ❌ ลบถาวร
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
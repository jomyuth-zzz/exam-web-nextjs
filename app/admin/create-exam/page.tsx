"use client"

import { useEffect, useState } from "react"

type Question = {
  _id: string
  role: string
  question: string
  choices: string[]
  correctIndex: number
}

const roles = [
  { slug: "store-manager", name: "ผู้จัดการหน้าร้าน" },
  { slug: "warehouse-manager", name: "ผู้จัดการคลังพัสดุ" },
  { slug: "procurement-manager", name: "ผู้จัดการจัดซื้อ" },
  { slug: "account-manager", name: "ผู้จัดการบัญชี" },
  { slug: "hr-manager", name: "ผู้จัดการบุคคล" },
  { slug: "finance-manager", name: "ผู้จัดการการเงิน" },
  { slug: "developer", name: "นักพัฒนาระบบ" },
  { slug: "system-integration", name: "ผู้ที่ปรึกษา/นักวางระบบ" },
]

export default function CreateExamPage() {
  const [role, setRole] = useState("")
  const [question, setQuestion] = useState("")
  const [choices, setChoices] = useState(["", "", "", ""])
  const [correctIndex, setCorrectIndex] = useState<number | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [editId, setEditId] = useState<string | null>(null)

  /* โหลดข้อสอบตามอาชีพ */
  useEffect(() => {
    if (!role) return

    fetch(`/api/questions?role=${role}`)
      .then(res => res.json())
      .then(setQuestions)
  }, [role])

  /* เพิ่ม / แก้ไข */
  const saveQuestion = async () => {
    if (!role || !question || correctIndex === null) return

    const payload = {
      role,
      question,
      choices,
      correctIndex,
    }

    if (editId) {
      await fetch("/api/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, ...payload }),
      })
    } else {
      await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }

    resetForm()
    reloadQuestions()
  }

  const reloadQuestions = async () => {
    const res = await fetch(`/api/questions?role=${role}`)
    setQuestions(await res.json())
  }

  const editQuestion = (q: Question) => {
    setQuestion(q.question)
    setChoices(q.choices)
    setCorrectIndex(q.correctIndex)
    setEditId(q._id)
  }

  const resetForm = () => {
    setQuestion("")
    setChoices(["", "", "", ""])
    setCorrectIndex(null)
    setEditId(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow space-y-6">
        <h1 className="text-3xl font-bold text-black">
          จัดการข้อสอบตามอาชีพ
        </h1>

        {/* เลือกอาชีพ */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border rounded text-black"
        >
          <option value="">-- เลือกอาชีพ --</option>
          {roles.map((r) => (
            <option key={r.slug} value={r.slug}>
              {r.name}
            </option>
          ))}
        </select>

        {role && (
          <>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="พิมพ์คำถาม"
              className="w-full p-2 border rounded text-black"
            />

            {choices.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={c}
                  onChange={(e) => {
                    const copy = [...choices]
                    copy[i] = e.target.value
                    setChoices(copy)
                  }}
                  placeholder={`ตัวเลือก ${i + 1}`}
                  className="flex-1 p-2 border rounded text-black"
                />
                <input
                  type="radio"
                  checked={correctIndex === i}
                  onChange={() => setCorrectIndex(i)}
                />
              </div>
            ))}

            <div className="flex gap-3">
              <button
                onClick={saveQuestion}
                className={`px-4 py-2 rounded text-white ${
                  editId ? "bg-yellow-500" : "bg-green-600"
                }`}
              >
                {editId ? "บันทึกการแก้ไข" : "เพิ่มคำถาม"}
              </button>

              {editId && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  ยกเลิก
                </button>
              )}
            </div>
          </>
        )}

        {/* รายการข้อสอบ */}
        <div className="border-t pt-4 space-y-3">
          <h2 className="text-xl font-semibold text-black">
            รายการข้อสอบ
          </h2>

          {questions.map((q, i) => (
            <div key={q._id} className="p-4 border rounded space-y-2">
              <p className="font-semibold text-black">
                {i + 1}. {q.question}
              </p>

              <ul className="list-disc pl-5">
                {q.choices.map((c, idx) => (
                  <li
                    key={idx}
                    className={
                      idx === q.correctIndex
                        ? "text-green-600 font-semibold"
                        : "text-black"
                    }
                  >
                    {c}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => editQuestion(q)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                แก้ไข
              </button>

              <button
                onClick={async () => {
                  if (!confirm("ต้องการลบข้อสอบข้อนี้หรือไม่?")) return;

                  const res = await fetch(`/api/questions?id=${q._id}`, {
                    method: "DELETE",
                  });

                  console.log("DELETE status:", res.status);

                  await reloadQuestions();
                }}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                ลบ
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
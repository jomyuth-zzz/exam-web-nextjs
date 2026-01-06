"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { roles } from "@/lib/roles";
import UserBadge from "@/components/UserBadge";

type MiniGameType = "match" | "tower" | "none";

/* ===== utils ===== */
const generateExamCode = () =>
  Math.floor(10000000 + Math.random() * 90000000).toString();

export default function ExamRolePage() {
  const router = useRouter();
  const params = useParams();

  const role = typeof params.role === "string" ? params.role : "";
  const roleData = roles.find((r) => r.id === role);

  const [miniGameType, setMiniGameType] =
    useState<MiniGameType>("match");

  const [miniGameEvery, setMiniGameEvery] = useState<number>(3);

  if (!roleData) {
    return <p className="text-red-500 p-6">ไม่พบอาชีพนี้</p>;
  }

  const handleStart = () => {
    const examCode = generateExamCode();
    const sessionId = crypto.randomUUID();

    /* =========================
       RESET OLD EXAM STATE
    ========================= */
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("quiz-progress-") ||
        key === "exam-session" ||
        key === "exam-mini-game-config"
      ) {
        localStorage.removeItem(key);
      }
    });

    /* =========================
       Mini-game config
    ========================= */
    localStorage.setItem(
      "exam-mini-game-config",
      JSON.stringify({
        enabled: miniGameType !== "none",
        type: miniGameType,
        every: miniGameEvery,
        nextMiniGameAt: miniGameEvery,
      })
    );

    /* =========================
       Exam session
    ========================= */
    localStorage.setItem(
      "exam-session",
      JSON.stringify({
        sessionId,
        examCode,
        role,
        startedAt: new Date().toISOString(),
        currentQuestionIndex: 0,
      })
    );

    router.push(`/exam/${role}/quiz`);
  };

  return (
    <>
      <UserBadge />

      <div className="p-6 space-y-6 text-black max-w-xl">
        <h1 className="text-3xl font-bold">{roleData.name}</h1>

        <p className="text-gray-700">{roleData.description}</p>

        {/* ===== Mini-game selector ===== */}
        <div className="bg-gray-100 p-4 rounded space-y-4">
          <h2 className="font-semibold text-lg">
            🎮 เลือกรูปแบบ Mini-game
          </h2>

          <div className="space-y-2">
            <button
              onClick={() => setMiniGameType("match")}
              className={`w-full p-3 rounded border text-left ${
                miniGameType === "match"
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              🎯 มินิเกม: จับคู่ PO
            </button>

            <button
              onClick={() => setMiniGameType("tower")}
              className={`w-full p-3 rounded border text-left ${
                miniGameType === "tower"
                  ? "bg-orange-600 text-white"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              🏰 Tower Defense
            </button>

            <button
              onClick={() => setMiniGameType("none")}
              className={`w-full p-3 rounded border text-left ${
                miniGameType === "none"
                  ? "bg-gray-600 text-white"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              ⏭ ไม่เล่น Mini-game
            </button>
          </div>

          {miniGameType !== "none" && (
            <div className="space-y-1 pt-2">
              <label className="block text-sm">
                Mini-game โผล่ทุกกี่ข้อ
              </label>

              <select
                value={miniGameEvery}
                onChange={(e) =>
                  setMiniGameEvery(Number(e.target.value))
                }
                className="border rounded p-2 w-[200px]"
              >
                <option value={3}>ทุก 3 ข้อ</option>
                <option value={5}>ทุก 5 ข้อ</option>
                <option value={10}>ทุก 10 ข้อ</option>
              </select>
            </div>
          )}

          <p className="text-xs text-gray-500">
            * Mini-game ไม่มีผลต่อคะแนนสอบ
          </p>
        </div>

        <button
          onClick={handleStart}
          className="inline-block bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
        >
          ▶ เริ่มทำข้อสอบ
        </button>
      </div>
    </>
  );
}

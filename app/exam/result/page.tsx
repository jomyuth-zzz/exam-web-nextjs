"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserBadge from "@/components/UserBadge";
import { roles } from "@/lib/roles";

type ExamResult = {
  score: number;
  total: number;
  role: string;
};

export default function ExamResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     โหลดผลสอบล่าสุดจาก DB
  ========================= */
  useEffect(() => {
    const loadResult = async () => {
      try {
        const userRaw = localStorage.getItem("exam-user");
        if (!userRaw) {
          router.replace("/");
          return;
        }

        const user = JSON.parse(userRaw);
        if (!user.examCode) {
          router.replace("/");
          return;
        }

        const res = await fetch(
          `/api/exam-result?examCode=${user.examCode}`
        );

        if (!res.ok) throw new Error("load result failed");

        const json = await res.json();
        const latest = json?.data?.[0];

        if (!latest) {
          router.replace("/");
          return;
        }

        setResult({
          score: latest.score,
          total: latest.total,
          role: latest.role,
        });
      } catch (e) {
        console.error(e);
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [router]);

  if (loading) return null;
  if (!result) return null;

  /* =========================
     แปลง role → ชื่อไทย
  ========================= */
  const roleName =
    roles.find((r) => r.id === result.role)?.name || result.role;

  /* =========================
     กลับหน้าแรก
  ========================= */
  const handleBack = () => {
    localStorage.removeItem("exam-anti-cheat-log");
    router.push("/");
  };

  return (
    <>
      <UserBadge />

      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow text-center space-y-4 text-black w-[360px]">
          <h1 className="text-2xl font-bold">ผลการสอบ 🎉</h1>

          <p className="text-gray-600">
            อาชีพที่สอบ:{" "}
            <span className="font-semibold">{roleName}</span>
          </p>

          <p className="text-xl">
            คะแนน:{" "}
            <span className="font-bold">
              {result.score} / {result.total}
            </span>
          </p>

          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    </>
  );
}
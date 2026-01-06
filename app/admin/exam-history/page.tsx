"use client";

import { useEffect, useMemo, useState } from "react";
import { roles } from "@/lib/roles";

/* =========================
   Types
========================= */
type ExamHistory = {
  _id: string;
  userId?: string;
  userExamCode?: string;
  userName?: string;
  role: string;
  score: number;
  total: number;
  startedAt: string;
  finishedAt: string;
  createdAt: string;
  duration?: number;
};

/* =========================
   Role Map
========================= */
const roleMap: Record<string, string> = Object.fromEntries(
  roles.map((r) => [r.id, r.name])
);

/* =========================
   Utils
========================= */
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("th-TH");

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

/* =========================
   Page
========================= */
export default function AdminExamHistoryPage() {
  const [data, setData] = useState<ExamHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [search, setSearch] = useState("");

  /* =========================
     Load data
  ========================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/exam-result");
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");

        const json = await res.json();
        setData(Array.isArray(json) ? json : json.data || []);
      } catch {
        setError("ไม่สามารถโหลดข้อมูลการสอบได้");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* =========================
     Filter
  ========================= */
  const results = useMemo(() => {
    return data.filter((h) => {
      const date = h.startedAt?.slice(0, 10);
      const keyword = search.toLowerCase();

      if (selectedDate && date !== selectedDate) return false;
      if (selectedRole && h.role !== selectedRole) return false;

      if (search) {
        const name = h.userName?.toLowerCase() || "";
        const code = h.userExamCode?.toLowerCase() || "";
        if (!name.includes(keyword) && !code.includes(keyword)) {
          return false;
        }
      }

      return true;
    });
  }, [data, selectedDate, selectedRole, search]);

  /* =========================
     Export CSV
  ========================= */
  const exportCSV = () => {
    if (results.length === 0) return;

    const header = [
      "ชื่อผู้สอบ",
      "เลขที่สอบ",
      "อาชีพ",
      "คะแนน",
      "เต็ม",
      "วันที่สอบ",
      "เวลาเริ่ม",
      "เวลาจบ",
      "ระยะเวลา (นาที)",
    ];

    const rows = results.map((h) => [
      h.userName ?? "",
      h.userExamCode ?? "",
      roleMap[h.role] ?? h.role,
      h.score,
      h.total,
      formatDate(h.startedAt),
      formatTime(h.startedAt),
      formatTime(h.finishedAt),
      h.duration ?? "",
    ]);

    const csv =
      [header, ...rows]
        .map((r) => r.map((v) => `"${v}"`).join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "exam-history.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">
        ประวัติการสอบ (Admin)
      </h1>

      {/* ===== Filters ===== */}
      <div className="bg-white text-black p-4 rounded shadow space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block font-semibold mb-1">
              วันที่สอบ
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              อาชีพ
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">ทั้งหมด</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block font-semibold mb-1">
              ค้นหาชื่อ / เลขที่สอบ
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="เช่น สมชาย / EX1234"
              className="border p-2 rounded w-full"
            />
          </div>

          <button
            onClick={exportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            📤 Export CSV
          </button>
        </div>
      </div>

      {/* ===== Results ===== */}
      <div className="bg-white text-black p-4 rounded shadow">
        {loading && <p>⏳ กำลังโหลดข้อมูล...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && results.length === 0 && (
          <p className="text-gray-500">ไม่พบข้อมูล</p>
        )}

        <div className="space-y-4">
          {results.map((h) => (
            <div
              key={h._id}
              className="border p-4 rounded flex justify-between"
            >
              <div>
                <p className="font-semibold text-lg">
                  {h.userName || "ไม่ระบุชื่อ"}
                </p>
                <p className="text-sm text-gray-600">
                  เลขที่สอบ: {h.userExamCode || "-"}
                </p>
                <p className="text-sm">
                  อาชีพ: {roleMap[h.role] ?? h.role}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(h.startedAt)} |{" "}
                  {formatTime(h.startedAt)} –{" "}
                  {formatTime(h.finishedAt)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold">
                  {h.score} / {h.total}
                </p>
                <p className="text-sm text-gray-500">
                  {Math.round((h.score / h.total) * 100)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
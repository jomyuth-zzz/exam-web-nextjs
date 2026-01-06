"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { roles } from "@/lib/roles";

type UserInfo = {
  name: string;
  examCode: string;
  contact: string;
  isAdmin: boolean;
};

export default function HomePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeMessage, setActiveMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    examCode: "",
    contact: "",
  });

  /* ======================
     โหลดข้อมูลผู้ใช้
  ====================== */
  useEffect(() => {
    const saved = localStorage.getItem("exam-user");
    if (saved) {
      const parsed: UserInfo = JSON.parse(saved);
      setUser(parsed);
      setForm({
        name: parsed.name,
        examCode: parsed.examCode,
        contact: parsed.contact,
      });
    }
  }, []);

  /* ======================
     บันทึกข้อมูล
  ====================== */
  const saveUser = () => {
    const { name, examCode, contact } = form;

    if (!name || !examCode || !contact) {
      alert("กรอกข้อมูลให้ครบ");
      return;
    }

    if (!/^\d{8}$/.test(examCode)) {
      alert("รหัสสอบต้องเป็นตัวเลข 8 หลัก");
      return;
    }

    const isAdmin =
      name.toLowerCase().startsWith("admin") &&
      examCode === "12345678";

    const userData: UserInfo = {
      name,
      examCode,
      contact,
      isAdmin,
    };

    localStorage.setItem("exam-user", JSON.stringify(userData));
    setUser(userData);
    setIsEditing(false);
  };

  return (
    <section className="relative w-full max-w-[1200px] mx-auto">

      {/* ===== ปุ่ม Admin ===== */}
      {user?.isAdmin && (
        <Link
          href="/admin"
          className="absolute top-4 left-4 z-50 bg-red-600 text-white px-4 py-2 rounded shadow"
        >
          Admin
        </Link>
      )}

      {/* ===== Badge ผู้ใช้ (ทุกกรณี) ===== */}
      {user && (
        <div className="fixed top-4 right-4 z-50 bg-white text-black p-3 rounded shadow">
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm">รหัสสอบ: {user.examCode}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 text-xs mt-1 underline"
          >
            แก้ไขข้อมูล
          </button>
        </div>
      )}

      <Image
        src="/bg-main-new.png"
        alt="Exam System"
        width={1200}
        height={2000}
        priority
        className="w-full h-auto"
      />

      <div className="absolute inset-0 pointer-events-none">

        {/* ===== ฟอร์ม (สมัคร / แก้ไข) ===== */}
        {(!user || isEditing) && (
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[420px]
            bg-white p-4 rounded-xl shadow pointer-events-auto">

            <h2 className="font-bold mb-3 text-center">
              {user ? "แก้ไขข้อมูลผู้เข้าสอบ" : "กรอกข้อมูลก่อนเข้าสอบ"}
            </h2>

            <input
              value={form.name}
              placeholder="ชื่อจริง"
              className="border p-2 w-full mb-2"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              value={form.examCode}
              placeholder="รหัสสอบ (8 หลัก)"
              className="border p-2 w-full mb-2"
              onChange={(e) => setForm({ ...form, examCode: e.target.value })}
            />
            <input
              value={form.contact}
              placeholder="ช่องทางติดต่อ"
              className="border p-2 w-full mb-3"
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
            />

            <div className="flex gap-2">
              <button
                onClick={saveUser}
                className="flex-1 bg-blue-600 text-white py-2 rounded"
              >
                บันทึก
              </button>

              {user && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-400 text-white py-2 rounded"
                >
                  ยกเลิก
                </button>
              )}
            </div>
          </div>
        )}

        {/* ===== ปุ่มอาชีพ ===== */}
        <div className="absolute top-[24.8%] left-1/2 -translate-x-1/2 flex gap-7 pointer-events-auto">
          {roles.map((role) =>
            user ? (
              <Link key={role.id} href={`/exam/${role.id}`}>
                <TopButton label={role.name} />
              </Link>
            ) : (
              <TopButton key={role.id} label={role.name} disabled />
            )
          )}
        </div>

        {/* ===== ปุ่มซ้าย ===== */}
        <div className="absolute top-[28.5%] left-[3.85%] flex flex-col gap-3 pointer-events-auto">
          <SideButton label="คู่มือการใช้งาน" onClick={() =>
            setActiveMessage("อธิบายวิธีการใช้งานระบบ ตั้งแต่เริ่มต้นจนจบการสอบ")
          } />
          <SideButton label="การประเมินผล" onClick={() =>
            setActiveMessage("ระบบจะประเมินผลจากคะแนนรวมและความถูกต้องของคำตอบ")
          } />
          <SideButton label="ข้อควรทราบ" onClick={() =>
            setActiveMessage("ไม่สามารถย้อนกลับไปแก้คำตอบที่ตอบไปแล้วได้")
          } />
        </div>

        {activeMessage && (
          <div className="absolute top-[28.5%] left-[25%] w-[860px] h-[174px]
            bg-sky-200 text-blue-900 px-5 py-4 rounded-xl shadow-lg text-[18px] flex">
            {activeMessage}
          </div>
        )}
      </div>
    </section>
  );
}

/* ======================
   UI Components
====================== */

function TopButton({ label, disabled }: { label: string; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      className={`h-[50px] min-w-[135px] px-[18px] text-[14px]
        font-semibold rounded-[6px] shadow-sm transition
        ${disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-gray-200 text-black hover:bg-gray-300"}`}
    >
      {label}
    </button>
  );
}

function SideButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-[50px] w-[240px] px-[22px] bg-gray-200 text-black
        text-[15px] font-semibold text-left rounded-[8px]
        shadow-sm hover:bg-gray-300 transition"
    >
      {label}
    </button>
  );
}
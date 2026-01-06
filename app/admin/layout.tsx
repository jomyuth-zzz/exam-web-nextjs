"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import UserBadge from "@/components/UserBadge";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  /* =========================
     ตรวจว่าเป็น admin จริงไหม
  ========================= */
  useEffect(() => {
    const userRaw = localStorage.getItem("exam-user");

    if (!userRaw) {
      router.replace("/not-found");
      return;
    }

    const user = JSON.parse(userRaw);

    if (!user.isAdmin) {
      router.replace("/not-found");
      return;
    }

    setChecked(true);
  }, [router]);

  if (!checked) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* แสดงชื่อ + รหัสสอบ มุมขวาบน (ทุกหน้า admin) */}
      <UserBadge />

      {/* Navbar admin */}
      <nav className="bg-gray-800 px-6 py-4 flex gap-6">
        <Link href="/admin/dashboard">Dashboard</Link>
        <Link href="/admin/create-exam">จัดการข้อสอบ</Link>
        <Link href="/admin/trash">ถังขยะข้อสอบ</Link>
        <Link href="/admin/exam-history">ประวัติการสอบ</Link>
        <Link href="/">กลับหน้าเว็บ</Link>
      </nav>

      <main className="p-6">{children}</main>
    </div>
  );
}
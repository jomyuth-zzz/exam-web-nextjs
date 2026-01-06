"use client";

import { useEffect, useState } from "react";

type UserInfo = {
  name: string;
  examCode: string;
};

export default function UserBadge() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("exam-user");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser({
        name: parsed.name,
        examCode: parsed.examCode,
      });
    }
  }, []);

  if (!user) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-white text-black p-3 rounded shadow">
      <p className="font-semibold">{user.name}</p>
      <p className="text-sm">รหัสสอบ: {user.examCode}</p>
    </div>
  );
}

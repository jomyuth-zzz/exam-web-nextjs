"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  children: (onFinish: () => void) => ReactNode;
};

export default function MiniGameModal({
  open,
  onClose,
  children,
}: Props) {
  const [timeLeft, setTimeLeft] = useState(20);

  const closedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  /* =========================
     เปิดมินิเกม → reset timer
  ========================= */
  useEffect(() => {
    if (!open) return;

    closedRef.current = false;
    setTimeLeft(20);

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [open]);

  /* =========================
     หมดเวลา → ปิดเกมอัตโนมัติ
  ========================= */
  useEffect(() => {
    if (!open) return;
    if (timeLeft > 0) return;
    if (closedRef.current) return;

    closedRef.current = true;
    onClose();
  }, [timeLeft, open, onClose]);

  /* =========================
     ให้เกมเรียกเมื่อเล่นเสร็จ
  ========================= */
  const finishGame = () => {
    if (closedRef.current) return;

    closedRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white text-black w-[420px] rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg">🎮 Mini Game</h2>
          <span className="text-sm text-gray-500">
            ⏱ {timeLeft}s
          </span>
        </div>

        {/* ส่ง callback ให้เกม */}
        {children(finishGame)}

        <button
          onClick={finishGame}
          className="w-full mt-4 bg-gray-300 hover:bg-gray-400 rounded p-2 transition"
        >
          ข้ามมินิเกม
        </button>
      </div>
    </div>
  );
}

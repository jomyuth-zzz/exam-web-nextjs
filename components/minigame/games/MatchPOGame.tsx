"use client";

import { useEffect, useState } from "react";

type Pair = {
  po: string;
  inv: string;
};

type Props = {
  onFinish: () => void;
};

const BASE_PAIRS: Pair[] = [
  { po: "🍔", inv: "Hamburger" },
  { po: "🍕", inv: "Pizza" },
  { po: "🍣", inv: "Sushi" },
  { po: "🍩", inv: "Donut" },
  { po: "🍫", inv: "Chocolate" },
  { po: "🍦", inv: "Ice Cream" },
];

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function MatchPOGame({ onFinish }: Props) {
  const [poList, setPoList] = useState<Pair[]>([]);
  const [invList, setInvList] = useState<Pair[]>([]);
  const [selectedPO, setSelectedPO] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);

  useEffect(() => {
    const shuffled = shuffle(BASE_PAIRS);
    setPoList(shuffled);
    setInvList(shuffle(shuffled));
    setMatched([]);
    setSelectedPO(null);
  }, []);

  // ✅ ถ้าจับคู่ครบ → ปิด mini-game เอง
  useEffect(() => {
    if (matched.length === BASE_PAIRS.length) {
      setTimeout(onFinish, 500);
    }
  }, [matched, onFinish]);

  const handleSelectPO = (po: string) => {
    setSelectedPO(po);
  };

  const handleSelectINV = (inv: string) => {
    if (!selectedPO) return;

    const correct = BASE_PAIRS.find(
      (p) => p.po === selectedPO && p.inv === inv
    );

    if (correct) {
      setMatched((prev) => [...prev, selectedPO]);
    }

    setSelectedPO(null);
  };

  return (
    <div className="space-y-3">
      <p className="font-medium text-center">
        🍽️ จับคู่ PO (อิโมจิ) กับชื่ออาหาร
      </p>

      <div className="grid grid-cols-3 gap-2">
        {poList.map((p) => (
          <button
            key={p.po}
            onClick={() => handleSelectPO(p.po)}
            disabled={matched.includes(p.po)}
            className={`border rounded p-3 text-lg
              ${selectedPO === p.po ? "bg-blue-200" : ""}
              ${
                matched.includes(p.po)
                  ? "bg-green-200 cursor-default"
                  : "hover:bg-gray-100"
              }
            `}
          >
            {p.po}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        {invList.map((p) => (
          <button
            key={p.inv}
            onClick={() => handleSelectINV(p.inv)}
            className="border rounded p-2 text-sm hover:bg-gray-100"
          >
            {p.inv}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 text-center">
        (Mini-game นี้ไม่มีผลต่อคะแนน)
      </p>
    </div>
  );
}
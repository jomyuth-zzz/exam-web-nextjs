"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { shuffle } from "@/lib/shuffle";
import UserBadge from "@/components/UserBadge";

import MiniGameModal from "@/components/minigame/MiniGameModal";
import MatchPOGame from "@/components/minigame/games/MatchPOGame";
import TowerDefenseGame from "@/components/minigame/games/TowerDefenseGame";

/* =========================
   CONFIG
========================= */
const EXAM_DURATION_MIN = 100;
const EXAM_DURATION_MS = EXAM_DURATION_MIN * 60 * 1000;

/* =========================
   TYPES
========================= */
type Question = {
  _id: string;
  question: string;
  choices: string[];
  correctIndex: number;
};

type Answer = {
  questionId: string;
  selected: string;
  correct: string;
  isCorrect: boolean;
};

type MiniGameConfig = {
  enabled: boolean;
  type: "match" | "tower";
  every: number;
  nextMiniGameAt: number;
};

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = typeof params.role === "string" ? params.role : "";

  const finishedRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const answersRef = useRef<Record<string, Answer>>({});
  const pendingNextIndexRef = useRef<number | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_MS);

  /* ===== MINI GAME ===== */
  const [showMiniGame, setShowMiniGame] = useState(false);
  const miniGameConfigRef = useRef<MiniGameConfig | null>(null);

  /* =========================
     LOAD MINI GAME CONFIG
  ========================= */
  useEffect(() => {
    const raw = localStorage.getItem("exam-mini-game-config");
    miniGameConfigRef.current = raw
      ? JSON.parse(raw)
      : { enabled: false, type: "match", every: 999, nextMiniGameAt: 999 };
  }, []);

  /* =========================
     LOAD QUESTIONS
  ========================= */
  useEffect(() => {
    if (!roleId) return;

    (async () => {
      try {
        const res = await fetch(`/api/questions?role=${roleId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setQuestions(shuffle(data).slice(0, 10));
      } catch {
        setQuestions([]);
      }
    })();
  }, [roleId]);

  /* =========================
     TIMER
  ========================= */
  useEffect(() => {
    if (showMiniGame || timerRef.current) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1000) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          submitExam(true);
          return 0;
        }
        return t - 1000;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [showMiniGame]);

  /* =========================
     SUBMIT EXAM
  ========================= */
  const submitExam = useCallback(
    async (timeUp = false) => {
      if (finishedRef.current) return;
      finishedRef.current = true;

      if (timerRef.current) clearInterval(timerRef.current);

      const answers = Object.values(answersRef.current);
      const score = answers.filter((a) => a.isCorrect).length;
      const user = JSON.parse(localStorage.getItem("exam-user") || "{}");

      await fetch("/api/exam-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: user.name,
          userExamCode: user.examCode,
          userContact: user.contact,
          role: roleId,
          score,
          total: questions.length,
          answers,
          timeUp,
        }),
      });

      router.replace("/exam/result");
    },
    [questions.length, roleId, router]
  );

  /* =========================
     NEXT QUESTION
  ========================= */
  const goNext = (nextIndex: number, answer: Answer) => {
    answersRef.current[answer.questionId] = answer;

    const cfg = miniGameConfigRef.current;
    if (cfg?.enabled && nextIndex === cfg.nextMiniGameAt) {
      cfg.nextMiniGameAt += cfg.every;
      pendingNextIndexRef.current = nextIndex;
      setShowMiniGame(true);
      return;
    }

    if (nextIndex < questions.length) {
      setCurrent(nextIndex);
    } else {
      submitExam(false);
    }
  };

  /* =========================
     MINI GAME FINISH HANDLER
  ========================= */
  const handleMiniGameFinish = () => {
    setShowMiniGame(false);

    const nextIndex = pendingNextIndexRef.current;
    pendingNextIndexRef.current = null;

    if (nextIndex === null) return;

    if (nextIndex < questions.length) {
      setCurrent(nextIndex);
    } else {
      submitExam(false);
    }
  };

  const q = questions[current];
  const choices = useMemo(() => (q ? shuffle([...q.choices]) : []), [q]);

  if (!q) return <p className="p-10">⏳ กำลังโหลด...</p>;

  return (
    <>
      <UserBadge />

      <MiniGameModal open={showMiniGame} onClose={handleMiniGameFinish}>
        {(finish) =>
          miniGameConfigRef.current?.type === "tower" ? (
            <TowerDefenseGame onFinish={handleMiniGameFinish} />
          ) : (
            <MatchPOGame onFinish={handleMiniGameFinish} />
          )
        }
      </MiniGameModal>

      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow-md w-[500px] space-y-4">
          <div className="flex justify-between">
            <h2>
              ข้อที่ {current + 1} / {questions.length}
            </h2>
            <span>
              ⏳ {Math.floor(timeLeft / 60000)}:
              {(Math.floor(timeLeft / 1000) % 60)
                .toString()
                .padStart(2, "0")}
            </span>
          </div>

          <p>{q.question}</p>

          {choices.map((c, i) => (
            <button
              key={i}
              onClick={() =>
                goNext(current + 1, {
                  questionId: q._id,
                  selected: c,
                  correct: q.choices[q.correctIndex],
                  isCorrect: c === q.choices[q.correctIndex],
                })
              }
              className="w-full bg-gray-800 text-white p-3 rounded"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

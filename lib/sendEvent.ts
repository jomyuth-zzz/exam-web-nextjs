import { io, Socket } from "socket.io-client";

/* =========================
   Types
========================= */
export type AntiCheatAction =
  | "blur"
  | "focus"
  | "refresh"
  | "back"
  | "devtools"
  | "heartbeat"
  | "multi_tab";

export type AntiCheatLog = {
  attemptId: string;
  examCode: string;
  role: string;
  action: AntiCheatAction;
  question?: number | null;
  time: string;
  severity: "warning" | "cheat";
  detail?: string; // ✅ เพิ่ม
};

/* =========================
   Socket (Singleton)
========================= */
let socket: Socket | null = null;

function getSocket() {
  if (!socket) {
    socket = io({
      path: "/api/socket",
    });
  }
  return socket;
}

/* =========================
   Send Event
========================= */
export function sendAntiCheatEvent(
  payload: Omit<AntiCheatLog, "time">
) {
  const log: AntiCheatLog = {
    ...payload,
    time: new Date().toISOString(),
  };

  getSocket().emit("anti-cheat", log);

  if (process.env.NODE_ENV === "development") {
    console.log("🛑 AntiCheat:", log);
  }
}

/* ✅ alias เพื่อให้ import { sendEvent } ใช้ได้ */
export const sendEvent = sendAntiCheatEvent;
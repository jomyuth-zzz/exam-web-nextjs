import { Server } from "socket.io";

/* =========================
   Types
========================= */
type OnlineUser = {
  userId?: string;
  name?: string;
  role?: string;
  examCode?: string;
};

type AntiCheatLog = {
  attemptId: string;
  examCode: string;
  role: string;
  action: string; // blur | refresh | back | devtools | heartbeat | multi_tab
  question?: number | null;
  time: string;
  severity: "warning" | "cheat";
};

/* =========================
   Singleton Socket
========================= */
let io: Server | null = null;

/* socketId -> OnlineUser */
export const onlineUsers = new Map<string, OnlineUser>();

/* =========================
   Create / Get Socket
========================= */
export function createSocket(server: any) {
  if (io) return io; // ⛔ กันสร้างซ้ำ

  io = new Server(server, {
    path: "/api/socket",
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 socket connected:", socket.id);

    /* =========================
       JOIN
    ========================= */
    socket.on("join", (data: OnlineUser) => {
      onlineUsers.set(socket.id, data);
      io!.emit("online:update", Array.from(onlineUsers.values()));
    });

    /* =========================
       ANTI CHEAT EVENT
    ========================= */
    socket.on("anti-cheat", async (log: AntiCheatLog) => {
      // ส่งเข้า dashboard realtime
      io!.emit("anti-cheat:new", log);

      // บันทึก DB (optional / ไม่ทำให้ crash)
      try {
        const { mongo } = await import("./mongo");
        const db = await mongo;
        await db.collection("antiCheatLogs").insertOne(log);
      } catch (err) {
        console.warn("⚠️ AntiCheat DB error:", err);
      }
    });

    /* =========================
       CHAT
    ========================= */
    socket.on("chat", (msg) => {
      io!.emit("chat:new", msg);
    });

    /* =========================
       DISCONNECT
    ========================= */
    socket.on("disconnect", () => {
      onlineUsers.delete(socket.id);
      io!.emit("online:update", Array.from(onlineUsers.values()));
      console.log("🔴 socket disconnected:", socket.id);
    });
  });

  return io;
}

/* =========================
   Getter (ใช้ใน API)
========================= */
export function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
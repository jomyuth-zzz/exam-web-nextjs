"use client";

import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

/* =====================
   Types
===================== */
type ChatMessage = {
  id: number;
  sender: string;
  message: string;
  time: string;
};

type AntiCheatLog = {
  attemptId: string;
  examCode: string;
  role: string;
  action:
    | "blur"
    | "focus"
    | "refresh"
    | "back"
    | "devtools"
    | "multi_tab"
    | "heartbeat";
  question?: number;
  severity: "warning" | "cheat";
  detail?: string;
  time: string;
};

type OnlineUser = {
  attemptId?: string;
  examCode?: string;
  role?: string;
  type: "student" | "admin";
  name?: string;
};

/* =====================
   Config
===================== */
const currentAdmin = "adminA";
let socket: Socket;

/* =====================
   Helpers
===================== */
const getSeverityLabel = (severity: AntiCheatLog["severity"]) => {
  return severity === "cheat" ? "🚨 CHEAT" : "⚠️ WARNING";
};

export default function AdminDashboardPage() {
  /* ===== States ===== */
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [cheatLogs, setCheatLogs] = useState<AntiCheatLog[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");

  /* ===== Filters ===== */
  const [searchExamCode, setSearchExamCode] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterSeverity, setFilterSeverity] =
    useState<"all" | "warning" | "cheat">("all");

  /* =====================
     Init Socket
     👉 รับ Anti-Cheat แค่ใน Dashboard
  ===================== */
  useEffect(() => {
    socket = io({
      path: "/api/socket",
    });

    socket.emit("join", {
      type: "admin",
      name: currentAdmin,
    });

    socket.on("online:update", (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    // ✅ รับเฉพาะ admin
    socket.on("admin:anti-cheat", (log: AntiCheatLog) => {
      setCheatLogs((prev) => [log, ...prev].slice(0, 300));
    });

    socket.on("chat:new", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /* =====================
     Summary
  ===================== */
  const totalOnlineStudents = onlineUsers.filter(
    (u) => u.type === "student"
  ).length;

  const byRole = useMemo(() => {
    const map: Record<string, number> = {};
    onlineUsers.forEach((u) => {
      if (u.role) map[u.role] = (map[u.role] || 0) + 1;
    });
    return map;
  }, [onlineUsers]);

  const roles = Object.keys(byRole);

  /* =====================
     Filter Logs
  ===================== */
  const filteredLogs = useMemo(() => {
    return cheatLogs.filter((log) => {
      if (
        searchExamCode &&
        !log.examCode
          .toLowerCase()
          .includes(searchExamCode.toLowerCase())
      )
        return false;

      if (filterRole !== "all" && log.role !== filterRole)
        return false;

      if (
        filterSeverity !== "all" &&
        log.severity !== filterSeverity
      )
        return false;

      return true;
    });
  }, [cheatLogs, searchExamCode, filterRole, filterSeverity]);

  /* =====================
     Chat
  ===================== */
  const sendMessage = () => {
    if (!text.trim()) return;

    const msg: ChatMessage = {
      id: Date.now(),
      sender: currentAdmin,
      message: text,
      time: new Date().toLocaleTimeString(),
    };

    socket.emit("chat", msg);
    setText("");
  };

  return (
    <div className="p-6 space-y-6 text-black">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* ===== Summary ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-600 text-white p-4 rounded">
          <p className="text-sm">ผู้เข้าสอบออนไลน์</p>
          <p className="text-3xl font-bold">{totalOnlineStudents}</p>
        </div>

        <div className="bg-white p-4 rounded md:col-span-2">
          <h2 className="font-semibold mb-2">แยกตามอาชีพ</h2>
          <ul className="space-y-1">
            {Object.entries(byRole).map(([role, count]) => (
              <li key={role} className="flex justify-between border-b">
                <span>{role}</span>
                <span className="font-semibold">{count} คน</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ===== Logs + Chat ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🚨 Anti-Cheat */}
        <div className="bg-red-900 p-4 rounded text-white h-[450px] flex flex-col">
          <h2 className="text-xl font-semibold mb-3">
            🚨 Anti-Cheat (Live)
          </h2>

          {/* Filters */}
          <div className="space-y-2 mb-3 text-black">
            <input
              placeholder="ค้นหารหัสสอบ..."
              value={searchExamCode}
              onChange={(e) => setSearchExamCode(e.target.value)}
              className="w-full p-2 rounded"
            />

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full p-2 rounded"
            >
              <option value="all">ทุกอาชีพ</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <select
              value={filterSeverity}
              onChange={(e) =>
                setFilterSeverity(e.target.value as any)
              }
              className="w-full p-2 rounded"
            >
              <option value="all">ทั้งหมด</option>
              <option value="warning">⚠️ Warning</option>
              <option value="cheat">🚨 Cheat</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 text-sm">
            {filteredLogs.length === 0 && (
              <p className="text-red-200">
                ยังไม่มีเหตุผิดปกติ
              </p>
            )}

            {filteredLogs.map((log, i) => (
              <div
                key={i}
                className={`p-2 rounded ${
                  log.severity === "cheat"
                    ? "bg-red-700"
                    : "bg-yellow-500 text-black"
                }`}
              >
                <p className="font-semibold">
                  {getSeverityLabel(log.severity)}
                </p>
                <p>รหัสสอบ: {log.examCode}</p>
                <p>อาชีพ: {log.role}</p>
                <p>ข้อ: {log.question ?? "-"}</p>
                <p>เหตุการณ์: {log.action}</p>
                {log.detail && <p>รายละเอียด: {log.detail}</p>}
                <p className="text-xs opacity-80">
                  {new Date(log.time).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 💬 Chat */}
        <div className="bg-gray-800 p-4 rounded h-[450px] flex flex-col text-white">
          <h2 className="text-xl font-semibold mb-3">
            Admin Chat
          </h2>

          <div className="flex-1 overflow-y-auto space-y-3 mb-3">
            {messages.map((m) => {
              const isMe = m.sender === currentAdmin;
              return (
                <div
                  key={m.id}
                  className={`flex ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs p-2 rounded ${
                      isMe ? "bg-green-600" : "bg-gray-600"
                    }`}
                  >
                    {!isMe && (
                      <p className="text-xs text-gray-300 mb-1">
                        {m.sender}
                      </p>
                    )}
                    <p>{m.message}</p>
                    <p className="text-xs text-gray-300 mt-1">
                      {m.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 p-2 rounded text-black"
              placeholder="พิมพ์ข้อความ..."
            />
            <button
              onClick={sendMessage}
              className="bg-green-600 px-4 rounded"
            >
              ส่ง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
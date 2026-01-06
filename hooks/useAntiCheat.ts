"use client";
import { useEffect } from "react";

type AntiCheatProps = {
  examCode: string;
  questionIndex: number;
  onLog: (message: string) => void;
};

export function useAntiCheat({
  examCode,
  questionIndex,
  onLog,
}: AntiCheatProps) {
  useEffect(() => {
    const time = () =>
      new Date().toLocaleTimeString("th-TH", { hour12: false });

    const log = (action: string) => {
      onLog(
        `[${time()}] ${examCode} ${action} at question ${questionIndex + 1}`
      );
    };

    const handleVisibility = () => {
      if (document.hidden) log("Switched tab");
    };

    const handleBlur = () => log("Window blurred");

    const handleReload = () => log("Page reloaded");

    // DevTools (advanced)
    const devToolsCheck = setInterval(() => {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        log("DevTools opened");
      }
    }, 1000);

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleReload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleReload);
      clearInterval(devToolsCheck);
    };
  }, [examCode, questionIndex, onLog]);
}
"use client";

/* =========================
   Types
========================= */
export type AntiCheatEventType =
  | "blur"
  | "refresh"
  | "back"
  | "devtools"
  | "heartbeat"
  | "multi_tab";

export type SendEventFn = (
  type: AntiCheatEventType,
  detail?: string
) => void;

/* =========================
   Utils
========================= */
const TAB_ID_KEY = "exam-tab-id";

function getTabId() {
  if (typeof window === "undefined") return "server";

  let id = sessionStorage.getItem(TAB_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(TAB_ID_KEY, id);
  }
  return id;
}

/* =========================
   Anti-Cheat Hook
========================= */
export function registerAntiCheat(
  send: SendEventFn,
  heartbeatMs = 10000
) {
  const cleanups: (() => void)[] = [];
  const tabId = getTabId();

  /* ===== Blur ===== */
  const onBlur = () => {
    send("blur", "window blurred");
  };
  window.addEventListener("blur", onBlur);
  cleanups.push(() =>
    window.removeEventListener("blur", onBlur)
  );

  /* ===== Back button ===== */
  const onPopState = () => {
    send("back", "browser back");
  };
  window.addEventListener("popstate", onPopState);
  cleanups.push(() =>
    window.removeEventListener("popstate", onPopState)
  );

  /* ===== Refresh detect ===== */
  try {
    const nav = performance.getEntriesByType(
      "navigation"
    )[0] as any;

    if (nav?.type === "reload") {
      send("refresh", "page reloaded");
    }
  } catch {
    /* ignore */
  }

  /* ===== DevTools detect (best effort) ===== */
  const DEVTOOLS_THRESHOLD = 160;
  let devtoolsOpened = false;

  const devtoolsInterval = setInterval(() => {
    const opened =
      window.outerWidth - window.innerWidth >
        DEVTOOLS_THRESHOLD ||
      window.outerHeight - window.innerHeight >
        DEVTOOLS_THRESHOLD;

    if (opened && !devtoolsOpened) {
      devtoolsOpened = true;
      send("devtools", "devtools opened");
    }

    if (!opened) {
      devtoolsOpened = false;
    }
  }, 1000);

  cleanups.push(() => clearInterval(devtoolsInterval));

  /* ===== Heartbeat ===== */
  send("heartbeat", `tab:${tabId}`);

  const heartbeatInterval = setInterval(() => {
    send("heartbeat", `tab:${tabId}`);
  }, heartbeatMs);

  cleanups.push(() =>
    clearInterval(heartbeatInterval)
  );

  /* ===== Multi-tab detect ===== */
  const channel = new BroadcastChannel("exam-channel");

  channel.postMessage({
    type: "hello",
    tabId,
  });

  channel.onmessage = (event) => {
    if (
      event.data?.tabId &&
      event.data.tabId !== tabId
    ) {
      send("multi_tab", "multiple tabs opened");
    }
  };

  cleanups.push(() => channel.close());

  /* ===== Cleanup ===== */
  return () => {
    cleanups.forEach((fn) => fn());
  };
}
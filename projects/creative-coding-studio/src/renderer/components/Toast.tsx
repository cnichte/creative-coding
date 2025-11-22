import React, { useEffect, useState } from "react";

export type ToastItem = { id: number; type: "success" | "error"; message: string };

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const push = (type: ToastItem["type"], message: string, duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };
  return { toasts, push };
}

export function ToastOverlay({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-3 py-2 rounded shadow text-sm border ${
            t.type === "success"
              ? "bg-emerald-900/80 border-emerald-500 text-emerald-100"
              : "bg-rose-900/80 border-rose-500 text-rose-100"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

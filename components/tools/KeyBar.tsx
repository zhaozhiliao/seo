"use client";

import { useEffect, useState } from "react";

export default function KeyBar() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => {
        if (d.configured) {
          setStatus("ok");
          setPreview(d.keyPreview);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b text-sm">
      <span className="font-medium text-gray-600">API Key:</span>
      {status === "loading" && (
        <span className="text-yellow-600 animate-pulse">检查中…</span>
      )}
      {status === "ok" && (
        <span className="text-green-600 font-mono">{preview} ✓</span>
      )}
      {status === "error" && (
        <span className="text-red-500">
          未配置 — 请在 .env.local 中设置 AHREFS_API_KEY
        </span>
      )}
    </div>
  );
}

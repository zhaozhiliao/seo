"use client";

import { useEffect, useState } from "react";
import { initOpticalAlign } from "@/lib/optical-align";

/** Dev-only grid overlay (G key) + optical headline alignment. Empty in production builds. */
export function GridDevOverlay() {
  if (process.env.NODE_ENV !== "development") return null;
  return <GridDevOverlayInner />;
}

function GridDevOverlayInner() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const cleanupAlign = initOpticalAlign(".display-headline");

    document.querySelectorAll(".guides .cols").forEach((host) => {
      if (host.childElementCount > 0) return;
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--grid-cols").trim();
      const n = parseInt(raw || "12", 10);
      for (let i = 1; i <= n; i++) {
        const col = document.createElement("div");
        col.className = "col";
        const label = document.createElement("span");
        label.textContent = String(i);
        col.appendChild(label);
        host.appendChild(col);
      }
    });

    const sync = (next: boolean) => {
      document.body.classList.toggle("grid-on", next);
      setOn(next);
    };

    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "g" || e.key === "G") && !e.metaKey && !e.ctrlKey && !e.altKey) {
        sync(!document.body.classList.contains("grid-on"));
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      cleanupAlign();
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("grid-on");
    };
  }, []);

  return (
    <>
      <button
        type="button"
        className="grid-toggle"
        aria-pressed={on}
        onClick={() => {
          const next = !document.body.classList.contains("grid-on");
          document.body.classList.toggle("grid-on", next);
          setOn(next);
        }}
      >
        <span className="grid-toggle-dot" />
        <span>{on ? "隐藏网格" : "显示网格"}</span>
        <kbd className="grid-toggle-kbd">G</kbd>
      </button>
      <div className="guides" aria-hidden="true">
        <div className="cols" />
        <div className="rows" />
      </div>
    </>
  );
}

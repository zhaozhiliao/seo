"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ApiKeyCtx {
  apiKey: string;
  setApiKey: (key: string) => void;
  hasKey: boolean;
}

const Ctx = createContext<ApiKeyCtx>({
  apiKey: "",
  setApiKey: () => {},
  hasKey: false,
});

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setKeyState] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("ahrefs_api_key") ?? "";
    setKeyState(stored);
  }, []);

  function setApiKey(key: string) {
    const trimmed = key.trim();
    if (trimmed) localStorage.setItem("ahrefs_api_key", trimmed);
    else localStorage.removeItem("ahrefs_api_key");
    setKeyState(trimmed);
  }

  return (
    <Ctx.Provider value={{ apiKey, setApiKey, hasKey: !!apiKey }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApiKey() {
  return useContext(Ctx);
}

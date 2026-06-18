"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  AI_PROVIDERS,
  DEFAULT_PROVIDER_ID,
  LS_AI_KEYS,
  LS_AI_SELECTED,
} from "@/lib/ai/providers";

interface AiKeysCtx {
  /** provider id -> api key (only non-empty entries) */
  keys: Record<string, string>;
  selectedProvider: string;
  setSelectedProvider: (id: string) => void;
  setKey: (provider: string, key: string) => void;
  getKey: (provider: string) => string;
  hasKey: (provider: string) => boolean;
  /** key for the currently selected provider */
  activeKey: string;
  hasActiveKey: boolean;
  ready: boolean;
}

const Ctx = createContext<AiKeysCtx>({
  keys: {},
  selectedProvider: DEFAULT_PROVIDER_ID,
  setSelectedProvider: () => {},
  setKey: () => {},
  getKey: () => "",
  hasKey: () => false,
  activeKey: "",
  hasActiveKey: false,
  ready: false,
});

export function AiKeysProvider({ children }: { children: ReactNode }) {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [selectedProvider, setSelected] = useState(DEFAULT_PROVIDER_ID);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_AI_KEYS);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string>;
        if (parsed && typeof parsed === "object") setKeys(parsed);
      }
    } catch {
      /* ignore malformed storage */
    }
    const sel = localStorage.getItem(LS_AI_SELECTED);
    if (sel && AI_PROVIDERS.some((p) => p.id === sel)) setSelected(sel);
    setReady(true);
  }, []);

  function persist(next: Record<string, string>) {
    setKeys(next);
    if (Object.keys(next).length) {
      localStorage.setItem(LS_AI_KEYS, JSON.stringify(next));
    } else {
      localStorage.removeItem(LS_AI_KEYS);
    }
  }

  function setKey(provider: string, key: string) {
    const trimmed = key.trim();
    const next = { ...keys };
    if (trimmed) next[provider] = trimmed;
    else delete next[provider];
    persist(next);
  }

  function setSelectedProvider(id: string) {
    setSelected(id);
    localStorage.setItem(LS_AI_SELECTED, id);
  }

  const getKey = (provider: string) => keys[provider] ?? "";
  const hasKey = (provider: string) => !!keys[provider];

  return (
    <Ctx.Provider
      value={{
        keys,
        selectedProvider,
        setSelectedProvider,
        setKey,
        getKey,
        hasKey,
        activeKey: getKey(selectedProvider),
        hasActiveKey: hasKey(selectedProvider),
        ready,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAiKeys() {
  return useContext(Ctx);
}

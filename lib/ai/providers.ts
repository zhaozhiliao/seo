// ─── AI provider registry ──────────────────────────────────────────────
// Shared by client (key management UI) and server (chat proxy route).
// Each provider declares a `protocol` so the server route knows how to
// shape the request/response. Add new providers by appending here.

export type AiProtocol = "openai" | "anthropic" | "gemini";

export interface AiModel {
  id: string;
  label: string;
}

export interface AiProvider {
  id: string;
  name: string;
  /** Request/response shape. */
  protocol: AiProtocol;
  /** Base URL (no trailing slash). */
  baseUrl: string;
  /** Path appended to baseUrl for a chat/generate call (openai/anthropic only). */
  chatPath: string;
  defaultModel: string;
  models: AiModel[];
  docsUrl: string;
  keyPlaceholder: string;
  /** Where the user obtains the key. */
  keysUrl: string;
}

export const AI_PROVIDERS: AiProvider[] = [
  {
    id: "deepseek",
    name: "DeepSeek",
    protocol: "openai",
    baseUrl: "https://api.deepseek.com",
    chatPath: "/chat/completions",
    defaultModel: "deepseek-chat",
    models: [
      { id: "deepseek-chat", label: "DeepSeek-V3 · deepseek-chat" },
      { id: "deepseek-reasoner", label: "DeepSeek-R1 · deepseek-reasoner" },
    ],
    docsUrl: "https://api-docs.deepseek.com/zh-cn/",
    keyPlaceholder: "sk-...",
    keysUrl: "https://platform.deepseek.com/api_keys",
  },
  {
    id: "openai",
    name: "OpenAI",
    protocol: "openai",
    baseUrl: "https://api.openai.com/v1",
    chatPath: "/chat/completions",
    defaultModel: "gpt-4o",
    models: [
      { id: "gpt-4o", label: "GPT-4o" },
      { id: "gpt-4o-mini", label: "GPT-4o mini" },
      { id: "gpt-4.1", label: "GPT-4.1" },
      { id: "gpt-4.1-mini", label: "GPT-4.1 mini" },
    ],
    docsUrl: "https://platform.openai.com/docs/api-reference/chat",
    keyPlaceholder: "sk-...",
    keysUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "anthropic",
    name: "Claude",
    protocol: "anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    chatPath: "/messages",
    defaultModel: "claude-sonnet-4-5",
    models: [
      { id: "claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
      { id: "claude-opus-4-1", label: "Claude Opus 4.1" },
      { id: "claude-3-5-haiku-latest", label: "Claude 3.5 Haiku" },
    ],
    docsUrl: "https://docs.anthropic.com/en/api/messages",
    keyPlaceholder: "sk-ant-...",
    keysUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "gemini",
    name: "Gemini",
    protocol: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    chatPath: "", // model + method are appended dynamically
    defaultModel: "gemini-2.5-flash",
    models: [
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
      { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    ],
    docsUrl: "https://ai.google.dev/gemini-api/docs",
    keyPlaceholder: "AIza...",
    keysUrl: "https://aistudio.google.com/app/apikey",
  },
];

export function getProvider(id: string): AiProvider | undefined {
  return AI_PROVIDERS.find((p) => p.id === id);
}

export const DEFAULT_PROVIDER_ID = AI_PROVIDERS[0].id;

// localStorage keys
export const LS_AI_KEYS = "ai_provider_keys";
export const LS_AI_SELECTED = "ai_selected_provider";

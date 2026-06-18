// Client-side helper to call the AI chat proxy. Reads nothing from storage
// itself — the caller passes the key (from useAiKeys) so it stays explicit.

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AiChatArgs {
  provider: string;
  apiKey: string;
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  json?: boolean;
  signal?: AbortSignal;
}

interface AiChatResult {
  content: string;
  error: string | null;
}

export async function aiChat({
  provider,
  apiKey,
  model,
  messages,
  temperature,
  json,
  signal,
}: AiChatArgs): Promise<AiChatResult> {
  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-ai-key": apiKey,
      },
      body: JSON.stringify({ provider, model, messages, temperature, json }),
      signal,
    });
    const data = await res.json();
    if (!res.ok) return { content: "", error: data?.error ?? `HTTP ${res.status}` };
    return { content: data.content ?? "", error: null };
  } catch (e) {
    return { content: "", error: String(e) };
  }
}

/** Best-effort extraction of a JSON object/array from a model response. */
export function extractJson<T = unknown>(text: string): T | null {
  if (!text) return null;
  // Strip ```json fences if present
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : text).trim();
  try {
    return JSON.parse(candidate) as T;
  } catch {
    // try to locate first { ... } or [ ... ]
    const start = candidate.search(/[[{]/);
    const end = Math.max(candidate.lastIndexOf("}"), candidate.lastIndexOf("]"));
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

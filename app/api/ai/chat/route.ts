import { NextRequest, NextResponse } from "next/server";
import { getProvider, type AiProvider } from "@/lib/ai/providers";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatBody {
  provider?: string;
  model?: string;
  messages?: ChatMessage[];
  temperature?: number;
  /** when true, ask the model for a JSON object response */
  json?: boolean;
}

export async function POST(req: NextRequest) {
  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const { provider: providerId, model, messages, temperature, json } = body;

  if (!providerId) return NextResponse.json({ error: "缺少 provider" }, { status: 400 });
  if (!messages?.length) return NextResponse.json({ error: "缺少 messages" }, { status: 400 });

  const provider = getProvider(providerId);
  if (!provider) {
    return NextResponse.json({ error: `未知的 AI 服务商：${providerId}` }, { status: 400 });
  }

  // Key comes from the browser (localStorage) via header — never persisted server-side.
  const apiKey =
    req.headers.get("x-ai-key") ||
    process.env[`${providerId.toUpperCase()}_API_KEY`] ||
    "";

  if (!apiKey) {
    return NextResponse.json(
      { error: `${provider.name} API Key 未配置，请在工具页 API 设置中填写` },
      { status: 401 }
    );
  }

  const usedModel = model || provider.defaultModel;
  const temp = temperature ?? 0.7;

  try {
    if (provider.protocol === "openai") {
      return await callOpenAI(provider, apiKey, usedModel, messages, temp, json);
    }
    if (provider.protocol === "anthropic") {
      return await callAnthropic(provider, apiKey, usedModel, messages, temp);
    }
    if (provider.protocol === "gemini") {
      return await callGemini(provider, apiKey, usedModel, messages, temp, json);
    }
    return NextResponse.json({ error: "不支持的协议" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: `请求 ${provider.name} 失败：${String(e)}` }, { status: 502 });
  }
}

/* ── OpenAI-compatible (OpenAI, DeepSeek) ── */
async function callOpenAI(
  provider: AiProvider,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  temperature: number,
  json?: boolean
) {
  const payload: Record<string, unknown> = { model, messages, temperature, stream: false };
  if (json) payload.response_format = { type: "json_object" };

  const res = await fetch(`${provider.baseUrl}${provider.chatPath}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: `${provider.name} ${res.status}: ${text.slice(0, 500)}` }, { status: res.status });
  }
  const data = JSON.parse(text);
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ content, raw: data });
}

/* ── Anthropic Claude ── */
async function callAnthropic(
  provider: AiProvider,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  temperature: number
) {
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const turns = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));

  const payload: Record<string, unknown> = {
    model,
    max_tokens: 4096,
    temperature,
    messages: turns,
  };
  if (system) payload.system = system;

  const res = await fetch(`${provider.baseUrl}${provider.chatPath}`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: `${provider.name} ${res.status}: ${text.slice(0, 500)}` }, { status: res.status });
  }
  const data = JSON.parse(text);
  const content: string = Array.isArray(data?.content)
    ? data.content.map((b: { text?: string }) => b.text ?? "").join("")
    : "";
  return NextResponse.json({ content, raw: data });
}

/* ── Google Gemini ── */
async function callGemini(
  provider: AiProvider,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  temperature: number,
  json?: boolean
) {
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const generationConfig: Record<string, unknown> = { temperature };
  if (json) generationConfig.responseMimeType = "application/json";

  const payload: Record<string, unknown> = { contents, generationConfig };
  if (system) payload.systemInstruction = { parts: [{ text: system }] };

  const url = `${provider.baseUrl}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: `${provider.name} ${res.status}: ${text.slice(0, 500)}` }, { status: res.status });
  }
  const data = JSON.parse(text);
  const content: string =
    data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  return NextResponse.json({ content, raw: data });
}

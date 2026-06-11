"use client";

import { useState, useEffect } from "react";
import { Loader2, Copy, Check, Languages, Wand2, RotateCcw, ChevronDown } from "lucide-react";
import { useAiKeys } from "@/app/context/AiKeysContext";
import { getProvider } from "@/app/lib/ai/providers";
import { aiChat, extractJson } from "@/app/lib/ai/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AiStatusHint from "@/app/components/AiStatusHint";

const TARGET_LANGS = [
  { code: "en", label: "English" },
  { code: "zh-Hans", label: "简体中文" },
  { code: "zh-Hant", label: "繁體中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "pl", label: "Polski" },
  { code: "cs", label: "Čeština" },
  { code: "it", label: "Italiano" },
  { code: "ru", label: "Русский" },
  { code: "ar", label: "العربية" },
  { code: "id", label: "Bahasa" },
];

const DEFAULT_PROMPT = `你是一名资深的产品本地化与 UI 文案专家。请将用户提供的界面文案翻译为目标语言，要求：
1. 符合该语言用户的界面使用习惯，简洁、自然、地道，而非逐字直译；
2. 保持原文的语气与功能意图（按钮、提示、占位符等）；
3. 保留文案中的占位符 / 变量（如 {name}、%s、{{count}}）原样不变；
4. 不添加多余标点或解释，长度尽量贴近原文，适合 UI 展示。`;

const LS_PROMPT = "ui_translate_prompt";

export default function UiTranslator() {
  const { selectedProvider, activeKey, hasActiveKey } = useAiKeys();
  const [text, setText] = useState("");
  const [targets, setTargets] = useState<string[]>(["en", "fr", "es", "ru", "ar", "de", "pt", "pl", "cs", "it"]);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [promptOpen, setPromptOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LS_PROMPT);
    if (saved) setPrompt(saved);
  }, []);

  function savePrompt(v: string) {
    setPrompt(v);
    localStorage.setItem(LS_PROMPT, v);
  }
  function resetPrompt() {
    setPrompt(DEFAULT_PROMPT);
    localStorage.removeItem(LS_PROMPT);
  }

  function toggleTarget(code: string) {
    setTargets((t) => (t.includes(code) ? t.filter((c) => c !== code) : [...t, code]));
  }

  async function translate() {
    if (!text.trim() || !targets.length || !hasActiveKey) return;
    setLoading(true);
    setError(null);
    setResults({});

    const provider = getProvider(selectedProvider);
    const langList = targets
      .map((c) => `${c} (${TARGET_LANGS.find((l) => l.code === c)?.label ?? c})`)
      .join(", ");
    const system =
      prompt +
      `\n\n目标语言代码：${langList}。` +
      ` 仅返回 JSON 对象：{"translations":{"<语言代码>":"<译文>"}}，键使用上面给出的语言代码，不要包含其他内容。`;

    const { content, error: err } = await aiChat({
      provider: selectedProvider,
      apiKey: activeKey,
      model: provider?.defaultModel,
      temperature: 0.3,
      json: true,
      messages: [
        { role: "system", content: system },
        { role: "user", content: text.trim() },
      ],
    });

    if (err) {
      setError(err);
      setLoading(false);
      return;
    }
    const parsed = extractJson<{ translations: Record<string, string> }>(content);
    if (!parsed?.translations) {
      setError("AI 返回结果无法解析，请重试。");
      setLoading(false);
      return;
    }
    setResults(parsed.translations);
    setLoading(false);
  }

  function copy(key: string, value: string) {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
  }

  const resultEntries = Object.entries(results);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
            <Languages size={16} className="text-foreground/70" />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight">原始文案</h2>
            <p className="text-xs text-muted-foreground">输入任意语言的 UI 文案</p>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="例如：保存更改"
            className="min-h-24 resize-y"
          />

          {/* Target languages */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">目标语言（可多选）</p>
            <div className="flex flex-wrap gap-1.5">
              {TARGET_LANGS.map((l) => {
                const on = targets.includes(l.code);
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => toggleTarget(l.code)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                      on
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    {l.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom prompt module */}
          <div className="rounded-xl bg-muted/50 p-4">
            <button
              type="button"
              onClick={() => setPromptOpen((v) => !v)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-xs font-semibold text-foreground">自定义翻译提示词</span>
              <ChevronDown size={14} className={`text-muted-foreground transition-transform ${promptOpen ? "rotate-180" : ""}`} />
            </button>
            {promptOpen && (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={prompt}
                  onChange={(e) => savePrompt(e.target.value)}
                  className="min-h-40 resize-y bg-background font-mono text-xs leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">提示词自动保存在本地浏览器</span>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={resetPrompt}>
                    <RotateCcw size={12} />
                    恢复默认
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={translate}
              disabled={loading || !text.trim() || !targets.length || !hasActiveKey}
              className="h-10 gap-2"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
              {loading ? "翻译中" : `翻译为 ${targets.length} 种语言`}
            </Button>
          </div>

          <AiStatusHint />
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="break-all">{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Results */}
      {resultEntries.length > 0 && (
        <div className="rounded-2xl bg-card shadow-sm">
          <div className="border-b border-border/60 px-6 py-4">
            <h2 className="text-sm font-semibold">翻译结果</h2>
          </div>
          <div className="divide-y divide-border/60">
            {resultEntries.map(([code, value]) => {
              const label = TARGET_LANGS.find((l) => l.code === code)?.label ?? code;
              const rtl = code === "ar";
              return (
                <div key={code} className="flex items-start gap-3 px-6 py-4">
                  <span className="mt-0.5 w-20 shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
                  <p
                    className="min-w-0 flex-1 text-sm text-foreground"
                    dir={rtl ? "rtl" : undefined}
                  >
                    {value}
                  </p>
                  <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => copy(code, value)}>
                    {copied === code ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    {copied === code ? "已复制" : "复制"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

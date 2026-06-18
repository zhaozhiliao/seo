"use client";

import { useState } from "react";
import { Loader2, Copy, Check, Link2, Wand2 } from "lucide-react";
import { useAiKeys } from "@/components/context/AiKeysContext";
import { getProvider } from "@/lib/ai/providers";
import { aiChat, extractJson } from "@/lib/ai/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AiStatusHint from "@/components/tools/AiStatusHint";

interface SlugSuggestion {
  slug: string;
  reason: string;
}

const MAX_WORD_OPTIONS = [3, 4, 5, 6, 8];

export default function SlugGenerator() {
  const { selectedProvider, activeKey, hasActiveKey } = useAiKeys();
  const [title, setTitle] = useState("");
  const [maxWords, setMaxWords] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SlugSuggestion[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  async function generate() {
    if (!title.trim() || !hasActiveKey) return;
    setLoading(true);
    setError(null);
    setResults([]);

    const provider = getProvider(selectedProvider);
    const system =
      "You are an SEO specialist that creates URL slugs. Rules: " +
      "translate non-English input to natural English; lowercase only; words separated by single hyphens; " +
      "no stop words (a, the, of, to, for, and, in, on) unless essential to meaning; " +
      "no special characters, no trailing/leading hyphens; concise and keyword-rich; " +
      `at most ${maxWords} words. ` +
      'Respond ONLY with a JSON object: {"suggestions":[{"slug":"...","reason":"..."}]} with exactly 3 distinct suggestions, ' +
      "ordered best-first. The reason is a short Chinese explanation.";

    const { content, error: err } = await aiChat({
      provider: selectedProvider,
      apiKey: activeKey,
      model: provider?.defaultModel,
      temperature: 0.6,
      json: true,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `标题或关键词：${title.trim()}` },
      ],
    });

    if (err) {
      setError(err);
      setLoading(false);
      return;
    }

    const parsed = extractJson<{ suggestions: SlugSuggestion[] }>(content);
    if (!parsed?.suggestions?.length) {
      setError("AI 返回结果无法解析，请重试。");
      setLoading(false);
      return;
    }
    // sanitize slugs defensively
    const clean = parsed.suggestions.map((s) => ({
      slug: s.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""),
      reason: s.reason ?? "",
    }));
    setResults(clean);
    setLoading(false);
  }

  function copy(slug: string) {
    navigator.clipboard.writeText(slug);
    setCopied(slug);
    setTimeout(() => setCopied((c) => (c === slug ? null : c)), 1500);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
            <Link2 size={16} className="text-foreground/70" />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight">输入标题或关键词</h2>
            <p className="text-xs text-muted-foreground">支持任意语言，自动翻译并优化为英文 Slug</p>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
              placeholder="例如：如何在 2026 年提升网站的搜索排名"
              className="h-10 flex-1 min-w-64"
            />
            <Button onClick={generate} disabled={loading || !title.trim() || !hasActiveKey} className="h-10 gap-2">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
              {loading ? "生成中" : "生成 Slug"}
            </Button>
          </div>

          {/* Max words */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">最多单词数</span>
            <div className="flex rounded-lg bg-muted p-0.5">
              {MAX_WORD_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMaxWords(n)}
                  className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                    maxWords === n ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
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
      {results.length > 0 && (
        <div className="rounded-2xl bg-card shadow-sm">
          <div className="border-b border-border/60 px-6 py-4">
            <h2 className="text-sm font-semibold">生成结果</h2>
          </div>
          <div className="divide-y divide-border/60">
            {results.map((s, i) => (
              <div key={s.slug + i} className="flex items-start gap-3 px-6 py-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <code className="block break-all font-mono text-sm font-medium text-foreground">/{s.slug}</code>
                  {s.reason && <p className="mt-1 text-xs text-muted-foreground">{s.reason}</p>}
                </div>
                <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => copy(s.slug)}>
                  {copied === s.slug ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  {copied === s.slug ? "已复制" : "复制"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

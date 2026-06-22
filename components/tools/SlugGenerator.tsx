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
import {
  ToolPanel,
  ToolPanelBody,
  ToolPanelHeader,
  toolSegment,
  toolSegmentActive,
  toolSegmentInactive,
} from "@/components/tools/tool-panel";
import { cn } from "@/lib/utils";

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
      <ToolPanel>
        <ToolPanelHeader
          icon={Link2}
          title="输入标题或关键词"
          description="支持任意语言，自动翻译并优化为英文 Slug"
        />
        <ToolPanelBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
              placeholder="例如：如何在 2026 年提升网站的搜索排名"
              className="h-10 min-w-64 flex-1"
            />
            <Button onClick={generate} disabled={loading || !title.trim() || !hasActiveKey} className="h-10 gap-2">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
              {loading ? "生成中" : "生成 Slug"}
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-fg-muted">最多单词数</span>
            <div className={toolSegment}>
              {MAX_WORD_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMaxWords(n)}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-medium transition-all",
                    maxWords === n ? toolSegmentActive : toolSegmentInactive
                  )}
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
        </ToolPanelBody>
      </ToolPanel>

      {results.length > 0 && (
        <ToolPanel>
          <ToolPanelHeader title="生成结果" />
          <div className="divide-y divide-border/60">
            {results.map((s, i) => (
              <div key={s.slug + i} className="flex items-start gap-3 px-6 py-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-xs font-semibold text-fg-muted">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <code className="block break-all font-mono text-sm font-medium text-fg">/{s.slug}</code>
                  {s.reason && <p className="mt-1 text-xs text-fg-muted">{s.reason}</p>}
                </div>
                <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => copy(s.slug)}>
                  {copied === s.slug ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                  {copied === s.slug ? "已复制" : "复制"}
                </Button>
              </div>
            ))}
          </div>
        </ToolPanel>
      )}
    </div>
  );
}

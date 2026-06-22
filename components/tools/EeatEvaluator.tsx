"use client";

import { useState } from "react";
import { Loader2, BadgeCheck, Wand2, Link as LinkIcon, FileText } from "lucide-react";
import { useAiKeys } from "@/components/context/AiKeysContext";
import { getProvider } from "@/lib/ai/providers";
import { aiChat, extractJson } from "@/lib/ai/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

type Mode = "url" | "text";

interface Dimension {
  key: "experience" | "expertise" | "authoritativeness" | "trust";
  label: string;
  en: string;
}
const DIMENSIONS: Dimension[] = [
  { key: "experience", label: "经验", en: "Experience" },
  { key: "expertise", label: "专业性", en: "Expertise" },
  { key: "authoritativeness", label: "权威性", en: "Authoritativeness" },
  { key: "trust", label: "可信度", en: "Trust" },
];

interface DimResult {
  score: number;
  comment: string;
}
interface EeatResult {
  overall: number;
  experience: DimResult;
  expertise: DimResult;
  authoritativeness: DimResult;
  trust: DimResult;
  strengths: string[];
  issues: string[];
  suggestions: string[];
}

function scoreColor(n: number) {
  if (n >= 80) return "text-success";
  if (n >= 60) return "text-warning";
  return "text-error";
}
function barColor(n: number) {
  if (n >= 80) return "bg-success";
  if (n >= 60) return "bg-warning";
  return "bg-error";
}

export default function EeatEvaluator() {
  const { selectedProvider, activeKey, hasActiveKey } = useAiKeys();
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EeatResult | null>(null);

  async function evaluate() {
    if (!hasActiveKey) return;
    setLoading(true);
    setError(null);
    setResult(null);

    let content = text.trim();
    let pageTitle = "";

    try {
      if (mode === "url") {
        if (!/^https?:\/\//i.test(url.trim())) {
          setError("请输入合法的 http(s) 网址");
          setLoading(false);
          return;
        }
        setStage("正在抓取页面内容…");
        const res = await fetch("/api/fetch-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url.trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "抓取失败");
          setLoading(false);
          return;
        }
        pageTitle = data.title ?? "";
        content = `标题：${data.title}\n描述：${data.description}\n正文：${data.text}`;
      }

      if (!content) {
        setError("请提供页面网址或粘贴内容");
        setLoading(false);
        return;
      }

      setStage("AI 正在评估 E-E-A-T…");
      const provider = getProvider(selectedProvider);
      const system =
        "You are a senior Google Search Quality Rater. Evaluate the given web page content using the E-E-A-T framework " +
        "(Experience, Expertise, Authoritativeness, Trust). Score each dimension 0-100 and give an overall 0-100 score. " +
        "Be critical and specific. Respond ONLY with a JSON object: " +
        '{"overall":int,"experience":{"score":int,"comment":str},"expertise":{"score":int,"comment":str},' +
        '"authoritativeness":{"score":int,"comment":str},"trust":{"score":int,"comment":str},' +
        '"strengths":[str],"issues":[str],"suggestions":[str]}. ' +
        "All comment/strengths/issues/suggestions text MUST be in Chinese, concise and actionable. " +
        "Provide 2-4 items per list.";
      const userMsg =
        (keyword.trim() ? `目标关键词/主题：${keyword.trim()}\n` : "") +
        (pageTitle ? `页面标题：${pageTitle}\n` : "") +
        `页面内容：\n${content.slice(0, 12000)}`;

      const { content: out, error: err } = await aiChat({
        provider: selectedProvider,
        apiKey: activeKey,
        model: provider?.defaultModel,
        temperature: 0.3,
        json: true,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
      });
      if (err) {
        setError(err);
        setLoading(false);
        return;
      }
      const parsed = extractJson<EeatResult>(out);
      if (!parsed?.overall && parsed?.overall !== 0) {
        setError("AI 返回结果无法解析，请重试。");
        setLoading(false);
        return;
      }
      setResult(parsed);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
      setStage("");
    }
  }

  return (
    <div className="space-y-6">
      <ToolPanel>
        <ToolPanelHeader
          icon={BadgeCheck}
          title="待评估页面"
          description="输入网址自动抓取，或直接粘贴内容"
        />
        <ToolPanelBody className="space-y-4">
          <div className={cn(toolSegment, "w-fit")}>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all",
                mode === "url" ? toolSegmentActive : toolSegmentInactive
              )}
            >
              <LinkIcon size={13} />
              网址抓取
            </button>
            <button
              type="button"
              onClick={() => setMode("text")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all",
                mode === "text" ? toolSegmentActive : toolSegmentInactive
              )}
            >
              <FileText size={13} />
              粘贴内容
            </button>
          </div>

          {mode === "url" ? (
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/blog/post"
              className="h-10"
            />
          ) : (
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="粘贴文章正文…"
              className="min-h-40 resize-y"
            />
          )}

          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="目标关键词 / 主题（可选，帮助更精准评估）"
            className="h-10"
          />

          <Button
            onClick={evaluate}
            disabled={loading || !hasActiveKey || (mode === "url" ? !url.trim() : !text.trim())}
            className="h-10 gap-2"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
            {loading ? stage || "评估中" : "开始评估"}
          </Button>

          <AiStatusHint />
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="break-all">{error}</AlertDescription>
            </Alert>
          )}
        </ToolPanelBody>
      </ToolPanel>

      {result && (
        <div className="space-y-6">
          <ToolPanel>
            <ToolPanelHeader
              title="评估结果"
              actions={
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-fg-muted">综合得分</span>
                  <span className={`text-2xl font-bold ${scoreColor(result.overall)}`}>{result.overall}</span>
                  <span className="text-xs text-fg-muted">/100</span>
                </div>
              }
            />
            <ToolPanelBody className="grid gap-4 sm:grid-cols-2">
              {DIMENSIONS.map((d) => {
                const dim = result[d.key];
                if (!dim) return null;
                return (
                  <div key={d.key} className="rounded-xl bg-bg-subtle p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-semibold">{d.label}</span>
                        <span className="ml-1.5 font-mono text-[10px] text-fg-muted">{d.en}</span>
                      </div>
                      <span className={`text-lg font-bold ${scoreColor(dim.score)}`}>{dim.score}</span>
                    </div>
                    <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-bg-subtle">
                      <div className={`h-full rounded-full ${barColor(dim.score)}`} style={{ width: `${dim.score}%` }} />
                    </div>
                    <p className="text-xs leading-relaxed text-fg-muted">{dim.comment}</p>
                  </div>
                );
              })}
            </ToolPanelBody>
          </ToolPanel>

          <div className="grid gap-6 lg:grid-cols-3">
            <ListCard title="优势" items={result.strengths} tone="success" />
            <ListCard title="问题" items={result.issues} tone="error" />
            <ListCard title="优化建议" items={result.suggestions} tone="brand" />
          </div>
        </div>
      )}
    </div>
  );
}

function ListCard({ title, items, tone }: { title: string; items: string[]; tone: "success" | "error" | "brand" }) {
  const dot = tone === "success" ? "bg-success" : tone === "error" ? "bg-error" : "bg-brand";
  return (
    <ToolPanel>
      <ToolPanelHeader title={title} className="px-5 py-3.5" />
      <ul className="space-y-2.5 p-5">
        {(items ?? []).map((it, i) => (
          <li key={i} className="flex gap-2.5 text-xs leading-relaxed text-fg-muted">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            <span>{it}</span>
          </li>
        ))}
        {(!items || items.length === 0) && <li className="text-xs text-fg-muted">—</li>}
      </ul>
    </ToolPanel>
  );
}

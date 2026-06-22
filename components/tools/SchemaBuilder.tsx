"use client";

import { useState, useMemo } from "react";
import { Code2, Copy, Check, Plus, Trash2, Loader2, Wand2, ChevronDown } from "lucide-react";
import { useAiKeys } from "@/components/context/AiKeysContext";
import { getProvider } from "@/lib/ai/providers";
import { aiChat, extractJson } from "@/lib/ai/client";
import {
  SCHEMA_TYPES,
  buildJsonLd,
  type SchemaFormState,
  type FaqItem,
  type CrumbItem,
} from "@/lib/schema-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AiStatusHint from "@/components/tools/AiStatusHint";
import { ToolPanel, ToolPanelBody, ToolPanelHeader } from "@/components/tools/tool-panel";
import { cn } from "@/lib/utils";

export default function SchemaBuilder() {
  const { selectedProvider, activeKey, hasActiveKey } = useAiKeys();
  const [typeId, setTypeId] = useState(SCHEMA_TYPES[0].id);
  const [state, setState] = useState<SchemaFormState>({
    faq: [{ q: "", a: "" }] as FaqItem[],
    breadcrumb: [{ name: "", url: "" }] as CrumbItem[],
    category: "used-car",
  });
  const [wrapScript, setWrapScript] = useState(true);
  const [copied, setCopied] = useState(false);

  // AI assist
  const [aiOpen, setAiOpen] = useState(false);
  const [aiDesc, setAiDesc] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const type = SCHEMA_TYPES.find((t) => t.id === typeId) ?? SCHEMA_TYPES[0];

  const jsonLd = useMemo(() => buildJsonLd(type, state), [type, state]);
  const jsonText = useMemo(() => JSON.stringify(jsonLd, null, 2), [jsonLd]);
  const output = wrapScript
    ? `<script type="application/ld+json">\n${jsonText}\n</script>`
    : jsonText;

  function setField(key: string, value: string) {
    setState((s) => ({ ...s, [key]: value }));
  }

  // FAQ helpers
  const faqItems = (state.faq as FaqItem[]) ?? [];
  function setFaq(items: FaqItem[]) {
    setState((s) => ({ ...s, faq: items }));
  }
  // Breadcrumb helpers
  const crumbItems = (state.breadcrumb as CrumbItem[]) ?? [];
  function setCrumbs(items: CrumbItem[]) {
    setState((s) => ({ ...s, breadcrumb: items }));
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function aiGenerate() {
    if (!aiDesc.trim() || !hasActiveKey) return;
    setAiLoading(true);
    setAiError(null);
    const provider = getProvider(selectedProvider);
    const system =
      `你是结构化数据专家。根据用户描述生成 Schema.org "${type.schemaType}" 类型的 JSON-LD 数据。` +
      ` 仅返回一个合法 JSON 对象（包含 @context 与 @type），不要任何解释或代码块标记。` +
      ` 字段缺失时合理留空或省略。`;
    const { content, error } = await aiChat({
      provider: selectedProvider,
      apiKey: activeKey,
      model: provider?.defaultModel,
      temperature: 0.3,
      json: true,
      messages: [
        { role: "system", content: system },
        { role: "user", content: aiDesc.trim() },
      ],
    });
    if (error) {
      setAiError(error);
      setAiLoading(false);
      return;
    }
    const parsed = extractJson<Record<string, unknown>>(content);
    if (!parsed) {
      setAiError("AI 返回结果无法解析，请重试。");
      setAiLoading(false);
      return;
    }
    // Map AI result back into the form state best-effort.
    hydrateFromJsonLd(parsed);
    setAiLoading(false);
  }

  function hydrateFromJsonLd(obj: Record<string, unknown>) {
    const next: SchemaFormState = { ...state };
    if (type.id === "faq") {
      const me = (obj.mainEntity as Array<Record<string, unknown>>) ?? [];
      const items: FaqItem[] = me.map((q) => ({
        q: String(q.name ?? ""),
        a: String((q.acceptedAnswer as Record<string, unknown>)?.text ?? ""),
      }));
      next.faq = items.length ? items : [{ q: "", a: "" }];
    } else if (type.id === "breadcrumb") {
      const le = (obj.itemListElement as Array<Record<string, unknown>>) ?? [];
      const items: CrumbItem[] = le.map((i) => ({
        name: String(i.name ?? ""),
        url: String(i.item ?? ""),
      }));
      next.breadcrumb = items.length ? items : [{ name: "", url: "" }];
    } else {
      for (const field of type.fields) {
        const v = obj[field.key];
        if (v == null) continue;
        if (typeof v === "string") next[field.key] = v;
        else if (typeof v === "object") {
          const o = v as Record<string, unknown>;
          next[field.key] = String(o.name ?? o.url ?? "");
        } else if (Array.isArray(v)) {
          next[field.key] = (v as string[]).join(", ");
        }
      }
      // offers → price
      const offers = obj.offers as Record<string, unknown> | undefined;
      if (offers) {
        if (offers.price != null) next.price = String(offers.price);
        if (offers.priceCurrency != null) next.priceCurrency = String(offers.priceCurrency);
      }
    }
    setState(next);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ── Form ── */}
      <div className="space-y-6">
        <ToolPanel>
          <ToolPanelHeader
            icon={Code2}
            title="数据类型与字段"
            description="选择类型并填写内容"
          />
          <ToolPanelBody className="space-y-4">
            {/* Type selector */}
            <div className="flex flex-wrap gap-1.5">
              {SCHEMA_TYPES.map((t) => {
                const on = t.id === typeId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTypeId(t.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      on ? "bg-brand text-white" : "bg-bg-subtle text-fg-muted hover:text-fg"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Fields */}
            <div className="space-y-3">
              {type.fields.map((field) => {
                // conditional visibility
                if (field.showWhen) {
                  const current = (state[field.showWhen.key] as string) ?? "";
                  if (!field.showWhen.values.includes(current)) return null;
                }

                if (field.kind === "select") {
                  const value = (state[field.key] as string) ?? field.options?.[0]?.value ?? "";
                  return (
                    <div key={field.key} className="space-y-1.5">
                      <Label htmlFor={field.key}>{field.label}</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {field.options?.map((opt) => {
                          const on = opt.value === value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setField(field.key, opt.value)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                on ? "bg-brand text-white" : "bg-bg-subtle text-fg-muted hover:text-fg"
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                if (field.kind === "faq") {
                  return (
                    <div key={field.key} className="space-y-2">
                      <Label>{field.label}</Label>
                      {faqItems.map((item, i) => (
                        <div key={i} className="space-y-1.5 rounded-xl bg-bg-subtle p-3">
                          <div className="flex items-center gap-2">
                            <Input
                              value={item.q}
                              onChange={(e) => {
                                const next = [...faqItems];
                                next[i] = { ...next[i], q: e.target.value };
                                setFaq(next);
                              }}
                              placeholder={`问题 ${i + 1}`}
                              className="h-9"
                            />
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setFaq(faqItems.filter((_, idx) => idx !== i))}
                              className="shrink-0 text-fg-muted hover:text-error"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                          <Textarea
                            value={item.a}
                            onChange={(e) => {
                              const next = [...faqItems];
                              next[i] = { ...next[i], a: e.target.value };
                              setFaq(next);
                            }}
                            placeholder="答案"
                            className="min-h-16 bg-bg"
                          />
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setFaq([...faqItems, { q: "", a: "" }])}>
                        <Plus size={13} />
                        添加问答
                      </Button>
                    </div>
                  );
                }

                if (field.kind === "breadcrumb") {
                  return (
                    <div key={field.key} className="space-y-2">
                      <Label>{field.label}</Label>
                      {crumbItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-5 shrink-0 text-center text-xs text-fg-muted">{i + 1}</span>
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const next = [...crumbItems];
                              next[i] = { ...next[i], name: e.target.value };
                              setCrumbs(next);
                            }}
                            placeholder="名称"
                            className="h-9"
                          />
                          <Input
                            value={item.url}
                            onChange={(e) => {
                              const next = [...crumbItems];
                              next[i] = { ...next[i], url: e.target.value };
                              setCrumbs(next);
                            }}
                            placeholder="URL（可选）"
                            className="h-9"
                          />
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setCrumbs(crumbItems.filter((_, idx) => idx !== i))}
                            className="shrink-0 text-fg-muted hover:text-error"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setCrumbs([...crumbItems, { name: "", url: "" }])}>
                        <Plus size={13} />
                        添加层级
                      </Button>
                    </div>
                  );
                }

                const value = (state[field.key] as string) ?? "";
                return (
                  <div key={field.key} className="space-y-1.5">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    {field.kind === "textarea" ? (
                      <Textarea
                        id={field.key}
                        value={value}
                        onChange={(e) => setField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="min-h-16"
                      />
                    ) : (
                      <Input
                        id={field.key}
                        type={field.kind === "date" ? "date" : "text"}
                        value={value}
                        onChange={(e) => setField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="h-9"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </ToolPanelBody>
        </ToolPanel>

        <ToolPanel>
          <button
            type="button"
            onClick={() => setAiOpen((v) => !v)}
            className={cn(
              "flex w-full items-center justify-between px-6 py-4 text-left",
              aiOpen && "border-b border-border/60"
            )}
          >
            <div className="flex items-center gap-2">
              <Wand2 size={15} className="text-fg-muted" />
              <span className="text-sm font-semibold text-fg">AI 从描述生成</span>
            </div>
            <ChevronDown size={16} className={cn("text-fg-muted transition-transform", aiOpen && "rotate-180")} />
          </button>
          {aiOpen && (
            <ToolPanelBody className="space-y-3 border-t-0 pt-0">
              <Textarea
                value={aiDesc}
                onChange={(e) => setAiDesc(e.target.value)}
                placeholder={`粘贴一段描述，AI 会自动填充上方 ${type.label} 字段…`}
                className="min-h-24"
              />
              <Button onClick={aiGenerate} disabled={aiLoading || !aiDesc.trim() || !hasActiveKey} className="gap-2">
                {aiLoading ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
                {aiLoading ? "生成中" : "生成并填充"}
              </Button>
              <AiStatusHint />
              {aiError && (
                <Alert variant="destructive">
                  <AlertDescription className="break-all">{aiError}</AlertDescription>
                </Alert>
              )}
            </ToolPanelBody>
          )}
        </ToolPanel>
      </div>

      {/* ── Output ── */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <ToolPanel>
          <ToolPanelHeader
            title="JSON-LD 输出"
            actions={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWrapScript((v) => !v)}
                  className={cn(
                    "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                    wrapScript ? "bg-brand text-white" : "bg-bg-subtle text-fg-muted hover:text-fg"
                  )}
                >
                  {"<script>"} 包裹
                </button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={copy}>
                  {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                  {copied ? "已复制" : "复制"}
                </Button>
              </div>
            }
          />
          <pre className="max-h-[36rem] overflow-auto rounded-b-xl bg-bg-subtle p-4 text-xs leading-relaxed">
            <code className="font-mono text-fg">{output}</code>
          </pre>
        </ToolPanel>
      </div>
    </div>
  );
}

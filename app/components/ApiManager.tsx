"use client";

import { useState } from "react";
import { Eye, EyeOff, Check, Sparkles, BarChart3, ExternalLink } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAiKeys } from "@/app/context/AiKeysContext";
import { useApiKey } from "@/app/context/ApiKeyContext";
import { AI_PROVIDERS } from "@/app/lib/ai/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* A single key row — reused across all API categories. */
function KeyRow({
  name,
  configured,
  value,
  placeholder,
  keysUrl,
  hint,
  selected,
  onSelect,
  onSave,
  onClear,
}: {
  name: string;
  configured: boolean;
  value: string;
  placeholder: string;
  keysUrl?: string;
  hint?: string;
  selected?: boolean;
  onSelect?: () => void;
  onSave: (v: string) => void;
  onClear: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const [show, setShow] = useState(false);
  const [dirty, setDirty] = useState(false);

  return (
    <div className="rounded-xl bg-muted/40 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{name}</span>
          {configured && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
              <Check size={10} /> 已配置
            </span>
          )}
          {selected !== undefined && (
            <button
              type="button"
              onClick={onSelect}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {selected ? "当前默认" : "设为默认"}
            </button>
          )}
        </div>
        {keysUrl && (
          <a
            href={keysUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            获取 Key <ExternalLink size={11} />
          </a>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type={show ? "text" : "password"}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setDirty(true);
            }}
            placeholder={placeholder}
            className="pr-10 font-mono"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {show ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
        </div>
        <Button
          size="sm"
          disabled={!dirty || !draft.trim()}
          onClick={() => {
            onSave(draft.trim());
            setDirty(false);
          }}
        >
          保存
        </Button>
        {configured && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              onClear();
              setDraft("");
              setDirty(false);
            }}
          >
            清除
          </Button>
        )}
      </div>
      {hint && <p className="mt-2 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
          <Icon size={16} className="text-foreground/70" />
        </div>
        <div>
          <h2 className="text-sm font-semibold leading-tight">{title}</h2>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="space-y-3 p-6">{children}</div>
    </div>
  );
}

export default function ApiManager() {
  const ai = useAiKeys();
  const ahrefs = useApiKey();

  return (
    <div className="space-y-6">
      {/* AI models */}
      <Section
        icon={Sparkles}
        title="AI 模型"
        desc="用于 Slug 生成、UI 翻译、EEAT 评估等 AI 工具。可配置多个并选择默认。"
      >
        {AI_PROVIDERS.map((p) => (
          <KeyRow
            key={p.id}
            name={p.name}
            configured={ai.hasKey(p.id)}
            value={ai.getKey(p.id)}
            placeholder={p.keyPlaceholder}
            keysUrl={p.keysUrl}
            hint={`可用模型：${p.models.map((m) => m.id).join("、")}`}
            selected={ai.selectedProvider === p.id}
            onSelect={() => ai.setSelectedProvider(p.id)}
            onSave={(v) => {
              const hadKey = ai.hasActiveKey;
              ai.setKey(p.id, v);
              if (!hadKey) ai.setSelectedProvider(p.id);
            }}
            onClear={() => ai.setKey(p.id, "")}
          />
        ))}
      </Section>

      {/* SEO data */}
      <Section icon={BarChart3} title="SEO 数据" desc="用于关键词探索等数据查询工具。">
        <KeyRow
          name="Ahrefs"
          configured={ahrefs.hasKey}
          value={ahrefs.apiKey}
          placeholder="粘贴您的 Ahrefs API Key…"
          keysUrl="https://app.ahrefs.com/account/api"
          onSave={(v) => ahrefs.setApiKey(v)}
          onClear={() => ahrefs.setApiKey("")}
        />
      </Section>

      {/* Future categories can be appended here as new <Section> blocks. */}
    </div>
  );
}

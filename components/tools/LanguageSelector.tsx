"use client";

import { LANG_MAP, ALL_LANGS } from "@/lib/languages";
import { Check } from "lucide-react";

interface Props {
  selected: string[];
  onChange: (langs: string[]) => void;
}

export default function LanguageSelector({ selected, onChange }: Props) {
  const selectedSet = new Set(selected);

  function toggle(lang: string) {
    if (selectedSet.has(lang)) {
      // Don't allow deselecting all
      if (selected.length <= 1) return;
      onChange(selected.filter((l) => l !== lang));
    } else {
      onChange([...selected, lang]);
    }
  }

  function selectAll() {
    onChange(ALL_LANGS);
  }

  function selectDefault() {
    onChange(["en", "fr", "ar", "ru", "es"]);
  }

  function clearAll() {
    onChange(["en"]); // keep at least one
  }

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">
          选择查询语言
          <span className="ml-2 text-muted-foreground font-normal">
            已选 {selected.length} / {ALL_LANGS.length} 种
          </span>
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={selectDefault}
            className="px-2 py-1 text-[11px] font-medium bg-muted text-muted-foreground rounded-md hover:bg-accent hover:text-foreground transition-colors"
          >
            默认 5 种
          </button>
          <button
            type="button"
            onClick={selectAll}
            className="px-2 py-1 text-[11px] font-medium bg-muted text-muted-foreground rounded-md hover:bg-accent hover:text-foreground transition-colors"
          >
            全选
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="px-2 py-1 text-[11px] font-medium bg-muted text-muted-foreground rounded-md hover:bg-accent hover:text-foreground transition-colors"
          >
            仅英语
          </button>
        </div>
      </div>

      {/* Language chips grid */}
      <div className="flex flex-wrap gap-2">
        {ALL_LANGS.map((lang) => {
          const cfg = LANG_MAP[lang];
          const isSelected = selectedSet.has(lang);
          return (
            <button
              key={lang}
              type="button"
              onClick={() => toggle(lang)}
              title={`${cfg.name} / ${cfg.nativeName}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-150 select-none ${
                isSelected
                  ? `${cfg.badge} shadow-sm`
                  : "bg-background border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {/* Lang code badge */}
              <span className={`font-bold uppercase text-[10px] ${isSelected ? "" : "opacity-50"}`}>
                {lang}
              </span>
              {/* Names */}
              <span className="flex flex-col leading-tight text-left">
                <span className={`text-[11px] font-semibold ${isSelected ? "" : "text-muted-foreground"}`}>
                  {cfg.name}
                </span>
                <span className={`text-[10px] ${isSelected ? "opacity-70" : "opacity-40"} ${cfg.rtl ? "text-right" : ""}`}
                  dir={cfg.rtl ? "rtl" : undefined}>
                  {cfg.nativeName}
                </span>
              </span>
              {/* Checkmark */}
              {isSelected && (
                <Check size={12} className="shrink-0 ml-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Hint */}
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        选择的语言决定模板的列结构（
        <span className="font-mono">keyword_en</span>、
        <span className="font-mono">keyword_de</span>…）。
        上传文件时会自动检测文件包含的语言列，无需手动对齐。
      </p>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { COUNTRY_MAP, ALL_COUNTRY_CODES } from "@/lib/countries";
import { LANG_MAP, ALL_LANGS } from "@/lib/languages";

interface Props {
  selectedCountries: string[];                  // currently selected in query (for highlight)
  overrides: Record<string, string>;
  onOverride: (country: string, lang: string) => void;
  onReset: (country: string) => void;
  onResetAll: () => void;
  focusCountry?: string;
}

export default function LangMappingPanel({
  selectedCountries, overrides, onOverride, onReset, onResetAll, focusCountry,
}: Props) {
  const [search, setSearch] = useState("");
  const selectedSet = new Set(selectedCountries);
  const overrideCount = Object.keys(overrides).length;

  // Show all countries in COUNTRY_MAP, filtered by search
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ALL_COUNTRY_CODES;
    return ALL_COUNTRY_CODES.filter((c) => {
      const cfg = COUNTRY_MAP[c];
      return (
        c.toLowerCase().includes(q) ||
        (cfg?.name ?? "").includes(q) ||
        (cfg?.lang ?? "").includes(q) ||
        (LANG_MAP[cfg?.lang ?? ""]?.name ?? "").includes(q)
      );
    });
  }, [search]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-foreground">国家语言映射</span>
          <span className="ml-2 text-[11px] text-muted-foreground">
            智能匹配时每个国家使用哪种关键词 · 共 {ALL_COUNTRY_CODES.length} 个国家
          </span>
        </div>
        {overrideCount > 0 && (
          <button
            type="button"
            onClick={onResetAll}
            className="text-[11px] text-destructive hover:text-destructive/80 font-medium transition-colors shrink-0"
          >
            重置全部 ({overrideCount})
          </button>
        )}
      </div>

      {/* Search + legend row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索国家名、代码或语言…"
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground shrink-0">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground inline-block" />已自定义
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />已选中
          </span>
        </div>
      </div>

      {/* Country grid — scrollable */}
      <div className="max-h-72 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">未找到匹配国家</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
            {filtered.map((c) => {
              const cfg = COUNTRY_MAP[c];
              const defaultLang = cfg?.lang ?? "en";
              const effectiveLang = overrides[c] ?? defaultLang;
              const isOverridden = !!overrides[c] && overrides[c] !== defaultLang;
              const isSelected = selectedSet.has(c);
              const isFocused = c === focusCountry;

              return (
                <div
                  key={c}
                  id={`mapping-${c}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                    isFocused
                      ? "border-foreground/30 bg-muted ring-1 ring-foreground/20"
                      : isOverridden
                      ? "border-foreground/15 bg-muted/60"
                      : isSelected
                      ? "border-emerald-200 bg-emerald-50/40"
                      : "border-border bg-background hover:border-foreground/20"
                  }`}
                >
                  {/* Status dot */}
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isOverridden ? "bg-foreground" : isSelected ? "bg-emerald-400" : "bg-muted-foreground/30"
                  }`} />

                  {/* Country info */}
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold text-foreground leading-tight truncate">
                      {cfg?.name ?? c}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">{c}</div>
                  </div>

                  <span className="text-muted-foreground/50 text-[10px] shrink-0">→</span>

                  {/* Lang selector — ALL langs available */}
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="relative">
                      <select
                        value={effectiveLang}
                        onChange={(e) => {
                          if (e.target.value === defaultLang) onReset(c);
                          else onOverride(c, e.target.value);
                        }}
                        className={`appearance-none text-[11px] font-bold uppercase pl-2 pr-5 py-1 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring ${
                          LANG_MAP[effectiveLang]?.badge ?? "bg-muted text-muted-foreground border-border"
                        }`}
                        style={{ backgroundImage: "none" }}
                      >
                        {ALL_LANGS.map((lang) => (
                          <option key={lang} value={lang}>
                            {lang}{lang === defaultLang ? " ★" : ""}
                            {LANG_MAP[lang] ? ` ${LANG_MAP[lang].name}` : ""}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[10px] opacity-40">▾</span>
                    </div>

                    {isOverridden && (
                      <button
                        type="button"
                        onClick={() => onReset(c)}
                        title={`重置为默认 (${defaultLang})`}
                        className="text-muted-foreground/50 hover:text-destructive transition-colors text-[14px] leading-none"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        ★ 为该国默认语言。下拉可选任意语言，若查询时未包含该语言则智能匹配显示 —。
      </p>
    </div>
  );
}

"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, Download, Zap, LayoutGrid, Settings2, Languages, Globe, Info } from "lucide-react";
import CountrySelector from "./CountrySelector";
import LanguageSelector from "./LanguageSelector";
import LangMappingPanel from "./LangMappingPanel";
import PivotTable, { type BatchRow } from "./PivotTable";
import { DEFAULT_COUNTRIES, COUNTRY_MAP, ALL_COUNTRY_CODES } from "@/lib/countries";
import { DEFAULT_LANGS, LANG_MAP, ALL_LANGS } from "@/lib/languages";
import type { LangVolumes } from "@/lib/ahrefs";
import { useApiKey } from "@/components/context/ApiKeyContext";
import { parseCsvCodes, useUrlParams } from "@/lib/url-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

type MatchMode = "smart" | "full";
type PanelType = "lang" | "country" | "mapping" | null;

const LS_OVERRIDES_KEY = "ahrefs_lang_overrides";
const COUNTRY_SET = new Set(ALL_COUNTRY_CODES);
const PANEL_VALUES = ["lang", "country", "mapping"] as const;

function parseLangs(raw: string | null, fallback: string[]): string[] {
  if (!raw) return fallback;
  const langs = raw
    .split(",")
    .map((l) => l.trim().toLowerCase())
    .filter((l) => ALL_LANGS.includes(l));
  return langs.length ? langs : fallback;
}

function parsePanel(raw: string | null): PanelType {
  return PANEL_VALUES.includes(raw as (typeof PANEL_VALUES)[number])
    ? (raw as PanelType)
    : null;
}

function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function detectLangsFromRow(row: Record<string, string>): string[] {
  return Object.keys(row)
    .filter((k) => k.startsWith("keyword_"))
    .map((k) => k.slice(8))
    .filter((lang) => ALL_LANGS.includes(lang));
}

async function downloadTemplateCsv(langs: string[]) {
  const headers = langs.map((l) => `keyword_${l}`);
  const sampleValues: Record<string, string> = {
    en: "seo tool", fr: "outil seo", ar: "أداة سيو", ru: "инструмент seo",
    es: "herramienta seo", de: "SEO-Tool", pt: "ferramenta seo",
    it: "strumento seo", ja: "SEOツール", ko: "SEO 도구",
  };
  const sampleRow = langs.map((l) => sampleValues[l] ?? `keyword_${l}_sample`);
  const csv = [headers, sampleRow].map((r) => r.map((c) => `"${c}"`).join(",")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "ahrefs_keyword_template.csv";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

async function downloadTemplateXlsx(langs: string[]) {
  const XLSX = await import("xlsx");
  const headers = langs.map((l) => `keyword_${l}`);
  const sampleValues: Record<string, string> = {
    en: "seo tool", fr: "outil seo", ar: "أداة سيو", ru: "инструмент seo",
    es: "herramienta seo", de: "SEO-Tool", pt: "ferramenta seo",
    it: "strumento seo", ja: "SEOツール", ko: "SEO 도구",
  };
  const sample = [Object.fromEntries(langs.map((l) => [`keyword_${l}`, sampleValues[l] ?? ""]))];
  const ws = XLSX.utils.json_to_sheet(sample, { header: headers });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, "ahrefs_keyword_template.xlsx");
}

async function parseFile(file: File): Promise<Record<string, string>[]> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
}

async function exportToExcel(
  rows: BatchRow[], countries: string[], langs: string[],
  matchMode: MatchMode, overrides: Record<string, string>
) {
  const XLSX = await import("xlsx");
  const langHeaders = langs.map((l) => `keyword_${l}`);
  let headers: string[];
  let data: Record<string, string | number>[];

  if (matchMode === "full") {
    const cols = countries.flatMap((c) => langs.map((lang) => `${COUNTRY_MAP[c]?.name ?? c}(${c})·${lang}`));
    headers = [...langHeaders, ...cols];
    data = rows.map((row) => {
      const base: Record<string, string | number> = {};
      for (const l of langs) base[`keyword_${l}`] = row.keywords[l] ?? "";
      for (const c of countries)
        for (const lang of langs)
          base[`${COUNTRY_MAP[c]?.name ?? c}(${c})·${lang}`] = row.lang_volumes[lang]?.[c] ?? "";
      return base;
    });
  } else {
    headers = [...langHeaders, ...countries.map((c) => `${COUNTRY_MAP[c]?.name ?? c}(${c})`)];
    data = rows.map((row) => {
      const base: Record<string, string | number> = {};
      for (const l of langs) base[`keyword_${l}`] = row.keywords[l] ?? "";
      for (const c of countries) {
        const eLang = overrides[c] ?? COUNTRY_MAP[c]?.lang ?? "en";
        base[`${COUNTRY_MAP[c]?.name ?? c}(${c})`] = row.lang_volumes[eLang]?.[c] ?? "";
      }
      return base;
    });
  }
  const ws = XLSX.utils.json_to_sheet(data, { header: headers });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Results");
  XLSX.writeFile(wb, matchMode === "full" ? "ahrefs_batch_results_full.xlsx" : "ahrefs_batch_results.xlsx");
}

export default function BatchQuery() {
  const { apiKey, hasKey } = useApiKey();
  const { get, set } = useUrlParams();

  const matchMode: MatchMode = get("b-mode") === "full" ? "full" : "smart";
  const openPanel = parsePanel(get("b-panel"));
  const selectedCountries = parseCsvCodes(get("b-countries"), DEFAULT_COUNTRIES, COUNTRY_SET);
  const selectedLangs = parseLangs(get("b-langs"), DEFAULT_LANGS);

  const [focusCountry, setFocusCountry] = useState<string | undefined>(undefined);
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [queryLangs, setQueryLangs] = useState<string[]>(DEFAULT_LANGS);
  const [langOverrides, setLangOverrides] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  function setMatchMode(mode: MatchMode) {
    set({ "b-mode": mode === "smart" ? null : mode });
  }
  function setOpenPanel(panel: PanelType) {
    set({ "b-panel": panel });
  }
  function setSelectedCountries(next: string[]) {
    set({ "b-countries": arraysEqual(next, DEFAULT_COUNTRIES) ? null : next.join(",") });
  }
  function setSelectedLangs(next: string[]) {
    set({ "b-langs": arraysEqual(next, DEFAULT_LANGS) ? null : next.join(",") });
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_OVERRIDES_KEY);
      if (stored) setLangOverrides(JSON.parse(stored));
    } catch {}
  }, []);

  function saveOverrides(next: Record<string, string>) {
    setLangOverrides(next);
    try { localStorage.setItem(LS_OVERRIDES_KEY, JSON.stringify(next)); } catch {}
  }

  function handleOverride(country: string, lang: string) { saveOverrides({ ...langOverrides, [country]: lang }); }
  function handleReset(country: string) { const n = { ...langOverrides }; delete n[country]; saveOverrides(n); }
  function handleResetAll() { saveOverrides({}); }

  function handleEditMapping(country: string) {
    setFocusCountry(country);
    setOpenPanel("mapping");
    setTimeout(() => {
      document.getElementById(`mapping-${country}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 120);
  }

  function togglePanel(panel: PanelType) {
    const next = openPanel === panel ? null : panel;
    setFocusCountry(undefined);
    setOpenPanel(next);
  }

  async function handleFileAndRun(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null); setRows([]); setProgress(null); setDetectedNote(null);
    let parsed: Record<string, string>[];
    try { parsed = await parseFile(file); }
    catch (err) { setError("文件解析失败: " + String(err)); return; }
    if (!parsed.length) { setError("文件中没有数据行"); return; }
    const fileLangs = detectLangsFromRow(parsed[0]);
    const effectiveLangs = fileLangs.length > 0 ? fileLangs : selectedLangs;
    if (fileLangs.length > 0) {
      setDetectedNote(`自动检测到文件语言：${fileLangs.map((l) => LANG_MAP[l]?.name ?? l).join("、")}`);
    }
    setQueryLangs(effectiveLangs);
    runBatch(parsed, effectiveLangs);
  }

  async function runBatch(inputRows: Record<string, string>[], langs: string[]) {
    setRunning(true);
    setProgress({ done: 0, total: inputRows.length });
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/batch-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-ahrefs-key": apiKey },
        body: JSON.stringify({ rows: inputRows, langs }),
        signal: ctrl.signal,
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      const collected: BatchRow[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const payload = JSON.parse(line.slice(5).trim());
          if (payload.done) { setRows([...collected]); setProgress((p) => ({ done: p?.total ?? 0, total: p?.total ?? 0 })); break; }
          collected.push({ keywords: payload.keywords, lang_volumes: payload.lang_volumes as LangVolumes, error: payload.error });
          setRows([...collected]);
          setProgress({ done: payload.index + 1, total: payload.total });
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") setError("批量查询失败: " + String(err));
    } finally {
      setRunning(false); abortRef.current = null;
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const pct = progress && progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  const overrideCount = Object.keys(langOverrides).length;

  return (
    <div className="rounded-2xl bg-card shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between gap-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
            <LayoutGrid size={16} className="text-foreground/70" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight">批量关键词查询</h2>
            <p className="text-xs text-muted-foreground">上传 Excel / CSV，多语言多国家一次查询</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rows.length > 0 && (
            <Badge variant="secondary">{rows.length} 条结果</Badge>
          )}
          {overrideCount > 0 && matchMode === "smart" && (
            <Badge variant="outline">{overrideCount} 个自定义映射</Badge>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">

        {/* Row 1: Template + Upload + Export */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">下载模板:</span>
          <Button type="button" variant="outline" size="sm" onClick={() => downloadTemplateCsv(selectedLangs)}>CSV</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => downloadTemplateXlsx(selectedLangs)}>Excel</Button>

          <Separator orientation="vertical" className="h-5" />

          <Button
            size="sm"
            disabled={running || !hasKey}
            render={<label htmlFor="batch-file-input" />}
            className="gap-1.5 cursor-pointer"
          >
            <Upload size={13} aria-hidden="true" />
            上传文件并开始
            <input
              id="batch-file-input"
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              aria-label="上传 Excel 或 CSV 文件"
              onChange={handleFileAndRun}
              disabled={running || !hasKey}
            />
          </Button>

          {running && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                if (!window.confirm("确定停止当前批量查询？")) return;
                abortRef.current?.abort();
              }}
              className="gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
              停止
            </Button>
          )}

          {rows.length > 0 && !running && (
            <Button type="button" variant="outline" size="sm"
              onClick={() => exportToExcel(rows, selectedCountries, queryLangs, matchMode, langOverrides)}
              className="gap-1.5 ml-auto">
              <Download size={13} aria-hidden="true" />
              导出 Excel
            </Button>
          )}
        </div>

        {/* Row 2: View controls */}
        <div className="flex flex-wrap items-center gap-2 pt-3">
          {/* Match mode */}
          <div className="flex rounded-lg bg-muted p-0.5 text-xs font-medium">
            <button type="button" onClick={() => setMatchMode("smart")} aria-pressed={matchMode === "smart"}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-[color,background-color,box-shadow] ${matchMode === "smart" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <Zap size={11} aria-hidden="true" />智能匹配
            </button>
            <button type="button" onClick={() => setMatchMode("full")} aria-pressed={matchMode === "full"}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-[color,background-color,box-shadow] ${matchMode === "full" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <LayoutGrid size={11} aria-hidden="true" />全量结果
            </button>
          </div>

          {matchMode === "smart" && (
            <Button type="button" variant={openPanel === "mapping" ? "secondary" : "outline"} size="sm"
              onClick={() => togglePanel("mapping")} className="gap-1.5">
              <Settings2 size={12} aria-hidden="true" />语言映射
              {overrideCount > 0 && (
                <Badge className="h-4 px-1.5 text-[9px]">{overrideCount}</Badge>
              )}
            </Button>
          )}

          <div className="flex-1" />

          <Button type="button" variant={openPanel === "lang" ? "secondary" : "outline"} size="sm"
            onClick={() => togglePanel("lang")} className="gap-1.5">
            <Languages size={12} aria-hidden="true" />模板语言
            <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">{selectedLangs.length}</Badge>
          </Button>

          <Button type="button" variant={openPanel === "country" ? "secondary" : "outline"} size="sm"
            onClick={() => togglePanel("country")} className="gap-1.5">
            <Globe size={12} aria-hidden="true" />查询国家
            <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">{selectedCountries.length}</Badge>
          </Button>
        </div>

        {/* Expandable panels */}
        {openPanel === "mapping" && (
          <div className="rounded-xl bg-muted/50 p-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
            <LangMappingPanel
              selectedCountries={selectedCountries}
              overrides={langOverrides}
              onOverride={handleOverride}
              onReset={handleReset}
              onResetAll={handleResetAll}
              focusCountry={focusCountry}
            />
          </div>
        )}
        {openPanel === "lang" && (
          <div className="rounded-xl bg-muted/50 p-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
            <LanguageSelector selected={selectedLangs} onChange={setSelectedLangs} />
          </div>
        )}
        {openPanel === "country" && (
          <div className="rounded-xl bg-muted/50 p-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
            <CountrySelector selected={selectedCountries} onChange={setSelectedCountries} />
          </div>
        )}

        {/* Notices */}
        {!hasKey && (
          <Alert>
            <AlertDescription>请先在右上角「API 设置」配置 Ahrefs API Key 后再使用批量查询</AlertDescription>
          </Alert>
        )}
        {detectedNote && !running && (
          <Alert>
            <Info size={14} aria-hidden="true" />
            <AlertDescription>{detectedNote}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="break-all">{error}</AlertDescription>
          </Alert>
        )}

        {/* Progress */}
        {progress && (
          <div className="space-y-2" aria-live="polite" aria-atomic="true">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                {running && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />}
                {running ? "处理中…" : "已完成"} {progress.done} / {progress.total}
              </span>
              <span className="font-mono font-semibold tabular-nums">{pct}%</span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
        )}

        {/* Pivot table */}
        {rows.length > 0 && (
          <PivotTable
            rows={rows}
            countries={selectedCountries}
            langs={queryLangs}
            matchMode={matchMode}
            langOverrides={langOverrides}
            onEditMapping={matchMode === "smart" ? handleEditMapping : undefined}
          />
        )}

        {/* Empty state */}
        {!running && rows.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <Upload size={18} className="text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium mb-1">上传 Excel 或 CSV 文件开始批量查询</p>
            <p className="text-xs text-muted-foreground">先选择语言并下载模板，填写关键词后上传</p>
          </div>
        )}
      </div>
    </div>
  );
}

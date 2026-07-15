"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Download, FileSpreadsheet, ListFilter, Loader2, Search, Upload, X } from "lucide-react";
import { useApiKey } from "@/components/context/ApiKeyContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ToolPanel, ToolPanelBody, ToolPanelHeader } from "@/components/tools/tool-panel";
import { ALL_COUNTRY_CODES, COUNTRY_MAP } from "@/lib/countries";

interface IntentMap {
  informational?: boolean;
  navigational?: boolean;
  commercial?: boolean;
  transactional?: boolean;
  branded?: boolean;
  local?: boolean;
}

interface MatchingTerm {
  keyword: string;
  volume: number | null;
  global_volume: number | null;
  difficulty: number | null;
  cpc: number | null;
  traffic_potential: number | null;
  parent_topic: string | null;
  intents: IntentMap | null;
}

interface MatchingTermRow extends MatchingTerm {
  seedKeyword: string;
}

interface SerpPosition {
  position: number;
  title: string | null;
  url: string | null;
  type: string[];
  page_type: string | null;
  domain_rating: number | null;
  url_rating: number | null;
  traffic: number | null;
  update_date: string | null;
}

interface SourceSerpRow extends SerpPosition {
  sourceKeyword: string;
}

type QueryMode = "single" | "batch";

const MAX_BATCH_KEYWORDS = 5_000;
const REQUEST_INTERVAL_MS = 2_100;
const RESULT_UPDATE_INTERVAL = 25;

const INTENT_LABELS: Record<keyof IntentMap, string> = {
  informational: "信息",
  navigational: "导航",
  commercial: "商业",
  transactional: "交易",
  branded: "品牌",
  local: "本地",
};

function formatNumber(value: number | null) {
  return value == null ? "—" : value.toLocaleString();
}

function intentText(intents: IntentMap | null) {
  if (!intents) return "";
  return Object.entries(intents)
    .filter(([, active]) => active)
    .map(([key]) => INTENT_LABELS[key as keyof IntentMap])
    .join("、");
}

function downloadBlob(content: BlobPart, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function downloadBatchCsvTemplate() {
  downloadBlob(
    "\uFEFFkeyword\r\ntoyota\r\nhonda\r\nused cars",
    "text/csv;charset=utf-8",
    "matching-terms-template.csv"
  );
}

async function downloadBatchExcelTemplate() {
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.json_to_sheet([
    { keyword: "toyota" },
    { keyword: "honda" },
    { keyword: "used cars" },
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Keywords");
  XLSX.writeFile(workbook, "matching-terms-template.xlsx");
}

export default function MatchingTerms() {
  const { apiKey, hasKey } = useApiKey();
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("GH");
  const [limit, setLimit] = useState(20);
  const [matchMode, setMatchMode] = useState<"terms" | "phrase">("terms");
  const [termType, setTermType] = useState<"all" | "questions">("all");
  const [queryMode, setQueryMode] = useState<QueryMode>("single");
  const [batchKeywords, setBatchKeywords] = useState<string[]>([]);
  const [batchFilename, setBatchFilename] = useState("");
  const [rows, setRows] = useState<MatchingTermRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queried, setQueried] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [serpRows, setSerpRows] = useState<SourceSerpRow[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function importKeywords(file: File) {
    setError(null);
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const keys = records.length > 0 ? Object.keys(records[0]) : [];
      const keywordKey = keys.find((key) => ["keyword", "keywords", "关键词"].includes(key.trim().toLowerCase())) ?? keys[0];
      const imported = Array.from(new Set(records.map((row) => String(row[keywordKey] ?? "").trim()).filter(Boolean)));
      if (imported.length === 0) throw new Error("文件中没有可用的关键词");
      if (imported.length > MAX_BATCH_KEYWORDS) {
        throw new Error(`单次最多导入 ${MAX_BATCH_KEYWORDS.toLocaleString()} 个关键词`);
      }
      setBatchKeywords(imported);
      setBatchFilename(file.name);
      setRows([]);
      setQueried(false);
    } catch (importError) {
      setBatchKeywords([]);
      setBatchFilename("");
      setError(`导入失败：${importError instanceof Error ? importError.message : String(importError)}`);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function clearBatch() {
    setBatchKeywords([]);
    setBatchFilename("");
    setRows([]);
    setSerpRows([]);
    setQueried(false);
  }

  async function runQuery(event: React.FormEvent) {
    event.preventDefault();
    const seeds = queryMode === "single" ? [keyword.trim()].filter(Boolean) : batchKeywords;
    if (seeds.length === 0) return setError(queryMode === "single" ? "请输入关键词" : "请先导入关键词文件");
    if (!Number.isInteger(limit) || limit < 1 || limit > 150_000) {
      return setError("返回数量必须是 1–150,000 的整数");
    }

    setLoading(true);
    setError(null);
    setQueried(false);
    setRows([]);
    setSerpRows([]);
    setProgress({ done: 0, total: seeds.length });
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const collected: MatchingTermRow[] = [];
      const collectedSerp: SourceSerpRow[] = [];
      for (let index = 0; index < seeds.length; index += 1) {
        const seedKeyword = seeds[index];
        const params = new URLSearchParams({ keyword: seedKeyword, country, limit: String(limit), match_mode: matchMode, terms: termType });
        const serpParams = new URLSearchParams({ keyword: seedKeyword, country, top_positions: "20" });
        const [response, serpResponse] = await Promise.all([
          fetch(`/api/matching-terms?${params}`, { headers: { "x-ahrefs-key": apiKey }, signal: controller.signal }),
          fetch(`/api/serp-overview?${serpParams}`, { headers: { "x-ahrefs-key": apiKey }, signal: controller.signal }),
        ]);
        const [payload, serpPayload] = await Promise.all([
          response.json() as Promise<{ keywords?: MatchingTerm[]; error?: string }>,
          serpResponse.json() as Promise<{ positions?: SerpPosition[]; error?: string }>,
        ]);
        if (!response.ok) throw new Error(`${seedKeyword}：${payload.error || "查询失败"}`);
        if (!serpResponse.ok) throw new Error(`${seedKeyword} SERP：${serpPayload.error || "查询失败"}`);
        collected.push(...(payload.keywords ?? []).map((row) => ({ ...row, seedKeyword })));
        collectedSerp.push(...(serpPayload.positions ?? []).map((row) => ({ ...row, sourceKeyword: seedKeyword })));
        if ((index + 1) % RESULT_UPDATE_INTERVAL === 0 || index === seeds.length - 1) {
          setRows([...collected]);
          setSerpRows([...collectedSerp]);
        }
        setProgress({ done: index + 1, total: seeds.length });
        if (index < seeds.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, REQUEST_INTERVAL_MS));
        }
      }
      setQueried(true);
    } catch (queryError) {
      if ((queryError as Error).name !== "AbortError") {
        setError(queryError instanceof Error ? queryError.message : String(queryError));
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function exportCsv() {
    const headers = ["来源关键词", "数据类型", "关键词/标题", "SERP URL", "SERP排名", "国家", "搜索意图/结果类型", "搜索量", "全球搜索量", "KD", "CPC(美分)", "流量潜力", "父主题", "页面类型", "DR", "UR", "SERP流量", "更新时间"];
    const values = [
      ...rows.map((row) => [row.seedKeyword, "匹配关键词", row.keyword, "", "", country, intentText(row.intents), row.volume ?? "", row.global_volume ?? "", row.difficulty ?? "", row.cpc ?? "", row.traffic_potential ?? "", row.parent_topic ?? "", "", "", "", "", ""]),
      ...serpRows.map((row) => [row.sourceKeyword, "SERP", row.title ?? "", row.url ?? "", row.position, country, row.type.join("、"), "", "", "", "", "", "", row.page_type ?? "", row.domain_rating ?? "", row.url_rating ?? "", row.traffic ?? "", row.update_date ?? ""]),
    ];
    const csv = [headers, ...values]
      .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\r\n");
    downloadBlob(`\uFEFF${csv}`, "text/csv;charset=utf-8", `matching-terms-${queryMode === "batch" ? "batch" : keyword}-${country}.csv`);
  }

  async function exportExcel() {
    const XLSX = await import("xlsx");
    const countryLabel = `${COUNTRY_MAP[country]?.name ?? country} (${country})`;
    const matchingData = rows.map((row) => ({ 来源关键词: row.seedKeyword, 匹配关键词: row.keyword, 国家: countryLabel, 搜索意图: intentText(row.intents), 搜索量: row.volume, 全球搜索量: row.global_volume, KD: row.difficulty, "CPC(美分)": row.cpc, 流量潜力: row.traffic_potential, 父主题: row.parent_topic }));
    const serpData = serpRows.map((row) => ({ 来源关键词: row.sourceKeyword, 国家: countryLabel, 排名: row.position, 标题: row.title, "SERP URL": row.url, 结果类型: row.type.join("、"), 页面类型: row.page_type, DR: row.domain_rating, UR: row.url_rating, 流量: row.traffic, 更新时间: row.update_date }));
    const matchingSheet = XLSX.utils.json_to_sheet(matchingData);
    const serpSheet = XLSX.utils.json_to_sheet(serpData);
    serpData.forEach((row, index) => {
      if (!row["SERP URL"]) return;
      const cell = serpSheet[XLSX.utils.encode_cell({ r: index + 1, c: 4 })];
      if (cell) cell.l = { Target: String(row["SERP URL"]), Tooltip: String(row.标题 ?? row["SERP URL"]) };
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, matchingSheet, "匹配关键词");
    XLSX.utils.book_append_sheet(workbook, serpSheet, "来源词 SERP");
    XLSX.writeFile(workbook, `matching-terms-${queryMode === "batch" ? "batch" : keyword}-${country}.xlsx`);
  }

  return (
    <ToolPanel>
      <ToolPanelHeader
        icon={ListFilter}
        title="查询条件"
        description="结果按本地搜索量从高到低排列"
        actions={rows.length > 0 ? (
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
              <Download aria-hidden="true" />导出 CSV
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={exportExcel}>
              <FileSpreadsheet aria-hidden="true" />导出 Excel
            </Button>
          </div>
        ) : undefined}
      />
      <ToolPanelBody className="space-y-6">
        {!hasKey ? (
          <Alert>
            <AlertDescription>
              尚未设置 Ahrefs API Key。请先前往 <Link href="/tools/settings" className="font-medium text-brand">API 设置</Link>，或配置服务端环境变量。
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex w-fit rounded-lg bg-bg-inset p-0.5 text-xs font-medium">
          <button type="button" onClick={() => setQueryMode("single")} className={`rounded-md px-3 py-1.5 ${queryMode === "single" ? "bg-bg-card text-fg shadow-sm" : "text-fg-muted"}`}>单个关键词</button>
          <button type="button" onClick={() => setQueryMode("batch")} className={`rounded-md px-3 py-1.5 ${queryMode === "batch" ? "bg-bg-card text-fg shadow-sm" : "text-fg-muted"}`}>批量导入</button>
        </div>

        <form onSubmit={runQuery} className="space-y-4">
          {queryMode === "single" ? (
            <div className="space-y-1.5">
              <Label htmlFor="matching-keyword">关键词</Label>
              <Input id="matching-keyword" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="例如：toyota" autoComplete="off" />
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="matching-file">关键词文件</Label>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={downloadBatchCsvTemplate}><Download aria-hidden="true" />下载 CSV 模板</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={downloadBatchExcelTemplate}><FileSpreadsheet aria-hidden="true" />下载 Excel 模板</Button>
                </div>
              </div>
              <input ref={fileRef} id="matching-file" type="file" accept=".csv,.xlsx,.xls" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importKeywords(file); }} />
              {batchKeywords.length === 0 ? (
                <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-bg-inset px-4 py-8 text-sm text-fg-muted transition-colors hover:border-brand hover:text-brand">
                  <Upload aria-hidden="true" className="size-4" />导入 CSV 或 Excel
                  <span className="text-xs text-fg-subtle">支持 keyword、keywords、关键词列；最多 5,000 个</span>
                </button>
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-bg-inset px-4 py-3 text-sm">
                  <FileSpreadsheet className="size-4 text-brand" aria-hidden="true" />
                  <div className="min-w-0 flex-1"><p className="truncate font-medium text-fg">{batchFilename}</p><p className="text-xs text-fg-muted">已导入 {batchKeywords.length.toLocaleString()} 个关键词；预计至少 {Math.max(1, Math.ceil(batchKeywords.length * REQUEST_INTERVAL_MS / 60_000))} 分钟</p></div>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={clearBatch} aria-label="移除导入文件"><X aria-hidden="true" /></Button>
                </div>
              )}
            </div>
          )}

          <div className="grid items-end gap-4 md:grid-cols-[minmax(180px,1fr)_150px_150px_170px_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="matching-country">国家</Label>
            <select id="matching-country" value={country} onChange={(event) => setCountry(event.target.value)} className="h-8 w-full rounded-lg border border-input bg-bg-card px-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25">
              {ALL_COUNTRY_CODES.map((code) => <option key={code} value={code}>{COUNTRY_MAP[code]?.name ?? code} ({code})</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="matching-limit">每个关键词返回数量</Label>
            <Input id="matching-limit" type="number" min={1} max={150000} step={1} value={limit || ""} onChange={(event) => setLimit(Number(event.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="matching-term-type">关键词类型</Label>
            <select id="matching-term-type" value={termType} onChange={(event) => setTermType(event.target.value as "all" | "questions")} className="h-8 w-full rounded-lg border border-input bg-bg-card px-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25">
              <option value="all">全部关键词</option>
              <option value="questions">问题关键词</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="matching-mode">匹配模式</Label>
            <select id="matching-mode" value={matchMode} onChange={(event) => setMatchMode(event.target.value as "terms" | "phrase")} className="h-8 w-full rounded-lg border border-input bg-bg-card px-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25">
              <option value="terms">词条匹配</option>
              <option value="phrase">短语匹配</option>
            </select>
          </div>
          {loading ? (
            <Button type="button" size="sm" variant="outline" onClick={() => abortRef.current?.abort()}>
              <X aria-hidden="true" />停止
            </Button>
          ) : <Button type="submit" size="sm">
            {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Search aria-hidden="true" />}
            查询
          </Button>}
          </div>
        </form>

        {loading && progress.total > 1 ? (
          <div className="space-y-2"><div className="flex justify-between text-xs text-fg-muted"><span>正在批量查询</span><span>{progress.done}/{progress.total}</span></div><Progress value={(progress.done / progress.total) * 100} /></div>
        ) : null}

        {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}

        {queried && rows.length === 0 ? <div className="rounded-xl bg-bg-inset py-12 text-center text-sm text-fg-muted">未找到匹配关键词</div> : null}

        {rows.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border bg-bg-inset px-4 py-2.5 text-xs text-fg-muted">
              <span>匹配词 <strong className="text-fg">{rows.length.toLocaleString()}</strong> 条 · 来源词 SERP <strong className="text-fg">{serpRows.length.toLocaleString()}</strong> 条</span>
              <span>{COUNTRY_MAP[country]?.name} · {queryMode === "batch" ? `${progress.total} 个来源词` : keyword}</span>
            </div>
            <div className="max-h-[640px] overflow-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="sticky top-0 z-10 bg-bg-card text-xs text-fg-muted shadow-[0_1px_0_var(--color-border)]">
                  <tr>{queryMode === "batch" ? <th className="px-4 py-2.5 font-medium">来源关键词</th> : null}<th className="px-4 py-2.5 font-medium">匹配关键词</th><th className="px-3 py-2.5 font-medium">意图</th><th className="px-3 py-2.5 text-right font-medium">KD</th><th className="px-3 py-2.5 text-right font-medium">搜索量</th><th className="px-3 py-2.5 text-right font-medium">全球量</th><th className="px-3 py-2.5 text-right font-medium">CPC</th><th className="px-3 py-2.5 text-right font-medium">流量潜力</th><th className="px-4 py-2.5 font-medium">父主题</th></tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {rows.map((row, index) => (
                    <tr key={`${row.keyword}-${index}`} className="hover:bg-bg-subtle">
                      {queryMode === "batch" ? <td className="px-4 py-2.5 text-fg-muted">{row.seedKeyword}</td> : null}
                      <td className="px-4 py-2.5 font-medium text-fg">{row.keyword}</td>
                      <td className="px-3 py-2.5 text-xs text-fg-muted">{intentText(row.intents) || "—"}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatNumber(row.difficulty)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatNumber(row.volume)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-fg-muted">{formatNumber(row.global_volume)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-fg-muted">{row.cpc == null ? "—" : `$${(row.cpc / 100).toFixed(2)}`}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-fg-muted">{formatNumber(row.traffic_potential)}</td>
                      <td className="max-w-56 truncate px-4 py-2.5 text-fg-muted" title={row.parent_topic ?? ""}>{row.parent_topic || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </ToolPanelBody>
    </ToolPanel>
  );
}

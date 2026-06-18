"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check, Loader2 } from "lucide-react";
import { COUNTRY_MAP, ALL_COUNTRY_CODES, CONTINENTS, COUNTRIES_BY_CONTINENT } from "@/lib/countries";
import { LANG_MAP } from "@/lib/languages";
import { useApiKey } from "@/components/context/ApiKeyContext";
import { parseCsvCodes, useUrlParams } from "@/lib/url-state";
import { VirtualList } from "@/components/tools/VirtualList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Tab = "volume-by-country" | "overview" | "multi-country";

interface VolumeItem { country: string; volume: number; }
interface OverviewData {
  keyword?: string; volume?: number; cpc?: number; difficulty?: number;
  clicks?: number; global_volume?: number; traffic_potential?: number; cps?: number;
  [key: string]: unknown;
}

const DEFAULT_MULTI_COUNTRIES = ["GH", "DZ", "GE", "US"];
const COUNTRY_SET = new Set(ALL_COUNTRY_CODES);
const TAB_VALUES: Tab[] = ["volume-by-country", "overview", "multi-country"];

function parseTab(raw: string | null): Tab {
  return TAB_VALUES.includes(raw as Tab) ? (raw as Tab) : "volume-by-country";
}

function renderCountryOption(c: string, value: string, onPick: (code: string) => void) {
  const ccfg = COUNTRY_MAP[c];
  const isSelected = c === value;
  return (
    <button
      key={c}
      type="button"
      onClick={() => onPick(c)}
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors ${isSelected ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted"}`}
    >
      <span className="font-mono text-[10px] text-muted-foreground w-6 shrink-0">{c}</span>
      <span className="flex-1">{ccfg?.name ?? c}</span>
      {isSelected && <Check size={11} className="shrink-0" />}
    </button>
  );
}

function renderCountryGridItem(
  c: string,
  isSelected: boolean,
  onToggle: (code: string) => void
) {
  const cfg = COUNTRY_MAP[c];
  return (
    <button
      key={c}
      type="button"
      onClick={() => onToggle(c)}
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${isSelected ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted"}`}
    >
      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 text-[10px] ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-input"}`}>
        {isSelected && "✓"}
      </span>
      <span className="font-mono text-[9px] text-muted-foreground w-6 shrink-0">{c}</span>
      <span className="flex-1 truncate">{cfg?.name ?? c}</span>
    </button>
  );
}

const QUICK_PRESETS: { label: string; countries: string[] }[] = [
  { label: "Guazi 热门", countries: ["RU","US","GH","BY","NL","DZ","NG","GB","DE","GE","FR","PL","CA","KG","KZ","AM","UZ","ZA","SA","AZ","ES","TJ","CI","RO"] },
  { label: "欧洲", countries: ["GB","DE","FR","IT","ES","NL","SE","PL","RU","TR"] },
  { label: "亚洲", countries: ["JP","KR","IN","SG","TH","ID","MY","PH","VN","AE"] },
  { label: "阿拉伯", countries: ["SA","AE","EG","MA","IQ","QA","KW","JO","DZ","TN"] },
  { label: "拉美", countries: ["BR","MX","AR","CO","CL","PE","VE","EC"] },
];

function formatVol(v: number | null | undefined): string {
  if (v == null) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 10_000) return `${Math.round(v / 1_000)}K`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString();
}

const cpcFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCpc(v: unknown): string {
  const n = Number(v);
  return Number.isFinite(n) ? cpcFmt.format(n) : "—";
}

/* ── Single-country searchable select ── */
function CountrySearchSelect({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch(""); }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 30); }, [open]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ALL_COUNTRY_CODES;
    return ALL_COUNTRY_CODES.filter((c) => {
      const cfg = COUNTRY_MAP[c];
      return c.toLowerCase().includes(q) || (cfg?.name ?? "").includes(q);
    });
  }, [search]);

  const cfg = COUNTRY_MAP[value];

  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`选择国家，当前 ${cfg?.name ?? value}`}
        className="gap-2 min-w-[140px] justify-between font-normal"
      >
        <span>
          <span className="font-medium">{cfg?.name ?? value}</span>
          <span className="text-muted-foreground ml-1.5 text-xs">{value}</span>
        </span>
        <ChevronDown size={13} className={`text-muted-foreground transition-transform shrink-0 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </Button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 bg-background ring-1 ring-black/5 rounded-lg shadow-xl shadow-black/10 w-60 overflow-hidden">
          <div className="p-2 border-b border-border/60">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") { setOpen(false); setSearch(""); } }}
                placeholder="搜索国家…"
                aria-label="搜索国家"
                autoComplete="off"
                spellCheck={false}
                className="h-7 pl-7 text-xs"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="text-center text-muted-foreground text-xs py-4">未找到</div>
            ) : filtered.length > 40 ? (
              <VirtualList
                items={filtered}
                itemHeight={28}
                maxHeight={224}
                getKey={(c) => c}
                renderItem={(c) =>
                  renderCountryOption(c, value, (code) => {
                    onChange(code);
                    setOpen(false);
                    setSearch("");
                  })
                }
              />
            ) : (
              filtered.map((c) =>
                renderCountryOption(c, value, (code) => {
                  onChange(code);
                  setOpen(false);
                  setSearch("");
                })
              )
            )}
          </div>
          <div className="px-3 py-1.5 border-t border-border/60 text-[11px] text-muted-foreground">
            共 {ALL_COUNTRY_CODES.length} 个{search ? `，筛选 ${filtered.length} 个` : ""}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Multi-country picker ── */
function MultiCountryPicker({ selected, onChange, pickerRef }: { selected: string[]; onChange: (v: string[]) => void; pickerRef?: React.Ref<HTMLDivElement> }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeContinent, setActiveContinent] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch(""); }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 30); }, [open]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const base = activeContinent ? (COUNTRIES_BY_CONTINENT[activeContinent] ?? ALL_COUNTRY_CODES) : ALL_COUNTRY_CODES;
    if (!q) return base;
    return base.filter((c) => {
      const cfg = COUNTRY_MAP[c];
      return c.toLowerCase().includes(q) || (cfg?.name ?? "").includes(q) || (LANG_MAP[cfg?.lang ?? ""]?.name ?? "").includes(q);
    });
  }, [search, activeContinent]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const countryRows = useMemo(() => {
    const rows: string[][] = [];
    for (let i = 0; i < filtered.length; i += 2) rows.push(filtered.slice(i, i + 2));
    return rows;
  }, [filtered]);

  function toggle(code: string) {
    selectedSet.has(code) ? onChange(selected.filter((c) => c !== code)) : onChange([...selected, code]);
  }
  function applyPreset(countries: string[]) { onChange(countries); setOpen(false); }

  return (
    <div ref={ref} className="relative w-full">
      {/* Chip input */}
      <div
        ref={pickerRef}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="选择多个国家"
        tabIndex={0}
        className="flex flex-wrap gap-1.5 min-h-[38px] items-center p-2 rounded-md border border-input bg-background cursor-text focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25 transition"
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        {selected.length === 0 && !open && (
          <span className="text-sm text-muted-foreground px-1">点击选择国家…</span>
        )}
        {selected.map((c) => (
          <Badge key={c} variant="secondary" className="gap-1 pr-1 text-xs font-normal">
            <span className="font-mono text-[9px] opacity-60">{c}</span>
            {COUNTRY_MAP[c]?.name ?? c}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggle(c); }}
              aria-label={`移除 ${COUNTRY_MAP[c]?.name ?? c}`}
              className="ml-0.5 rounded hover:bg-foreground/10 px-0.5"
            >×</button>
          </Badge>
        ))}
        {open && (
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") { setOpen(false); setSearch(""); } }}
            placeholder="搜索国家…"
            aria-label="搜索国家"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 min-w-20 bg-transparent text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/25 rounded placeholder:text-muted-foreground"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {selected.length > 0 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange([]); }}
            className="ml-auto text-[10px] text-muted-foreground hover:text-destructive transition-colors px-1 shrink-0"
          >全清</button>
        )}
      </div>

      {selected.length > 0 && (
        <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
          {selected.length}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-background rounded-xl shadow-xl shadow-black/10 ring-1 ring-black/5 z-30 overflow-hidden">
          {/* Presets */}
          <div className="px-3 pt-3 pb-2 border-b border-border/60">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">快速预设</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PRESETS.map((p) => (
                <Button key={p.label} type="button" variant="outline" size="sm"
                  className="h-6 text-xs px-2" onClick={() => applyPreset(p.countries)}>
                  {p.label}
                </Button>
              ))}
              {selected.length > 0 && (
                <Button type="button" variant="ghost" size="sm"
                  className="h-6 text-xs px-2 text-destructive hover:text-destructive" onClick={() => onChange([])}>
                  清空
                </Button>
              )}
            </div>
          </div>

          {/* Continent tabs */}
          <div className="px-3 py-2 border-b border-border/60 flex gap-1 overflow-x-auto">
            {["全部", ...CONTINENTS].map((cont) => {
              const isActive = cont === "全部" ? !activeContinent : activeContinent === cont;
              return (
                <Button key={cont} type="button" variant={isActive ? "default" : "ghost"}
                  size="sm" className="h-6 text-xs px-2.5 shrink-0 whitespace-nowrap"
                  onClick={() => setActiveContinent(cont === "全部" ? null : (activeContinent === cont ? null : cont))}>
                  {cont}
                  {cont !== "全部" && (
                    <span className="ml-1 opacity-60">{COUNTRIES_BY_CONTINENT[cont]?.length ?? 0}</span>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Country grid */}
          <div className="max-h-72 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-6">未找到匹配国家</div>
            ) : countryRows.length > 20 ? (
              <VirtualList
                items={countryRows}
                itemHeight={36}
                maxHeight={288}
                className="px-0"
                getKey={(row, i) => row.join("-") || String(i)}
                renderItem={(row) => (
                  <div className="grid grid-cols-2 gap-0.5">
                    {row.map((c) => renderCountryGridItem(c, selectedSet.has(c), toggle))}
                    {row.length === 1 && <div />}
                  </div>
                )}
              />
            ) : (
              <div className="grid grid-cols-2 gap-0.5">
                {filtered.map((c) => renderCountryGridItem(c, selectedSet.has(c), toggle))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              已选 <strong>{selected.length}</strong> 个国家
            </span>
            <Button type="button" size="sm" className="h-7 text-xs"
              onClick={() => { setOpen(false); setSearch(""); }}>
              确认
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main component ── */
export default function SingleQuery() {
  const { apiKey, hasKey } = useApiKey();
  const { get, set } = useUrlParams();

  const tab = parseTab(get("s-tab"));
  const country = (() => {
    const c = get("s-country")?.toUpperCase();
    return c && COUNTRY_MAP[c] ? c : "US";
  })();
  const selectedCountries = parseCsvCodes(get("s-countries"), DEFAULT_MULTI_COUNTRIES, COUNTRY_SET);

  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volumeRows, setVolumeRows] = useState<VolumeItem[]>([]);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [multiResults, setMultiResults] = useState<Record<string, OverviewData> | null>(null);
  const keywordRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const keywordSynced = useRef(false);

  useEffect(() => {
    const q = get("q");
    if (q) setKeyword(q);
    keywordSynced.current = true;
  }, [get]);

  useEffect(() => {
    if (!keywordSynced.current) return;
    const t = setTimeout(() => set({ q: keyword.trim() || null }), 400);
    return () => clearTimeout(t);
  }, [keyword, set]);

  function setTab(next: Tab) {
    set({ "s-tab": next === "volume-by-country" ? null : next });
  }
  function setCountry(next: string) {
    set({ "s-country": next === "US" ? null : next });
  }
  function setSelectedCountries(next: string[]) {
    const isDefault =
      next.length === DEFAULT_MULTI_COUNTRIES.length &&
      next.every((c, i) => c === DEFAULT_MULTI_COUNTRIES[i]);
    set({ "s-countries": isDefault ? null : next.join(",") });
  }

  const reqHeaders: Record<string, string> = { "x-ahrefs-key": apiKey, "Content-Type": "application/json" };

  async function queryVolumeByCountry() {
    setLoading(true); setError(null); setVolumeRows([]);
    try {
      const r = await fetch(`/api/volume-by-country?keyword=${encodeURIComponent(keyword)}`, { headers: reqHeaders });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setVolumeRows((d.countries ?? []).sort((a: VolumeItem, b: VolumeItem) => (b.volume ?? 0) - (a.volume ?? 0)));
    } catch (e) { setError(String(e)); } finally { setLoading(false); }
  }

  async function queryOverview() {
    setLoading(true); setError(null); setOverviewData(null);
    try {
      const r = await fetch(`/api/overview?keyword=${encodeURIComponent(keyword)}&country=${country}`, { headers: reqHeaders });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setOverviewData(d.keywords?.[0] ?? d);
    } catch (e) { setError(String(e)); } finally { setLoading(false); }
  }

  async function queryMultiCountry() {
    if (!selectedCountries.length) return;
    setLoading(true); setError(null); setMultiResults(null);
    try {
      const r = await fetch("/api/multi-country-overview", {
        method: "POST", headers: reqHeaders,
        body: JSON.stringify({ keyword, countries: selectedCountries }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setMultiResults(d.results);
    } catch (e) { setError(String(e)); } finally { setLoading(false); }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) {
      keywordRef.current?.focus();
      return;
    }
    if (tab === "multi-country" && selectedCountries.length === 0) {
      pickerRef.current?.focus();
      return;
    }
    if (tab === "volume-by-country") queryVolumeByCountry();
    else if (tab === "overview") queryOverview();
    else queryMultiCountry();
  }

  const maxVol = volumeRows[0]?.volume ?? 1;
  const overviewMetrics = [
    { key: "volume",            label: "搜索量",     fmt: (v: unknown) => formatVol(Number(v)) },
    { key: "global_volume",     label: "全球搜索量", fmt: (v: unknown) => formatVol(Number(v)) },
    { key: "difficulty",        label: "关键词难度", fmt: (v: unknown) => String(v) },
    { key: "cpc",               label: "CPC",        fmt: (v: unknown) => formatCpc(v) },
    { key: "traffic_potential", label: "流量潜力",   fmt: (v: unknown) => formatVol(Number(v)) },
    { key: "clicks",            label: "点击量",     fmt: (v: unknown) => formatVol(Number(v)) },
  ];

  const tabLabels: Record<Tab, string> = {
    "volume-by-country": "各国搜索量",
    "overview": "目标国数据",
    "multi-country": "多国对比",
  };

  return (
    <div className="rounded-2xl bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
          <Search size={16} className="text-foreground/70" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-semibold leading-tight">单个关键词查询</h2>
          <p className="text-xs text-muted-foreground">查看各国搜索量、目标国数据或多国对比</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList>
            {(Object.keys(tabLabels) as Tab[]).map((key) => (
              <TabsTrigger key={key} value={key}>{tabLabels[key]}</TabsTrigger>
            ))}
          </TabsList>

          {/* Search form — shared across tabs */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <label className="flex-1 min-w-52 relative">
                <span className="sr-only">关键词</span>
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
                <Input
                  ref={keywordRef}
                  name="keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="输入关键词，例如 ahrefs…"
                  autoComplete="off"
                  spellCheck={false}
                  className="pl-9"
                />
              </label>

              {tab === "overview" && (
                <CountrySearchSelect value={country} onChange={setCountry} />
              )}

              <Button
                type="submit"
                disabled={loading || !hasKey || (tab === "multi-country" && selectedCountries.length === 0)}
                className="gap-2 shrink-0"
              >
                {loading ? <><Loader2 size={14} className="animate-spin" aria-hidden="true" />查询中…</> : "查询"}
              </Button>
            </div>

            {tab === "multi-country" && (
              <MultiCountryPicker pickerRef={pickerRef} selected={selectedCountries} onChange={setSelectedCountries} />
            )}
          </form>

          {/* Warnings / Errors */}
          {!hasKey && (
            <Alert>
              <AlertDescription>请先在右上角「API 设置」配置 Ahrefs API Key 后再查询</AlertDescription>
            </Alert>
          )}
          {tab === "multi-country" && selectedCountries.length === 0 && (
            <Alert>
              <AlertDescription>请至少选择一个国家后再查询</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="break-all">{error}</AlertDescription>
            </Alert>
          )}

          {/* Results: volume-by-country */}
          <TabsContent value="volume-by-country">
            {volumeRows.length > 0 && (
              <div className="overflow-auto max-h-96 rounded-xl bg-muted/40 mt-2">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">国家</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-20">搜索量</th>
                      <th className="px-4 py-2.5 w-36 hidden sm:table-cell" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {volumeRows.map((row) => (
                      <tr key={row.country} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-2">
                          <span className="font-medium">{COUNTRY_MAP[row.country.toUpperCase()]?.name ?? row.country.toUpperCase()}</span>
                          <span className="text-muted-foreground text-xs ml-1.5">{row.country.toUpperCase()}</span>
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-semibold tabular-nums">{formatVol(row.volume)}</td>
                        <td className="px-4 py-2 hidden sm:table-cell">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${Math.max(2, (row.volume / maxVol) * 100)}%` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Results: overview */}
          <TabsContent value="overview">
            {overviewData && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {overviewMetrics.map(({ key, label, fmt }) =>
                  overviewData[key] != null ? (
                    <div key={key} className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground mb-1">{label}</p>
                      <p className="text-xl font-bold font-mono tabular-nums">{fmt(overviewData[key])}</p>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </TabsContent>

          {/* Results: multi-country */}
          <TabsContent value="multi-country">
            {multiResults && (
              <div className="overflow-auto max-h-96 rounded-xl bg-muted/40 mt-2">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      {["国家", "搜索量", "CPC", "难度", "流量潜力"].map((h, i) => (
                        <th key={h} className={`px-4 py-2.5 text-xs font-medium text-muted-foreground ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {Object.entries(multiResults).map(([c, d]) => {
                      const kw = ((d as { keywords?: OverviewData[] })?.keywords?.[0] ?? d) as OverviewData;
                      return (
                        <tr key={c} className="hover:bg-muted/40 transition-colors">
                          <td className="px-4 py-2">
                            <span className="font-medium">{COUNTRY_MAP[c]?.name ?? c}</span>
                            <span className="text-muted-foreground text-xs ml-1.5">{c}</span>
                          </td>
                          <td className="px-4 py-2 text-right font-mono font-semibold tabular-nums">{kw?.volume != null ? formatVol(Number(kw.volume)) : "—"}</td>
                          <td className="px-4 py-2 text-right font-mono text-muted-foreground tabular-nums">{kw?.cpc != null ? formatCpc(kw.cpc) : "—"}</td>
                          <td className="px-4 py-2 text-right font-mono text-muted-foreground tabular-nums">{kw?.difficulty != null ? String(kw.difficulty) : "—"}</td>
                          <td className="px-4 py-2 text-right font-mono text-muted-foreground tabular-nums">{kw?.traffic_potential != null ? formatVol(Number(kw.traffic_potential)) : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

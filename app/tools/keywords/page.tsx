import Link from "next/link";
import { Search, Zap, Globe, FileSpreadsheet, ChevronRight } from "lucide-react";
import Header from "@/app/components/Header";
import SingleQuery from "@/app/components/SingleQuery";
import BatchQuery from "@/app/components/BatchQuery";

const HIGHLIGHTS = [
  { icon: Globe, label: "200+ 国家", desc: "覆盖全球搜索量数据" },
  { icon: Zap, label: "流式批量", desc: "实时返回查询进度" },
  { icon: FileSpreadsheet, label: "一键导出", desc: "结果直接生成 Excel" },
];

export default function KeywordsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 sm:py-10">
        {/* ── Breadcrumb ── */}
        <nav className="mb-5 flex items-center gap-1.5 text-xs">
          <Link
            href="/tools"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            SEO Toolkit
          </Link>
          <ChevronRight size={13} className="text-muted-foreground/50" />
          <Link
            href="/tools"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            工具
          </Link>
          <ChevronRight size={13} className="text-muted-foreground/50" />
          <span className="font-medium text-foreground">关键词探索</span>
        </nav>

        {/* ── Page intro ── */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background ring-1 ring-black/[0.06]">
              <Search size={18} className="text-foreground/80" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">关键词探索</h1>
              <p className="font-mono text-xs text-muted-foreground">Keyword Explorer</p>
            </div>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            查询全球各国搜索量、CPC 及竞争难度，支持单个关键词深度分析与批量导入多语言对比。
          </p>

          {/* Highlights */}
          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {HIGHLIGHTS.map((h) => {
              const Icon = h.icon;
              return (
                <div
                  key={h.label}
                  className="flex items-center gap-3 rounded-xl bg-background px-3.5 py-3 ring-1 ring-black/[0.05] transition-colors hover:ring-black/[0.12]"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon size={14} className="text-foreground/70" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-tight">{h.label}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{h.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <SingleQuery />
          <BatchQuery />
        </div>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        仅供个人使用 · Powered by Ahrefs Keywords Explorer API
      </footer>
    </div>
  );
}

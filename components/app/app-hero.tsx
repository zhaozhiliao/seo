import Link from "next/link";
import { ExternalLink, Download, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppConfig } from "@/lib/apps";

/** App intro hero on /apps/[app]. */
export function AppHero({ app, hasDocs }: { app: AppConfig; hasDocs: boolean }) {
  const base = `/apps/${app.slug}`;
  const ext = app.external ?? {};
  return (
    <section className="py-16 text-center sm:py-20">
      <span
        className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl text-xl font-bold text-white shadow-md"
        style={{ background: app.brandColor ?? "var(--brand)" }}
      >
        {app.name.charAt(0)}
      </span>
      <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">{app.name}</h1>
      <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-fg-muted">{app.tagline}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {hasDocs && (
          <Button render={<Link href={`${base}/docs`} />} className="gap-2">
            阅读文档 <ArrowRight size={16} />
          </Button>
        )}
        {ext.download && (
          <Button variant="outline" render={<a href={ext.download} target="_blank" rel="noreferrer" />} className="gap-2">
            <Download size={15} /> 下载
          </Button>
        )}
        {ext.github && (
          <Button variant="outline" render={<a href={ext.github} target="_blank" rel="noreferrer" />} className="gap-2">
            <ExternalLink size={15} /> GitHub
          </Button>
        )}
        {ext.website && (
          <Button variant="outline" render={<a href={ext.website} target="_blank" rel="noreferrer" />} className="gap-2">
            <Globe size={15} /> 官网
          </Button>
        )}
      </div>
    </section>
  );
}

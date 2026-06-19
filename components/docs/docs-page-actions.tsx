"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Copy, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const markdownCache = new Map<string, Promise<string>>();

function fetchMarkdown(url: string) {
  const cached = markdownCache.get(url);
  if (cached) return cached;
  const promise = fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch markdown");
    return r.text();
  });
  markdownCache.set(url, promise);
  return promise;
}

/** Copy Markdown + Open in… (GitHub, ChatGPT, Claude, Cursor). */
export function DocsPageActions({
  markdownUrl,
  githubUrl,
  className,
}: {
  markdownUrl: string;
  githubUrl?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const openItems = useMemo(() => {
    const abs = typeof window === "undefined" ? markdownUrl : new URL(markdownUrl, window.location.origin).href;
    const q = `Read ${abs}, I want to ask questions about it.`;

    return [
      githubUrl && {
        label: "Open in GitHub",
        href: githubUrl,
        icon: ExternalLink,
      },
      {
        label: "View as Markdown",
        href: markdownUrl,
        icon: FileText,
      },
      {
        label: "Open in ChatGPT",
        href: `https://chatgpt.com/?${new URLSearchParams({ hints: "search", q })}`,
        icon: ExternalLink,
      },
      {
        label: "Open in Claude",
        href: `https://claude.ai/new?${new URLSearchParams({ q })}`,
        icon: ExternalLink,
      },
      {
        label: "Open in Cursor",
        href: `https://cursor.com/link/prompt?${new URLSearchParams({ text: q })}`,
        icon: ExternalLink,
      },
    ].filter(Boolean) as { label: string; href: string; icon: typeof ExternalLink }[];
  }, [githubUrl, markdownUrl]);

  async function onCopy() {
    setCopying(true);
    try {
      const text = await fetchMarkdown(markdownUrl);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setCopying(false);
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2 border-b border-border pb-6", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5 rounded-full"
        disabled={copying}
        onClick={onCopy}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "已复制" : "Copy Markdown"}
      </Button>

      <div className="relative" ref={menuRef}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-full"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          Open <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
        </Button>
        {open && (
          <div className="absolute left-0 top-full z-50 mt-1 min-w-[11rem] rounded-lg border border-border bg-bg-card py-1 shadow-md">
            {openItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg"
                onClick={() => setOpen(false)}
              >
                <item.icon size={14} className="shrink-0" />
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

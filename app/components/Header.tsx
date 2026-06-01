"use client";

import Link from "next/link";
import { Search, KeyRound } from "lucide-react";
import { useApiKey } from "@/app/context/ApiKeyContext";
import { useAiKeys } from "@/app/context/AiKeysContext";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { hasKey } = useApiKey();
  const { hasActiveKey } = useAiKeys();

  // Show a green dot once any credential is configured.
  const anyConfigured = hasKey || hasActiveKey;

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-6xl items-center gap-3 px-6">
        {/* Logo */}
        <Link href="/tools" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground">
            <Search size={12} className="text-background" />
          </div>
          <span className="text-sm font-semibold tracking-tight">SEO Toolkit</span>
        </Link>

        {/* Unified API settings entry */}
        <div className="ml-auto">
          <Button
            variant={anyConfigured ? "outline" : "default"}
            size="sm"
            className="gap-2"
            render={<Link href="/settings" />}
          >
            <KeyRound size={14} />
            <span className="text-xs">API 设置</span>
            <span
              className={`h-1.5 w-1.5 rounded-full ${anyConfigured ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`}
            />
          </Button>
        </div>
      </div>
    </header>
  );
}

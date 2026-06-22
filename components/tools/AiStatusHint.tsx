"use client";

import Link from "next/link";
import { useAiKeys } from "@/components/context/AiKeysContext";
import { getProvider } from "@/lib/ai/providers";
import { Alert, AlertDescription } from "@/components/ui/alert";

/** Inline notice prompting the user to configure an AI key when none is set. */
export default function AiStatusHint() {
  const { hasActiveKey, selectedProvider, ready } = useAiKeys();
  if (!ready || hasActiveKey) return null;
  const provider = getProvider(selectedProvider);
  return (
    <Alert>
      <AlertDescription>
        请先在工具页{" "}
        <Link href="/settings" className="font-medium text-brand underline-offset-4 hover:underline">
          API 设置
        </Link>{" "}
        中配置 {provider?.name ?? "AI"} API Key 后再使用。
      </AlertDescription>
    </Alert>
  );
}

"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Read / write URL search params without scroll jumps. */
export function useUrlParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = useCallback((key: string) => searchParams.get(key), [searchParams]);

  const set = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value == null || value === "") next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return { get, set, searchParams };
}

export function parseCsvCodes(
  raw: string | null,
  fallback: string[],
  valid: ReadonlySet<string>
): string[] {
  if (!raw) return fallback;
  const codes = raw
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter((c) => valid.has(c));
  return codes.length ? codes : fallback;
}

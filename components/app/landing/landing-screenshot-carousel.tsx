"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const AUTO_INTERVAL_MS = 5000;
export function LandingScreenshotCarousel({
  images,
  alt,
  className,
  priority = false,
}: {
  images: string[];
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const count = images.length;
  const [index, setIndex] = useState(0);
  const multiple = count > 1;

  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);

  useEffect(() => {
    if (!multiple) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const id = window.setInterval(next, AUTO_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [multiple, next]);

  if (!count) return null;

  if (!multiple) {
    return (
      <Image
        src={images[0]!}
        alt={alt}
        width={1200}
        height={750}
        className={cn("h-auto w-full rounded-xl", className)}
        priority={priority}
      />
    );
  }

  return (
    <div className={cn("group relative", className)}>
      <div
        className="relative overflow-hidden rounded-xl"
        aria-roledescription="carousel"
        aria-label={alt}
      >
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`${alt}（${i + 1}/${count}）`}
            width={1200}
            height={750}
            aria-hidden={i !== index}
            className={cn(
              "h-auto w-full rounded-xl transition-opacity duration-500 motion-reduce:transition-none",
              i === index ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
            )}
            priority={priority && i === 0}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={prev}
        aria-label="上一张"
        className="absolute top-1/2 left-2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg/90 text-fg-muted opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:text-fg focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/25"
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="下一张"
        className="absolute top-1/2 right-2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg/90 text-fg-muted opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:text-fg focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/25"
      >
        <ChevronRight size={16} aria-hidden="true" />
      </button>

      <div className="mt-3 flex justify-center gap-1.5" role="tablist" aria-label="截图切换">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`第 ${i + 1} 张`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none",
              i === index ? "w-5 bg-brand" : "w-1.5 bg-border-strong hover:bg-fg-subtle"
            )}
          />
        ))}
      </div>
    </div>
  );
}

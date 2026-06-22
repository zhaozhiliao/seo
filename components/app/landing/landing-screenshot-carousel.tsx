"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const AUTO_INTERVAL_MS = 5000;

function ScreenshotLightbox({
  images,
  alt,
  index,
  open,
  onOpenChange,
  onIndexChange,
}: {
  images: string[];
  alt: string;
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
}) {
  const count = images.length;
  const multiple = count > 1;

  const prev = useCallback(() => onIndexChange((index - 1 + count) % count), [count, index, onIndexChange]);
  const next = useCallback(() => onIndexChange((index + 1) % count), [count, index, onIndexChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[min(96vw,1200px)] border-0 bg-transparent p-0 shadow-none sm:max-w-[min(96vw,1200px)]"
        showCloseButton
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <DialogDescription className="sr-only">
          {multiple ? `第 ${index + 1} 张，共 ${count} 张` : alt}
        </DialogDescription>

        <div className="group/lightbox relative">
          <Image
            src={images[index]!}
            alt={multiple ? `${alt}（${index + 1}/${count}）` : alt}
            width={2400}
            height={1500}
            className="h-auto max-h-[85vh] w-full rounded-xl object-contain"
          />

          {multiple && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="上一张"
                className="absolute top-1/2 left-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg/90 text-fg-muted shadow-sm backdrop-blur-sm transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-ring/25"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="下一张"
                className="absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg/90 text-fg-muted shadow-sm backdrop-blur-sm transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-ring/25"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const multiple = count > 1;

  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);

  useEffect(() => {
    if (!multiple || isHovered || lightboxOpen) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const id = window.setInterval(next, AUTO_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [multiple, next, isHovered, lightboxOpen]);

  if (!count) return null;

  const openLightbox = () => setLightboxOpen(true);

  const imageButton = (src: string, i: number, visible: boolean) => (
    <button
      key={src}
      type="button"
      onClick={openLightbox}
      aria-label={`查看大图：${alt}${multiple ? `（${i + 1}/${count}）` : ""}`}
      aria-hidden={multiple ? !visible : undefined}
      tabIndex={multiple && !visible ? -1 : 0}
      className={cn(
        "block w-full cursor-zoom-in rounded-xl transition-opacity duration-500 motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:outline-none",
        multiple && (visible ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0")
      )}
    >
      <Image
        src={src}
        alt={multiple ? `${alt}（${i + 1}/${count}）` : alt}
        width={1200}
        height={750}
        className="h-auto w-full rounded-xl"
        priority={priority && i === 0}
      />
    </button>
  );

  if (!multiple) {
    return (
      <>
        <div className={className}>{imageButton(images[0]!, 0, true)}</div>
        <ScreenshotLightbox
          images={images}
          alt={alt}
          index={0}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          onIndexChange={setIndex}
        />
      </>
    );
  }

  return (
    <>
      <div className={cn("group relative", className)}>
        <div
          className="relative overflow-hidden rounded-xl"
          aria-roledescription="carousel"
          aria-label={alt}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {images.map((src, i) => imageButton(src, i, i === index))}
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

      <ScreenshotLightbox
        images={images}
        alt={alt}
        index={index}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onIndexChange={setIndex}
      />
    </>
  );
}

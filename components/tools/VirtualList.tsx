"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  maxHeight: number;
  overscan?: number;
  className?: string;
  renderItem: (item: T, index: number) => ReactNode;
  getKey: (item: T, index: number) => string;
}

/** Fixed-height windowed list for large option sets. */
export function VirtualList<T>({
  items,
  itemHeight,
  maxHeight,
  overscan = 6,
  className,
  renderItem,
  getKey,
}: VirtualListProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(maxHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);

  const slice = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex]
  );

  return (
    <div
      ref={scrollRef}
      className={cn("overflow-y-auto", className)}
      style={{ maxHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div className="relative w-full" style={{ height: totalHeight }}>
        {slice.map((item, i) => {
          const index = startIndex + i;
          return (
            <div
              key={getKey(item, index)}
              className="absolute inset-x-0"
              style={{ top: index * itemHeight, height: itemHeight }}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Entry } from "@/types";

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface MonthKey {
  year: number;
  month: number;
  label: string;
}

function toMonthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split("-").map(Number);
  return { year: y, month: m };
}

interface TimelineProps {
  entries: Entry[];
}

export default function Timeline({ entries }: TimelineProps) {
  const [activeMonth, setActiveMonth] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  // Build ordered list of unique months from entries (newest first, matching entry order)
  const months: MonthKey[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    const key = toMonthKey(entry.createdAt);
    if (!seen.has(key)) {
      seen.add(key);
      const { year, month } = parseMonthKey(key);
      months.push({
        year,
        month,
        label: `${SHORT_MONTHS[month]} ${year}`,
      });
    }
  }

  // Observe which entry month-groups are visible
  useEffect(() => {
    const elements = document.querySelectorAll("[data-entry-month]");
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        // Find the topmost visible entry
        let topmost: { key: string; top: number } | null = null;
        for (const oe of observerEntries) {
          if (oe.isIntersecting) {
            const rect = oe.boundingClientRect;
            if (!topmost || rect.top < topmost.top) {
              topmost = {
                key: (oe.target as HTMLElement).dataset.entryMonth!,
                top: rect.top,
              };
            }
          }
        }
        if (topmost) {
          setActiveMonth(topmost.key);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [entries]);

  // Auto-scroll the timeline bar to keep the active month visible
  useEffect(() => {
    if (activeBtnRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const btn = activeBtnRef.current;
      const offset = btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2;
      container.scrollTo({ left: offset, behavior: "smooth" });
    }
  }, [activeMonth]);

  const scrollToMonth = useCallback((year: number, month: number) => {
    const key = `${year}-${month}`;
    const target = document.querySelector(`[data-entry-month="${key}"]`);
    if (target) {
      const headerOffset = 140;
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  if (months.length <= 1) return null;

  return (
    <div className="sticky top-16 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-700 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      <div
        ref={scrollRef}
        className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide"
      >
        {months.map((m) => {
          const key = `${m.year}-${m.month}`;
          const isActive = activeMonth === key;
          return (
            <button
              key={key}
              ref={isActive ? activeBtnRef : undefined}
              onClick={() => scrollToMonth(m.year, m.month)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? "dark:bg-blue-900/20 text-white"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

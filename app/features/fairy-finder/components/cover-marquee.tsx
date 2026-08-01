import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Link } from "~/components/common";

import { FAIRY_LIST } from "../data/fairies";
import { CoverSourceNote, FairyCover } from "./fairy-image";

const FEATURED_ITEMS = FAIRY_LIST.slice(0, 14);

export const CoverMarquee = () => {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const moveRail = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;

    rail.scrollBy({
      left: direction * Math.max(180, rail.clientWidth * 0.72),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (isPaused || reduceMotion.matches) return;

    const timer = window.setInterval(() => {
      const rail = railRef.current;
      if (!rail) return;

      const isAtEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 12;
      rail.scrollTo({
        left: isAtEnd ? 0 : rail.scrollLeft + Math.max(180, rail.clientWidth * 0.72),
        behavior: "smooth",
      });
    }, 4_200);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  return (
    <aside className="rounded-[1.75rem] border border-outline-variant bg-surface-container-low p-4 shadow-[0_24px_64px_rgba(49,30,84,0.11)] md:p-5" aria-label="Book cover reference gallery">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
            Book cover reference gallery
          </p>
          <Link to="/fairy-names" className="mt-2 inline-flex text-sm font-extrabold text-primary underline decoration-primary/25 underline-offset-4 hover:decoration-primary">
            View all {FAIRY_LIST.length} titles
          </Link>
        </div>

        <div className="flex gap-2" aria-label="Cover gallery controls">
          <button type="button" onClick={() => moveRail(-1)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant bg-white text-on-surface transition hover:border-primary/35 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15" aria-label="Previous covers">
            <ChevronLeft aria-hidden className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => setIsPaused((value) => !value)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant bg-white text-on-surface transition hover:border-primary/35 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15" aria-label={isPaused ? "Play cover gallery" : "Pause cover gallery"} aria-pressed={isPaused}>
            {isPaused ? <Play aria-hidden className="h-4 w-4" /> : <Pause aria-hidden className="h-4 w-4" />}
          </button>
          <button type="button" onClick={() => moveRail(1)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant bg-white text-on-surface transition hover:border-primary/35 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15" aria-label="Next covers">
            <ChevronRight aria-hidden className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="fairy-cover-marquee fairy-cover-track mt-5 grid snap-x snap-mandatory auto-cols-[42%] grid-flow-col gap-3 overflow-x-auto overscroll-x-contain pb-2 sm:auto-cols-[30%] lg:auto-cols-[44%]"
        tabIndex={0}
      >
        {FEATURED_ITEMS.map((fairy, index) => (
          <Link key={fairy.id} to="/fairy-names" className="min-w-0 snap-start rounded-2xl border border-outline-variant bg-surface-container-lowest p-2 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/15">
            <FairyCover imageUrl={fairy.imageUrl} fairyName={fairy.fullTitle} compact eager={index < 4} />
            <p className="mt-2 line-clamp-2 min-h-10 text-[11px] font-semibold leading-5 text-on-surface-variant">
              {fairy.fullTitle}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-4 border-t border-outline-variant pt-3">
        <CoverSourceNote />
      </div>
    </aside>
  );
};

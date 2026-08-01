import clsx from "clsx";
import { Check, ChevronDown, Printer, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Link } from "~/components/common";

import { FAIRY_LIST } from "../data/fairies";
import type { BookCatalogGroup } from "../data/book-catalog";
import { normalizeName } from "../utils/match";
import { FairyCover } from "./fairy-image";

const CHECKLIST_STORAGE_KEY = "rainbow-magic-book-catalog-checklist-v2";

const getBookKey = (seriesId: string, bookId: string) => `${seriesId}:${bookId}`;

const getCatalogAnchor = (fairy: (typeof FAIRY_LIST)[number]) =>
  `fairy-${normalizeName(fairy.name)}-${fairy.id}`;

interface BookChecklistProps {
  groups: readonly BookCatalogGroup[];
}

export const BookChecklist = ({ groups }: BookChecklistProps) => {
  const [completed, setCompleted] = useState<ReadonlySet<string>>(new Set());
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const printButtonRef = useRef<HTMLButtonElement>(null);
  const resetDialogRef = useRef<HTMLElement>(null);
  const catalogByTitle = useMemo(
    () => new Map(FAIRY_LIST.map((fairy) => [fairy.fullTitle, fairy])),
    []
  );
  const total = groups.reduce((count, item) => count + item.books.length, 0);
  const progressPercent = total === 0 ? 0 : Math.round((completed.size / total) * 100);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.every((value) => typeof value === "string")) {
        setCompleted(new Set(parsed));
      }
    } catch {
      // A damaged local preference must never prevent the reading list from working.
    }
  }, []);

  useEffect(() => {
    if (!isResetDialogOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsResetDialogOpen(false);
        window.setTimeout(() => resetButtonRef.current?.focus(), 0);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = resetDialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isResetDialogOpen]);

  const updateCompleted = (next: ReadonlySet<string>) => {
    setCompleted(next);
    try {
      window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // Storage can be unavailable in private browsing; the checklist still works for this visit.
    }
  };

  const toggleBook = (key: string) => {
    const next = new Set(completed);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    updateCompleted(next);
  };

  const resetChecklist = () => {
    updateCompleted(new Set());
    setIsResetDialogOpen(false);
    window.setTimeout(() => printButtonRef.current?.focus(), 0);
  };

  const closeResetDialog = () => {
    setIsResetDialogOpen(false);
    window.setTimeout(() => resetButtonRef.current?.focus(), 0);
  };

  return (
    <div>
      <section className="books-controls mb-12 grid gap-5 rounded-[1.4rem] border border-outline-variant bg-white p-5 shadow-[0_18px_46px_rgba(49,30,84,0.08)] md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-7 md:p-6" aria-labelledby="reading-progress-title">
        <div className="border-b border-outline-variant pb-4 md:min-w-32 md:border-b-0 md:border-r md:pb-0 md:pr-6">
          <p className="font-serif text-4xl font-bold tabular-nums text-on-surface">
            {completed.size}<span aria-hidden> / </span>{total}
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">books checked</p>
        </div>

        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-4 text-sm font-extrabold text-on-surface">
            <span id="reading-progress-title">My reading checklist</span>
            <span className="font-mono text-xs">{progressPercent}%</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full border border-outline-variant bg-surface-container-low" role="progressbar" aria-label="Book checklist progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed.size}>
            <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            {completed.size === 0
              ? "Not started yet. Tick any title to save progress in this browser."
              : "Your ticks stay only in this browser. They are not sent to this site."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 md:justify-end">
          <button ref={resetButtonRef} type="button" onClick={() => setIsResetDialogOpen(true)} className="btn btn-ghost min-h-11 gap-2 text-sm" disabled={completed.size === 0}>
            <RotateCcw aria-hidden className="h-4 w-4" /> Reset
          </button>
          <button ref={printButtonRef} type="button" onClick={() => window.print()} className="btn btn-primary min-h-11 gap-2 text-sm">
            <Printer aria-hidden className="h-4 w-4" /> Print checklist
          </button>
        </div>
      </section>

      <details className="books-controls sticky top-[4.5rem] z-30 mb-8 rounded-2xl border border-outline-variant bg-white/95 shadow-[0_10px_24px_rgba(49,30,84,0.08)] backdrop-blur md:top-[5.5rem]">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-extrabold text-on-surface marker:hidden">
          <span>Jump to a series or collection</span>
          <ChevronDown aria-hidden className="h-5 w-5 text-primary" />
        </summary>
        <nav aria-label="Book catalog sections" className="flex max-h-64 flex-wrap gap-2 overflow-y-auto border-t border-outline-variant px-5 py-4">
          {groups.map((group) => (
            <a key={group.id} href={`#${group.id}`} className="rounded-full border border-primary/15 bg-white px-3 py-2 text-xs font-extrabold text-primary hover:border-primary/40">
              {group.name}
            </a>
          ))}
        </nav>
      </details>

      <div className="space-y-4">
        {groups.map((group, groupIndex) => {
          const groupCompleted = group.books.reduce(
            (count, book) => count + Number(completed.has(getBookKey(group.id, book.id))),
            0
          );

          return (
            <details key={group.id} id={group.id} className="group scroll-mt-36 overflow-hidden rounded-[1.15rem] border border-outline-variant bg-white open:border-primary/25 open:shadow-sm">
              <summary className="grid min-h-20 cursor-pointer list-none grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 marker:hidden transition hover:bg-surface-container-low md:grid-cols-[4rem_minmax(0,1fr)_auto_1.5rem] md:gap-5 md:px-6">
                <span className="font-mono text-[11px] font-extrabold tracking-[0.1em] text-primary">{String(groupIndex + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="block font-serif text-xl font-bold leading-tight text-on-surface md:text-2xl">{group.name}</span>
                  <span className="mt-1 block text-xs leading-5 text-on-surface-variant">{group.books.length} {group.books.length === 1 ? "title" : "titles"} in this archive section</span>
                </span>
                <span className="font-mono text-xs text-on-surface-variant">{groupCompleted}/{group.books.length}</span>
                <ChevronDown aria-hidden className="hidden h-5 w-5 text-primary transition group-open:rotate-180 md:block" />
              </summary>

              <p className="border-y border-outline-variant bg-surface-container-low px-5 py-3 text-xs leading-6 text-on-surface-variant md:px-8">
                {group.sourceKind === "official-current"
                  ? "Grouped under this heading on the current Orchard Series Books catalog."
                  : "An older official-source format retained in this site's 324-cover archive but not listed as its own section on the current publisher page."}
              </p>

              <ul className="divide-y divide-outline-variant">
                {group.books.map((book, index) => {
                  const key = getBookKey(group.id, book.id);
                  const isComplete = completed.has(key);
                  const fairy = catalogByTitle.get(book.catalogTitle);

                  return (
                    <li key={key} className={clsx("grid min-h-24 grid-cols-[2.75rem_3rem_minmax(0,1fr)] items-center gap-3 px-3 py-3 transition-colors sm:grid-cols-[2.75rem_4rem_minmax(0,1fr)_auto] sm:gap-5 sm:px-6", isComplete && "bg-emerald-50/70")}>
                      <label className="relative flex h-11 w-11 cursor-pointer items-center justify-center">
                        <input type="checkbox" checked={isComplete} onChange={() => toggleBook(key)} className="peer sr-only" aria-label={`Mark ${book.title} as read`} />
                        <span aria-hidden className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary/35 bg-white text-transparent transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white">
                          <Check className="h-4 w-4 stroke-[3]" />
                        </span>
                      </label>

                      {fairy ? <FairyCover imageUrl={fairy.imageUrl} fairyName={fairy.fullTitle} compact className="w-12 rounded-lg sm:w-16" /> : <div className="aspect-[3/4] w-12 rounded-lg bg-surface-container sm:w-16" aria-hidden />}

                      <div className="min-w-0">
                        <p className={clsx("text-sm font-bold leading-5 text-on-surface sm:text-base", isComplete && "text-on-surface-variant line-through")}>{book.title}</p>
                        <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-on-surface-variant">Book {index + 1} of {group.books.length}</p>
                      </div>

                      {fairy ? <Link to={`/fairy-names#${getCatalogAnchor(fairy)}`} className="col-start-3 min-h-9 text-sm font-extrabold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary sm:col-start-auto">View fairy</Link> : null}
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>

      {isResetDialogOpen ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-on-surface/60 px-5" role="presentation" onMouseDown={(event) => {
          if (event.currentTarget === event.target) closeResetDialog();
        }}>
          <section ref={resetDialogRef} role="alertdialog" aria-modal="true" aria-labelledby="reset-checklist-title" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.3)] md:p-8">
            <h2 id="reset-checklist-title" className="font-serif text-2xl font-bold text-on-surface">Clear progress from this browser?</h2>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">This removes all {completed.size} saved ticks. The book catalog itself will not change.</p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button autoFocus type="button" className="btn btn-ghost min-h-11" onClick={closeResetDialog}>Keep progress</button>
              <button type="button" className="btn min-h-11 border-red-700 bg-red-700 text-white hover:bg-red-800" onClick={resetChecklist}>Clear all progress</button>
            </div>
          </section>
        </div>
      ) : null}

      <style>{`
        @media print {
          .books-controls, .fairy-header-no-auth, footer, .adsterra-native-ad { display: none !important; }
          body { background: white !important; }
          #root { min-width: 0 !important; }
          details { break-inside: auto; box-shadow: none !important; }
          details > :not(summary) { display: block !important; }
          summary { break-after: avoid; }
          li { break-inside: avoid; }
          a { color: inherit !important; text-decoration: none !important; }
        }
      `}</style>
    </div>
  );
};

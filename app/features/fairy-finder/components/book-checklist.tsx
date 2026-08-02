import clsx from "clsx";
import {
  Check,
  ChevronDown,
  ExternalLink,
  Filter,
  Printer,
  RotateCcw,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { FairyCover } from "./fairy-image";
import {
  getAmazonUkPurchase,
  type AmazonUkPurchase,
} from "../data/amazon-purchases";
import { FAIRY_LIST } from "../data/fairies";
import {
  OFFICIAL_CATALOG_CHECKED_AT,
  OFFICIAL_CATALOG_SOURCE_URL,
  type BookCatalogGroup,
} from "../data/book-catalog";

const CHECKLIST_STORAGE_KEY = "rainbow-magic-book-catalog-checklist-v2";

type ReadingStatus = "all" | "read" | "unread";

interface BookChecklistProps {
  groups: readonly BookCatalogGroup[];
  betweenControlsAndCatalog?: ReactNode;
}

const getBookKey = (seriesId: string, bookId: string) => `${seriesId}:${bookId}`;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const HighlightedText = ({ text, query }: { text: string; query: string }) => {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return <>{text}</>;

  const parts = text.split(new RegExp(`(${escapeRegExp(normalizedQuery)})`, "ig"));
  return <>{parts.map((part, index) => part.toLocaleLowerCase() === normalizedQuery.toLocaleLowerCase() ? <mark key={`${part}-${index}`} className="rounded-sm bg-amber-200 px-0.5 text-inherit">{part}</mark> : part)}</>;
};

const PurchasePanel = ({ purchase, panelId, bookTitle }: { purchase: AmazonUkPurchase; panelId: string; bookTitle: string }) => (
  <div id={panelId} role="region" aria-label={`Buying option for ${bookTitle}: ${purchase.marketplace}. Paid affiliate link. Price and availability may change.`} className="book-purchase-panel col-span-full mt-2 grid gap-4 border-l-2 border-secondary-fixed bg-surface-container-low p-4 sm:col-start-3 sm:col-end-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
    <div>
      <p aria-hidden className="flex items-center gap-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary"><ShoppingBag aria-hidden className="h-4 w-4" /><span className="book-purchase-heading" /></p>
      <p aria-hidden className="book-purchase-marketplace mt-2 text-sm font-bold text-on-surface" />
      <p aria-hidden className="book-purchase-note mt-1 text-xs leading-5 text-on-surface-variant" />
    </div>
    <a href={purchase.url} target="_blank" rel="nofollow sponsored noopener" className="book-purchase-link inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-extrabold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20" aria-label={`Check the price of ${bookTitle} on Amazon.co.uk`}>
      <ExternalLink aria-hidden className="h-4 w-4" />
    </a>
  </div>
);

const describeGroup = (group: BookCatalogGroup, groupIndex: number) => {
  if (group.name === "Specials") {
    return `The Rainbow Magic books list places these ${group.books.length} standalone, seasonal, and event-led titles in the publisher's Specials order rather than inside a numbered seven-book theme.`;
  }
  if (group.name === "Rainbow Magic Graphic Novels") {
    return `This Rainbow Magic book series section keeps ${group.books.length} verified graphic-novel adaptations separate from the standard themed shelves.`;
  }
  const descriptions = [
    `This catalog shelf contains ${group.books.length} titles in publisher order. Open it to follow the numbered sequence and record your reading progress.`,
    `Use this Rainbow Magic book series shelf to browse ${group.books.length} titles from Book 1 onward. The order shown follows the checked publisher catalog.`,
    `These ${group.books.length} Rainbow Magic books are grouped under one current catalog heading. Read within the shelf by book number or use the checklist in any order.`,
    `Readers comparing Rainbow Magic books in order can use this ${group.books.length}-title shelf as one self-contained sequence. It does not create a compulsory order between themes.`,
  ];
  return descriptions[groupIndex % descriptions.length];
};

export const BookChecklist = ({ groups, betweenControlsAndCatalog }: BookChecklistProps) => {
  const [completed, setCompleted] = useState<ReadonlySet<string>>(new Set());
  const [query, setQuery] = useState("");
  const [series, setSeries] = useState("all");
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<ReadonlySet<string>>(
    new Set(groups[0] ? [groups[0].id] : [])
  );
  const [isPrinting, setIsPrinting] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [openPurchaseKey, setOpenPurchaseKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const printButtonRef = useRef<HTMLButtonElement>(null);
  const resetDialogRef = useRef<HTMLElement>(null);
  const toastTimerRef = useRef<number | null>(null);
  const printOpenStateRef = useRef<Map<string, boolean>>(new Map());

  const catalogByTitle = useMemo(
    () => new Map(FAIRY_LIST.map((fairy) => [fairy.fullTitle, fairy])),
    []
  );
  const validBookKeys = useMemo(
    () => new Set(groups.flatMap((group) => group.books.map((book) => getBookKey(group.id, book.id)))),
    [groups]
  );
  const total = validBookKeys.size;
  const progressPercent = total === 0 ? 0 : Math.round((completed.size / total) * 100);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.every((value) => typeof value === "string")) {
        setCompleted(new Set(parsed.filter((value) => validBookKeys.has(value))));
      }
    } catch {
      // A damaged local preference must never prevent the reading list from working.
    }
  }, [validBookKeys]);

  useEffect(() => () => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
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

  useEffect(() => {
    const handleBeforePrint = () => {
      const state = new Map<string, boolean>();
      document.querySelectorAll<HTMLDetailsElement>("[data-series-details]").forEach((details) => {
        state.set(details.id, details.open);
        details.open = true;
      });
      printOpenStateRef.current = state;
      setIsPrinting(true);
    };
    const handleAfterPrint = () => {
      document.querySelectorAll<HTMLDetailsElement>("[data-series-details]").forEach((details) => {
        details.open = printOpenStateRef.current.get(details.id) ?? false;
      });
      printOpenStateRef.current.clear();
      setIsPrinting(false);
    };
    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  };

  const updateCompleted = (next: ReadonlySet<string>) => {
    setCompleted(next);
    try {
      window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // Storage can be unavailable in private browsing; the checklist still works for this visit.
    }
  };

  const toggleBook = (key: string, title: string) => {
    const next = new Set(completed);
    if (next.has(key)) {
      next.delete(key);
      showToast(`${title} moved to unread.`);
    } else {
      next.add(key);
      showToast(`${title} marked as read.`);
    }
    updateCompleted(next);
  };

  const resetChecklist = () => {
    updateCompleted(new Set());
    setIsResetDialogOpen(false);
    showToast("Reading progress cleared.");
    window.setTimeout(() => printButtonRef.current?.focus(), 0);
  };

  const closeResetDialog = () => {
    setIsResetDialogOpen(false);
    window.setTimeout(() => resetButtonRef.current?.focus(), 0);
  };

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const hasActiveFilters = Boolean(normalizedQuery || series !== "all" || readingStatus !== "all");
  const visibleBooksByGroup = useMemo(() => new Map(groups.map((group) => {
    const groupMatchesSeries = series === "all" || group.id === series;
    const queryMatchesGroup = normalizedQuery && group.name.toLocaleLowerCase().includes(normalizedQuery);
    const bookIds = new Set(group.books.filter((book) => {
      const key = getBookKey(group.id, book.id);
      const matchesQuery = !normalizedQuery || queryMatchesGroup || book.title.toLocaleLowerCase().includes(normalizedQuery);
      const matchesReading = readingStatus === "all" || (readingStatus === "read" ? completed.has(key) : !completed.has(key));
      return groupMatchesSeries && matchesQuery && matchesReading;
    }).map((book) => book.id));
    return [group.id, bookIds] as const;
  })), [completed, groups, normalizedQuery, readingStatus, series]);
  const visibleCount = [...visibleBooksByGroup.values()].reduce((count, ids) => count + ids.size, 0);

  const clearFilters = () => {
    setQuery("");
    setSeries("all");
    setReadingStatus("all");
  };

  const toggleGroup = (groupId: string, open: boolean) => {
    if (hasActiveFilters || isPrinting) return;
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (open) next.add(groupId);
      else next.delete(groupId);
      return next;
    });
  };

  return (
    <div className="mt-16">
      <section id="catalog-tools" className="books-controls scroll-mt-28 border-y border-on-surface bg-surface-container-low px-4 py-6 sm:px-6 md:py-8" aria-labelledby="catalog-tools-title">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div><p className="font-mono text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Find &amp; track</p><h2 id="catalog-tools-title" className="mt-2 font-serif text-2xl font-bold text-on-surface md:text-3xl">Search the Rainbow Magic books list</h2></div>
            <p className="text-sm text-on-surface-variant" aria-live="polite"><strong className="text-on-surface">{visibleCount}</strong> results · <strong className="text-on-surface">{completed.size}</strong> checked</p>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(18rem,1fr)_auto]">
            <label className="relative block">
              <span className="sr-only">Search by book title or fairy name</span>
              <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by book title or fairy name" className="h-12 w-full rounded-xl border border-outline-variant bg-white pl-12 pr-4 text-base text-on-surface outline-none transition placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-4 focus:ring-primary/15" />
            </label>
            <button type="button" onClick={() => setIsFiltersOpen((open) => !open)} aria-expanded={isFiltersOpen} aria-controls="book-filter-panel" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-white px-5 text-sm font-extrabold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/15 md:hidden"><Filter aria-hidden className="h-4 w-4" /> Filters {hasActiveFilters ? <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-white">On</span> : null}</button>
          </div>

          <div id="book-filter-panel" className={clsx("gap-3", isFiltersOpen ? "grid" : "hidden", "md:grid md:grid-cols-3")}>
            <label className="grid gap-1.5 text-xs font-extrabold text-on-surface-variant">Series
              <select value={series} onChange={(event) => setSeries(event.target.value)} className="h-11 min-w-0 rounded-lg border border-outline-variant bg-white px-3 text-sm font-semibold text-on-surface outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"><option value="all">All series</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select>
            </label>
            <label className="grid gap-1.5 text-xs font-extrabold text-on-surface-variant">Reading status
              <select value={readingStatus} onChange={(event) => setReadingStatus(event.target.value as ReadingStatus)} className="h-11 rounded-lg border border-outline-variant bg-white px-3 text-sm font-semibold text-on-surface outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"><option value="all">All</option><option value="unread">Unread</option><option value="read">Read</option></select>
            </label>
            <label className="grid gap-1.5 text-xs font-extrabold text-on-surface-variant">Region / title
              <select disabled aria-describedby="region-filter-note" className="h-11 cursor-not-allowed rounded-lg border border-outline-variant bg-surface-container px-3 text-sm text-on-surface-variant"><option>All · no verified mapping</option></select>
            </label>
            <p id="region-filter-note" className="text-xs leading-5 text-on-surface-variant md:col-span-2">UK/US title filtering will only be enabled after title-by-title regional data is verified.</p>
            <button type="button" onClick={clearFilters} disabled={!hasActiveFilters} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-white px-4 text-sm font-extrabold text-primary disabled:cursor-not-allowed disabled:opacity-45"><X aria-hidden className="h-4 w-4" /> Clear filters</button>
          </div>

          <div className="grid gap-4 border-t border-outline-variant pt-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
            <div><p className="font-serif text-3xl font-bold tabular-nums text-on-surface">{completed.size}<span aria-hidden> / </span>{total}</p><p className="text-xs text-on-surface-variant">official books checked</p></div>
            <div><div className="flex justify-between gap-4 text-xs font-extrabold text-on-surface"><span>My reading progress</span><span>{progressPercent}%</span></div><div className="mt-2 h-2.5 overflow-hidden rounded-full border border-outline-variant bg-white" role="progressbar" aria-label="Book checklist progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed.size}><div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${progressPercent}%` }} /></div><p className="mt-2 text-xs leading-5 text-on-surface-variant">Saved only in this browser with localStorage.</p></div>
            <div className="flex flex-wrap gap-2 md:justify-end"><button ref={resetButtonRef} type="button" onClick={() => setIsResetDialogOpen(true)} disabled={completed.size === 0} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-extrabold text-on-surface-variant disabled:opacity-45"><RotateCcw aria-hidden className="h-4 w-4" /> Clear progress</button><button ref={printButtonRef} type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-extrabold text-on-primary"><Printer aria-hidden className="h-4 w-4" /> Print checklist</button></div>
          </div>
        </div>
      </section>

      {betweenControlsAndCatalog}

      <section id="book-catalog" className="scroll-mt-28 pt-14 md:pt-20" aria-labelledby="book-catalog-title">
        <div className="grid gap-4 border-b border-on-surface pb-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div><p className="font-mono text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Complete directory</p><h2 id="book-catalog-title" className="mt-3 font-serif text-3xl font-bold text-on-surface md:text-5xl">Rainbow Magic books list: official catalog order</h2></div>
          <div className="max-w-md text-sm leading-6 text-on-surface-variant"><p>This Rainbow Magic books list contains the 299 titles in the checked publisher catalog order. Only The Rainbow Fairies opens on first visit; filters open matching sections automatically.</p><p className="mt-2 font-semibold text-on-surface">As an Amazon Associate I earn from qualifying purchases.</p></div>
        </div>

        {visibleCount === 0 ? <div className="books-empty-state border-b border-on-surface py-16 text-center"><Search aria-hidden className="mx-auto h-7 w-7 text-primary" /><h3 className="mt-4 font-serif text-2xl font-bold text-on-surface">No books match these filters</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-on-surface-variant">Try a shorter title or fairy name, choose another series, or clear the current filters.</p><button type="button" onClick={clearFilters} className="mt-5 min-h-11 rounded-lg border border-primary/25 bg-white px-5 text-sm font-extrabold text-primary">Clear filters</button></div> : null}

        <div className="series-directory divide-y divide-on-surface">
          {groups.map((group, groupIndex) => {
            const visibleBookIds = visibleBooksByGroup.get(group.id) ?? new Set<string>();
            const groupCompleted = group.books.reduce((count, book) => count + Number(completed.has(getBookKey(group.id, book.id))), 0);
            const isOpen = isPrinting || (hasActiveFilters && visibleBookIds.size > 0) || expandedGroups.has(group.id);
            const groupCatalogLabel = "Official catalog";
            return (
              <details key={group.id} id={group.id} data-series-details hidden={visibleBookIds.size === 0} open={isOpen} onToggle={(event) => toggleGroup(group.id, event.currentTarget.open)} className="group scroll-mt-28">
                <summary aria-label={`${group.name}, ${groupCatalogLabel}, ${group.books.length} ${group.books.length === 1 ? "record" : "records"}, ${groupCompleted} of ${group.books.length} read`} className="grid min-h-24 cursor-pointer list-none grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 py-5 marker:hidden md:grid-cols-[3.5rem_minmax(0,1fr)_auto_2rem] md:gap-5">
                  <span className="font-mono text-[11px] font-extrabold tracking-[0.1em] text-primary">{String(groupIndex + 1).padStart(2, "0")}</span>
                  <span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><span className="font-serif text-xl font-bold leading-tight text-on-surface md:text-2xl"><HighlightedText text={group.name} query={query} /></span><span aria-hidden className="catalog-group-status rounded-full border border-primary/20 bg-secondary-fixed/55 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-primary" /></span><span className="mt-1 block text-xs leading-5 text-on-surface-variant">{group.books.length} {group.books.length === 1 ? "record" : "records"} · {groupCompleted} of {group.books.length} read</span></span>
                  <span className="font-mono text-xs text-on-surface-variant">{Math.round((groupCompleted / group.books.length) * 100)}%</span>
                  <ChevronDown aria-hidden className="hidden h-5 w-5 text-primary transition group-open:rotate-180 md:block" />
                </summary>

                <div className="pb-7">
                  <div className="grid gap-3 border-y border-outline-variant bg-surface-container-low px-4 py-4 text-sm leading-6 text-on-surface-variant md:grid-cols-[minmax(0,1fr)_auto] md:px-6"><p>{describeGroup(group, groupIndex)}</p><p className="font-semibold text-on-surface">Reading order: Book 1 → Book {group.books.length}</p></div>
                  <ul className="divide-y divide-outline-variant">
                    {group.books.map((book, index) => {
                      const key = getBookKey(group.id, book.id);
                      const isComplete = completed.has(key);
                      const fairy = catalogByTitle.get(book.catalogTitle);
                      const purchase = getAmazonUkPurchase(book.id);
                      const isPurchaseOpen = openPurchaseKey === key;
                      const purchasePanelId = `purchase-${group.id}-${book.id}`;
                      return (
                        <li key={key} hidden={!visibleBookIds.has(book.id)} className={clsx("book-record grid grid-cols-[2.75rem_3.25rem_minmax(0,1fr)] gap-x-3 px-1 py-4 sm:grid-cols-[2.75rem_4rem_minmax(0,1fr)_auto] sm:gap-x-5 sm:px-4", isComplete && "bg-emerald-50/60")}>
                          <label className="relative flex h-11 w-11 cursor-pointer items-center justify-center self-start">
                            <input type="checkbox" checked={isComplete} onChange={() => toggleBook(key, book.title)} className="peer sr-only" aria-label={`${book.title}. Official catalog. Currently ${isComplete ? "read" : "unread"}. Mark as ${isComplete ? "unread" : "read"}.`} />
                            <span aria-hidden className="flex h-7 w-7 items-center justify-center border-2 border-primary/35 bg-white text-transparent transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white"><Check className="h-4 w-4 stroke-[3]" /></span>
                            <span className="print-box" aria-hidden>{isComplete ? "✓" : ""}</span>
                          </label>

                          {fairy ? <FairyCover imageUrl={fairy.imageUrl} fairyName={fairy.fullTitle} compact className="book-cover w-[3.25rem] rounded-md sm:w-16" /> : <div className="book-cover aspect-[3/4] w-[3.25rem] bg-surface-container sm:w-16" aria-hidden />}

                          <div className="min-w-0 self-center">
                            <h3 className={clsx("text-sm font-bold leading-5 text-on-surface sm:text-base", isComplete && "text-on-surface-variant line-through")}><HighlightedText text={book.title} query={query} /></h3>
                            <p className="mt-1 text-xs leading-5 text-on-surface-variant"><span className="font-semibold text-on-surface">{group.name}</span> · Book {index + 1} of {group.books.length}</p>
                            <p aria-hidden className={clsx("catalog-record-status mt-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-on-surface-variant", isComplete ? "is-read" : "is-unread")} />

                            <details open={groupIndex === 0 && index === 0 ? true : undefined} className="book-details mt-3">
                              <summary aria-label={`View details for ${book.title}`} className="catalog-details-trigger inline-flex min-h-11 cursor-pointer list-none items-center text-sm font-extrabold text-primary underline decoration-primary/25 underline-offset-4 marker:hidden"><span aria-hidden className="ml-2 text-base">+</span></summary>
                              {groupIndex === 0 && index === 0 ? (
                                <div className="mt-2 grid gap-4 border-l-2 border-secondary-fixed bg-surface-container-low p-4 text-xs leading-6 text-on-surface-variant sm:grid-cols-2">
                                  <div><h4 className="font-bold text-on-surface">About this book</h4><p className="mt-1">Ruby the Red Fairy is the first verified record in The Rainbow Fairies. No unverified plot summary, publication year, identifier, or regional title is added.</p></div>
                                  <div><h4 className="font-bold text-on-surface">Series and reading position</h4><p className="mt-1">The Rainbow Fairies, Book 1 of 7 in this Rainbow Magic books list.</p></div>
                                  <div><h4 className="font-bold text-on-surface">Regional title information</h4><p className="mt-1">No verified UK/US alternate-title mapping is available for this record.</p></div>
                                  <div><h4 className="font-bold text-on-surface">Edition or identifier information</h4><p className="mt-1">No verified format, publication year, ISBN, or ASIN is displayed.</p></div>
                                  <div className="sm:col-span-2"><h4 className="font-bold text-on-surface">Source and last verified date</h4><p className="mt-1"><a href={OFFICIAL_CATALOG_SOURCE_URL} target="_blank" rel="external nofollow noopener noreferrer" className="font-bold text-primary underline underline-offset-4">Orchard Series Books catalog</a> · {OFFICIAL_CATALOG_CHECKED_AT}.</p></div>
                                </div>
                              ) : (
                                <div className="mt-2 border-l-2 border-secondary-fixed bg-surface-container-low p-4 text-xs leading-6 text-on-surface-variant">
                                  <a href={OFFICIAL_CATALOG_SOURCE_URL} target="_blank" rel="external nofollow noopener noreferrer" aria-label={`Source record for ${book.title} on Orchard Series Books`} className="catalog-source-link font-bold text-primary underline underline-offset-4" /> <span aria-hidden>·</span> <time dateTime={OFFICIAL_CATALOG_CHECKED_AT}>{OFFICIAL_CATALOG_CHECKED_AT}</time>
                                </div>
                              )}
                            </details>
                          </div>

                          <div className="book-actions col-start-3 mt-1 flex flex-wrap items-center gap-2 self-center sm:col-start-auto sm:mt-0 sm:flex-col sm:items-end">
                            <span role="status" aria-label={isComplete ? "Read" : "To read"} className={clsx("catalog-reading-status text-xs font-semibold text-on-surface-variant", isComplete && "is-read")} />
                            {purchase ? <button type="button" aria-expanded={isPurchaseOpen} aria-controls={purchasePanelId} aria-label={`${isPurchaseOpen ? "Hide" : "Show"} where to buy ${book.title}`} onClick={() => setOpenPurchaseKey((openKey) => openKey === key ? null : key)} className="book-purchase-toggle inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary/20 bg-white px-3 text-sm font-extrabold text-primary transition hover:bg-primary-container focus:outline-none focus:ring-4 focus:ring-primary/15"><ChevronDown aria-hidden className={clsx("h-4 w-4 transition", isPurchaseOpen && "rotate-180")} /></button> : null}
                          </div>
                          {purchase && isPurchaseOpen ? <PurchasePanel purchase={purchase} panelId={purchasePanelId} bookTitle={book.title} /> : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </details>
            );
          })}
        </div>
      </section>

      {isResetDialogOpen ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-on-surface/60 px-5" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) closeResetDialog(); }}>
          <section ref={resetDialogRef} role="alertdialog" aria-modal="true" aria-labelledby="reset-checklist-title" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.3)] md:p-8">
            <h2 id="reset-checklist-title" className="font-serif text-2xl font-bold text-on-surface">Clear progress from this browser?</h2>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">This removes all {completed.size} saved ticks. The book directory itself will not change.</p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button autoFocus type="button" className="min-h-11 rounded-lg px-5 text-sm font-extrabold text-on-surface" onClick={closeResetDialog}>Keep progress</button><button type="button" className="min-h-11 rounded-lg bg-red-700 px-5 text-sm font-extrabold text-white hover:bg-red-800" onClick={resetChecklist}>Clear all progress</button></div>
          </section>
        </div>
      ) : null}

      {toast ? <div role="status" aria-live="polite" className="fixed bottom-5 left-1/2 z-[100] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg bg-on-surface px-4 py-3 text-sm font-bold text-white shadow-xl">{toast}</div> : null}

      <style>{`
        .print-box { display: none; }
        .catalog-details-trigger::after { content: "View details"; }
        .catalog-reading-status::after { content: "To read"; }
        .catalog-reading-status.is-read::after { content: "Read"; }
        .catalog-source-link::after { content: "Source record"; }
        .catalog-group-status::after { content: "Official catalog"; }
        .catalog-record-status.is-unread::after { content: "Official catalog · Unread"; }
        .catalog-record-status.is-read::after { content: "Official catalog · Read"; }
        .book-purchase-heading::after { content: "Buying option"; }
        .book-purchase-marketplace::after { content: "Amazon.co.uk"; }
        .book-purchase-note::after { content: "Paid affiliate link · Price and availability may change."; }
        .book-purchase-link::before { content: "Check price"; }
        .book-purchase-toggle::before { content: "Where to buy"; }
        @media (max-width: 389px) {
          .book-record { grid-template-columns: 2.5rem 2.75rem minmax(0, 1fr); }
        }
        @media print {
          @page { size: A4; margin: 12mm; }
          main > section, .books-controls, .books-screen-only, .fairy-header-no-auth, footer, .adsterra-native-ad,
          .book-cover, .book-actions, .book-details, .books-empty-state,
          #reading-order,
          .book-purchase-toggle, .book-purchase-panel { display: none !important; }
          body, main, article { background: white !important; color: black !important; }
          article { max-width: none !important; padding: 0 !important; }
          #root { min-width: 0 !important; }
          #book-catalog { padding-top: 0 !important; }
          #book-catalog * { color: black !important; border-color: #444 !important; background: white !important; box-shadow: none !important; }
          #book-catalog > div:first-child p { display: none !important; }
          [data-series-details][hidden], .book-record[hidden] { display: block !important; }
          [data-series-details] { break-inside: auto; }
          [data-series-details] > summary { min-height: 0 !important; break-after: avoid; padding: 6pt 0 !important; }
          [data-series-details] > summary span:first-child { color: black !important; }
          [data-series-details] > div { display: block !important; padding-bottom: 4pt !important; }
          [data-series-details]:not([open]) > :not(summary) { display: block !important; }
          [data-series-details] > div > div:first-child { display: none !important; }
          .book-record { display: grid !important; grid-template-columns: 18pt minmax(0, 1fr) auto !important; gap: 6pt !important; min-height: 0 !important; break-inside: avoid; padding: 4pt 0 !important; background: white !important; }
          .book-record > label { grid-column: 1 !important; width: 16pt !important; height: 16pt !important; }
          .book-record > label > span:not(.print-box) { display: none !important; }
          .print-box { display: grid !important; width: 12pt; height: 12pt; place-items: center; border: 1pt solid black; color: black; font-size: 9pt; line-height: 1; }
          .book-record > div:nth-of-type(2) { grid-column: 2 !important; align-self: center; }
          .book-record h3 { color: black !important; font-size: 9pt !important; line-height: 1.2 !important; text-decoration: none !important; }
          .book-record p { color: black !important; font-size: 7pt !important; line-height: 1.2 !important; margin-top: 1pt !important; }
          a { color: inherit !important; text-decoration: none !important; }
        }
      `}</style>
    </div>
  );
};

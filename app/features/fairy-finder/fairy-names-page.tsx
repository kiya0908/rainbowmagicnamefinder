import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

import { FAIRY_LIST } from "~/features/fairy-finder/data/fairies";
import type { FairyData } from "~/features/fairy-finder/data/types";
import { FairyBreadcrumb } from "~/features/fairy-finder/components/fairy-breadcrumb";
import { FairyCoverFeature } from "~/features/fairy-finder/components/fairy-cover-feature";
import { CoverSourceNote, FairyCover } from "~/features/fairy-finder/components/fairy-image";
import { FairyPageHero } from "~/features/fairy-finder/components/fairy-page-hero";
import { FairySiteLayout } from "~/features/fairy-finder/fairy-site-layout";
import { matchFairy, normalizeName } from "~/features/fairy-finder/utils/match";

const FAIRIES_BY_LETTER = FAIRY_LIST.reduce<Record<string, FairyData[]>>(
  (groups, fairy) => {
    const letter = fairy.name.charAt(0).toUpperCase() || "#";
    groups[letter] = groups[letter] ?? [];
    groups[letter].push(fairy);
    return groups;
  },
  {}
);

const LETTER_GROUPS = Object.entries(FAIRIES_BY_LETTER).sort(([a], [b]) =>
  a.localeCompare(b)
);

const SUGGESTED_NAMES = ["Lily", "Ruby", "Amber", "Saffron"] as const;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const FAIRY_NAME_HERO_FAIRIES = ["Ruby", "Lily", "Amber"].map((name) =>
  FAIRY_LIST.find((fairy) => fairy.name === name)
);

const getFairyCardId = (fairy: FairyData) =>
  `fairy-${normalizeName(fairy.name)}-${fairy.id}`;

interface LetterLinkProps {
  letter: string;
  isActive: boolean;
  onClick: React.MouseEventHandler<HTMLAnchorElement>;
}

function LetterLink({ letter, isActive, onClick }: LetterLinkProps) {
  const className =
    "inline-flex h-11 min-w-0 w-full items-center justify-center rounded-xl border font-mono text-xs font-extrabold transition focus:outline-none focus:ring-4 focus:ring-primary/15";

  if (!FAIRIES_BY_LETTER[letter]) {
    return (
      <span
        aria-disabled="true"
        className={`${className} border-transparent text-on-surface-variant/35`}
      >
        {letter}
      </span>
    );
  }

  return (
    <a
      href={`#letter-${letter}`}
      onClick={onClick}
      aria-current={isActive ? "location" : undefined}
      className={`${className} ${
        isActive
          ? "border-primary bg-primary text-on-primary"
          : "border-transparent bg-white text-on-surface hover:border-primary/25 hover:text-primary"
      }`}
    >
      {letter}
    </a>
  );
}

export function FairyNamesPage() {
  const [selectedFairy, setSelectedFairy] = useState<FairyData | null>(null);
  const [finderName, setFinderName] = useState("");
  const [searchedName, setSearchedName] = useState<string | null>(null);
  const [finderResult, setFinderResult] = useState<FairyData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchSequence, setSearchSequence] = useState(0);
  const [isLetterPanelOpen, setIsLetterPanelOpen] = useState(false);
  const [activeLetter, setActiveLetter] = useState("A");

  const finderInputRef = useRef<HTMLInputElement | null>(null);
  const resultRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogOpenerRef = useRef<HTMLElement | null>(null);

  const openFairyModal = (fairy: FairyData) => {
    dialogOpenerRef.current = document.activeElement as HTMLElement | null;
    setSelectedFairy(fairy);
  };

  const closeFairyModal = (focusFinder = false) => {
    const returnTarget = focusFinder ? finderInputRef.current : dialogOpenerRef.current;
    setSelectedFairy(null);
    window.setTimeout(() => returnTarget?.focus(), 40);
  };

  useEffect(() => {
    if (!selectedFairy) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeFairyModal();
        return;
      }

      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedFairy]);

  const handleLetterClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    letter: string
  ) => {
    event.preventDefault();

    const target = document.getElementById(`letter-${letter}`);
    if (!target) return;

    setActiveLetter(letter);
    setIsLetterPanelOpen(false);
    window.history.replaceState(null, "", `#letter-${letter}`);
    window.requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    });
  };

  const runFinderSearch = (rawName: string) => {
    const nextName = rawName.trim();

    setFinderName(nextName);
    setSearchedName(nextName || null);
    setFinderResult(nextName ? matchFairy(nextName) : null);
    setHasSearched(Boolean(nextName));
    setSearchSequence((previous) => previous + 1);
  };

  const handleFinderSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runFinderSearch(finderName);
  };

  const handleTryAnotherName = () => {
    setFinderName("");
    setSearchedName(null);
    setFinderResult(null);
    setHasSearched(false);

    window.setTimeout(() => {
      finderInputRef.current?.focus();
    }, 40);
  };

  const scrollToFairyCard = (fairy: FairyData) => {
    const target = document.getElementById(getFairyCardId(fairy));
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${getFairyCardId(fairy)}`);
  };

  const scrollToListTop = () => {
    const target = document.getElementById("fairy-name-list");
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (!hasSearched) return;

    const timer = window.setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [hasSearched, searchSequence]);

  return (
    <FairySiteLayout>
      <FairyPageHero
        breadcrumb={<FairyBreadcrumb current="Fairy names" />}
        eyebrow="Rainbow Magic Catalog"
        title="Rainbow Magic Fairy Names List"
        description={
          <>
            Explore the Rainbow Magic fairy names from A to Z. Find fairies
            that share your name, check the full title for a character you
            remember, or browse the titles when you are choosing which fairy
            to look up next.
          </>
        }
        visual={
          <FairyCoverFeature
            ariaLabel="Three covers from the A–Z Rainbow Magic fairy catalog"
            eyebrow={`${FAIRY_LIST.length} cover records`}
            title="An A–Z map of Fairyland"
            fairies={FAIRY_NAME_HERO_FAIRIES}
          />
        }
      >
        <div className="mx-auto max-w-2xl rounded-2xl border border-outline-variant bg-white/80 p-4 text-left lg:mx-0">
          <CoverSourceNote />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
          <a
            href="#fairy-list-finder"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-extrabold text-on-primary shadow-[0_14px_30px_rgba(139,92,246,0.28)] transition hover:bg-primary-container focus:outline-none focus:ring-4 focus:ring-primary/25"
          >
            Find My Fairy
          </a>
          <a
            href="#fairy-name-list"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-outline-variant bg-white px-6 text-sm font-bold text-on-surface transition hover:border-primary/30 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
          >
            Browse {FAIRY_LIST.length} Titles
          </a>
        </div>
      </FairyPageHero>

      <section
        id="fairy-list-finder"
        className="sticky top-16 z-40 border-b border-outline-variant bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:top-20"
      >
        <form
          onSubmit={handleFinderSubmit}
          className="mx-auto flex max-w-6xl gap-2"
        >
          <input
            ref={finderInputRef}
            type="text"
            value={finderName}
            onChange={(event) => setFinderName(event.target.value)}
            placeholder="Enter a first name, e.g. Lily"
            autoComplete="given-name"
            autoCapitalize="words"
            inputMode="text"
            className="h-10 min-w-0 flex-1 rounded-xl border border-outline-variant bg-white px-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 md:h-11 md:px-4 md:text-base"
          />
          <button
            type="submit"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-primary px-4 text-sm font-extrabold text-on-primary shadow-sm transition hover:bg-primary-container focus:outline-none focus:ring-4 focus:ring-primary/25 md:h-11 md:px-6"
          >
            Find
          </button>
        </form>
      </section>

      {hasSearched ? (
        <section
          id="fairy-list-result"
          ref={resultRef}
          className="scroll-mt-44 bg-surface-container-low px-4 pt-6 md:scroll-mt-56 md:px-6"
          aria-live="polite"
        >
          <div className="mx-auto max-w-3xl">
            {finderResult ? (
              <article className="rounded-2xl border border-outline-variant bg-white p-5 text-center shadow-sm md:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                  Your Fairy Match
                </p>
                <h2 className="mt-3 text-2xl font-extrabold text-on-surface md:text-3xl">
                  {finderResult.fullTitle}
                </h2>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {finderResult.name}
                </p>
                <button
                  type="button"
                  className="group mx-auto mt-5 block aspect-[3/4] w-full max-w-[180px] overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/25 md:max-w-[220px]"
                  onClick={() => openFairyModal(finderResult)}
                  aria-label={`Open book cover for ${finderResult.fullTitle}`}
                >
                  <FairyCover imageUrl={finderResult.imageUrl} fairyName={finderResult.fullTitle} eager />
                </button>

                <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    className="inline-flex h-10 min-w-32 items-center justify-center rounded-xl bg-primary px-4 text-sm font-extrabold text-on-primary shadow-sm transition hover:bg-primary-container focus:outline-none focus:ring-4 focus:ring-primary/25"
                    onClick={() => scrollToFairyCard(finderResult)}
                  >
                    View in list
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 min-w-32 items-center justify-center rounded-xl border border-outline-variant bg-white px-4 text-sm font-bold text-on-surface transition hover:border-primary/30 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                    onClick={handleTryAnotherName}
                  >
                    Try Another Name
                  </button>
                </div>
              </article>
            ) : (
              <article className="rounded-2xl border border-outline-variant bg-white p-5 text-center shadow-sm md:p-6">
                <h2 className="text-2xl font-extrabold text-on-surface">
                  No exact match found.
                </h2>
                <p className="mt-3 text-sm text-on-surface-variant md:text-base">
                  Try another spelling, or test one of these:
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {SUGGESTED_NAMES.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className="rounded-full border border-primary/15 bg-white px-3 py-1.5 text-sm font-bold text-primary transition hover:border-primary/35 hover:bg-secondary-fixed/30 focus:outline-none focus:ring-4 focus:ring-primary/15"
                      onClick={() => runFinderSearch(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-extrabold text-on-primary shadow-sm transition hover:bg-primary-container focus:outline-none focus:ring-4 focus:ring-primary/25"
                  onClick={scrollToListTop}
                >
                  Browse All Fairy Names
                </button>
                {searchedName ? (
                  <p className="mt-3 text-xs text-on-surface-variant/70">
                    Searched name: {searchedName}
                  </p>
                ) : null}
              </article>
            )}
          </div>
        </section>
      ) : null}

      <section
        id="fairy-name-list"
        className="scroll-mt-44 bg-surface-container-low px-6 py-12 md:scroll-mt-56 md:py-16"
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                A-Z List
              </p>
              <h2 className="mt-3 text-3xl font-bold text-on-surface md:text-4xl">
                All Fairy Titles
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-on-surface-variant">
              Names are grouped by the first name stored in the catalog. Some
              collection titles are grouped under their catalog name.
            </p>
          </div>

          <div className="mt-8 lg:grid lg:grid-cols-[4.5rem_minmax(0,1fr)] lg:gap-8">
            <nav
              aria-label="Fairy name letters"
              className="sticky top-32 z-30 -mx-6 border-y border-outline-variant bg-white/95 px-4 py-2 shadow-sm backdrop-blur lg:top-36 lg:mx-0 lg:max-h-[calc(100vh-10rem)] lg:self-start lg:overflow-y-auto lg:rounded-2xl lg:border lg:bg-white lg:p-3"
            >
              <div className="lg:hidden">
                <div className="flex items-center gap-2">
                  <div className="grid min-w-0 flex-1 grid-cols-7 gap-1">
                    {ALPHABET.slice(0, 7).map((letter) => (
                      <LetterLink
                        key={letter}
                        letter={letter}
                        isActive={activeLetter === letter}
                        onClick={(event) => handleLetterClick(event, letter)}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-outline-variant bg-white text-on-surface transition hover:border-primary/30 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                    aria-label={isLetterPanelOpen ? "Hide all fairy name letters" : "Show all fairy name letters"}
                    aria-expanded={isLetterPanelOpen}
                    aria-controls="fairy-letter-panel"
                    onClick={() => setIsLetterPanelOpen((open) => !open)}
                  >
                    <Menu aria-hidden className="h-5 w-5" />
                  </button>
                </div>

                <div
                  id="fairy-letter-panel"
                  hidden={!isLetterPanelOpen}
                  className="mt-2 grid grid-cols-5 gap-1 border-t border-outline-variant pt-2 sm:grid-cols-6"
                >
                  {ALPHABET.map((letter) => (
                    <LetterLink
                      key={letter}
                      letter={letter}
                      isActive={activeLetter === letter}
                      onClick={(event) => handleLetterClick(event, letter)}
                    />
                  ))}
                </div>
              </div>

              <div className="hidden grid-cols-1 gap-2 lg:grid">
                {ALPHABET.map((letter) => (
                  <LetterLink
                    key={letter}
                    letter={letter}
                    isActive={activeLetter === letter}
                    onClick={(event) => handleLetterClick(event, letter)}
                  />
                ))}
              </div>
            </nav>

            <div className="mt-10 space-y-12 lg:mt-0">
              {LETTER_GROUPS.map(([letter, fairies]) => (
                <section
                  key={letter}
                  id={`letter-${letter}`}
                  className="scroll-mt-44 md:scroll-mt-56"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <h3 className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-xl font-extrabold text-on-primary">
                      {letter}
                    </h3>
                    <p className="text-sm font-semibold text-on-surface-variant">
                      {fairies.length} titles
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {fairies.map((fairy) => (
                      <article
                        key={fairy.id}
                        id={getFairyCardId(fairy)}
                        className="grid scroll-mt-44 grid-cols-[72px_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-outline-variant bg-white p-3 shadow-sm sm:flex sm:gap-4 md:scroll-mt-56"
                      >
                        <button
                          type="button"
                          className="group relative h-24 w-[72px] shrink-0 overflow-hidden rounded-xl bg-surface-container-low text-left focus:outline-none focus:ring-4 focus:ring-primary/25 sm:h-28 sm:w-20"
                          onClick={() => openFairyModal(fairy)}
                          aria-label={`Open book cover for ${fairy.fullTitle}`}
                        >
                          <FairyCover imageUrl={fairy.imageUrl} fairyName={fairy.fullTitle} compact />
                          <span className="absolute inset-x-1 bottom-1 rounded-full bg-white/95 px-2 py-1 text-center text-[10px] font-bold text-primary opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
                            View
                          </span>
                        </button>
                        <div className="min-w-0 py-1">
                          <p className="text-[13px] font-semibold leading-5 text-on-surface-variant sm:text-xs sm:font-bold sm:uppercase sm:tracking-[0.18em] sm:text-primary">
                            {fairy.name}
                          </p>
                          <h4 className="mt-1 text-[15px] font-bold leading-snug text-on-surface sm:mt-2 sm:text-base sm:leading-6">
                            {fairy.fullTitle}
                          </h4>
                          <button
                            type="button"
                            className="mt-2 inline-flex min-h-8 items-center rounded-lg text-xs font-bold text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-4 focus:ring-primary/15 sm:hidden"
                            onClick={() => openFairyModal(fairy)}
                          >
                            View
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>

      {selectedFairy ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-on-surface/70 px-4 py-6 backdrop-blur-sm"
          onClick={() => closeFairyModal()}
        >
          <div
            ref={dialogRef}
            className="relative max-h-full w-full max-w-4xl overflow-auto rounded-3xl bg-white p-4 shadow-[0_30px_90px_rgba(0,0,0,0.35)] max-sm:mt-auto max-sm:max-h-[92dvh] max-sm:rounded-b-none md:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fairy-list-preview-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              ref={closeButtonRef}
              type="button"
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-on-surface shadow-sm transition hover:bg-surface-container-low focus:outline-none focus:ring-4 focus:ring-primary/25"
              onClick={() => closeFairyModal()}
              aria-label="Close book cover"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(280px,0.7fr)] md:items-center">
              <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-surface-container-low">
                <FairyCover imageUrl={selectedFairy.imageUrl} fairyName={selectedFairy.fullTitle} eager />
              </div>

              <div className="text-center md:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                  Fairy Title
                </p>
                <h3
                  id="fairy-list-preview-title"
                  className="mt-3 text-2xl font-extrabold text-on-surface md:text-3xl"
                >
                  {selectedFairy.fullTitle}
                </h3>
                <p className="mt-2 text-sm font-semibold text-primary">
                  Catalog name: {selectedFairy.name}
                </p>
                <p className="mt-4 text-sm leading-7 text-on-surface-variant">
                  This title is included in the Rainbow Magic Fairy Name Finder
                  catalog. Use it to check the spelling, remember the full
                  title, or choose a name before trying the finder.
                </p>
                <div className="mt-4">
                  <CoverSourceNote imageUrl={selectedFairy.imageUrl} />
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row md:justify-start">
                  <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-extrabold text-on-primary shadow-[0_14px_30px_rgba(139,92,246,0.28)] transition hover:bg-primary-container focus:outline-none focus:ring-4 focus:ring-primary/25"
                    onClick={() => {
                      closeFairyModal(true);
                    }}
                  >
                    Find My Fairy
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-outline-variant bg-white px-5 text-sm font-bold text-on-surface transition hover:border-primary/30 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                    onClick={() => closeFairyModal()}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </FairySiteLayout>
  );
}

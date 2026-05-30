import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import type { Route } from "./+types/fairy-names";

import { FAIRY_LIST } from "~/features/fairy-finder/data/fairies";
import type { FairyData } from "~/features/fairy-finder/data/types";
import { FairySiteLayout } from "~/features/fairy-finder/fairy-site-layout";
import { getFairyImageSrc } from "~/features/fairy-finder/utils/image";
import { matchFairy, normalizeName } from "~/features/fairy-finder/utils/match";
import {
  createJsonLdGraph,
  createSeoDescriptors,
  createWebPageJsonLd,
  createWebSiteJsonLd,
} from "~/utils/meta";

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

const getFairyCardId = (fairy: FairyData) =>
  `fairy-${normalizeName(fairy.name)}-${fairy.id}`;

export const meta: Route.MetaFunction = ({ matches }) => {
  const title = "Rainbow Magic Fairy Names List";
  const description =
    "Browse the Rainbow Magic fairy names list, including fairy titles and cover previews from the name finder catalog.";

  return [
    { title },
    { name: "description", content: description },
    {
      name: "keywords",
      content:
        "rainbow magic fairy names, rainbow magic fairy list, rainbow magic fairy titles, fairy name finder list",
    },
    ...createSeoDescriptors({
      pathname: "/fairy-names",
      domain: matches[0]?.data?.DOMAIN,
      title,
      description,
      jsonLd: createJsonLdGraph(
        createWebSiteJsonLd(matches[0]?.data?.DOMAIN),
        createWebPageJsonLd({
          pathname: "/fairy-names",
          domain: matches[0]?.data?.DOMAIN,
          title,
          description,
          locale: "en",
          type: "CollectionPage",
        })
      ),
    }),
  ];
};

export default function FairyNamesPage() {
  const [selectedFairy, setSelectedFairy] = useState<FairyData | null>(null);
  const [finderName, setFinderName] = useState("");
  const [searchedName, setSearchedName] = useState<string | null>(null);
  const [finderResult, setFinderResult] = useState<FairyData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchSequence, setSearchSequence] = useState(0);

  const finderInputRef = useRef<HTMLInputElement | null>(null);
  const resultRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!selectedFairy) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedFairy(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedFairy]);

  const handleLetterClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    letter: string
  ) => {
    event.preventDefault();

    const target = document.getElementById(`letter-${letter}`);
    if (!target) return;

    window.history.replaceState(null, "", `#letter-${letter}`);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
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
      <section className="bg-surface px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Rainbow Magic Catalog
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-on-surface md:text-6xl">
              Rainbow Magic Fairy Names List
            </h1>
            <p className="mt-5 text-base leading-8 text-on-surface-variant md:text-lg">
              Explore the Rainbow Magic fairy names from A to Z. Find fairies
              that share your name, check the full title for a character you
              remember, or browse the covers when you are choosing which fairy
              to look up next.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
          </div>
        </div>
      </section>

      <section
        id="fairy-list-finder"
        className="sticky top-16 z-40 border-b border-transparent bg-surface-container-low px-4 py-3 shadow-sm md:top-20"
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
                  onClick={() => setSelectedFairy(finderResult)}
                  aria-label={`Open larger cover preview for ${finderResult.fullTitle}`}
                >
                  <img
                    src={getFairyImageSrc(finderResult.imageUrl)}
                    alt={finderResult.fullTitle}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
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
              className="sticky top-32 z-30 -mx-6 border-y border-transparent bg-surface-container-low py-3 shadow-sm lg:top-36 lg:mx-0 lg:max-h-[calc(100vh-10rem)] lg:self-start lg:overflow-y-auto lg:rounded-2xl lg:border lg:border-transparent lg:bg-white lg:p-3"
            >
              <div className="overflow-x-auto overscroll-x-contain px-6 pb-1 [scrollbar-width:thin] lg:overflow-visible lg:px-0 lg:pb-0">
                <div className="flex w-max gap-3 lg:grid lg:w-full lg:grid-cols-1 lg:gap-2">
                  {LETTER_GROUPS.map(([letter]) => (
                    <a
                      key={letter}
                      href={`#letter-${letter}`}
                      onClick={(event) => handleLetterClick(event, letter)}
                      className="inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-white px-3 text-sm font-bold text-on-surface transition hover:border-primary/30 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15 lg:w-full"
                    >
                      {letter}
                    </a>
                  ))}
                </div>
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
                          onClick={() => setSelectedFairy(fairy)}
                          aria-label={`Open larger cover preview for ${fairy.fullTitle}`}
                        >
                          <img
                            src={getFairyImageSrc(fairy.imageUrl)}
                            alt={fairy.fullTitle}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
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
                            onClick={() => setSelectedFairy(fairy)}
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
          role="dialog"
          aria-modal="true"
          aria-labelledby="fairy-list-preview-title"
          onClick={() => setSelectedFairy(null)}
        >
          <div
            className="relative max-h-full w-full max-w-4xl overflow-auto rounded-3xl bg-white p-4 shadow-[0_30px_90px_rgba(0,0,0,0.35)] md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-on-surface shadow-sm transition hover:bg-surface-container-low focus:outline-none focus:ring-4 focus:ring-primary/25"
              onClick={() => setSelectedFairy(null)}
              aria-label="Close cover preview"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(280px,0.7fr)] md:items-center">
              <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-surface-container-low">
                <img
                  src={getFairyImageSrc(selectedFairy.imageUrl)}
                  alt={selectedFairy.fullTitle}
                  className="h-full w-full object-cover"
                />
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

                <div className="mt-6 flex flex-col gap-3 sm:flex-row md:justify-start">
                  <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-extrabold text-on-primary shadow-[0_14px_30px_rgba(139,92,246,0.28)] transition hover:bg-primary-container focus:outline-none focus:ring-4 focus:ring-primary/25"
                    onClick={() => {
                      setSelectedFairy(null);
                      window.setTimeout(() => {
                        finderInputRef.current?.focus();
                      }, 40);
                    }}
                  >
                    Find My Fairy
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-outline-variant bg-white px-5 text-sm font-bold text-on-surface transition hover:border-primary/30 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                    onClick={() => setSelectedFairy(null)}
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

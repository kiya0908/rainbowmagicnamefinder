import { ArrowRight, BookOpenCheck, Sparkles, WandSparkles } from "lucide-react";
import { useState } from "react";

import { Link } from "~/components/common";
import { FairyBreadcrumb } from "~/features/fairy-finder/components/fairy-breadcrumb";
import { FairyCoverFeature } from "~/features/fairy-finder/components/fairy-cover-feature";
import { FairyPageHero } from "~/features/fairy-finder/components/fairy-page-hero";
import {
  BOOK_CATALOG_GROUPS,
  BOOK_CATALOG_RECORD_COUNT,
  OFFICIAL_CATALOG_CARD_COUNT,
  OFFICIAL_CATALOG_CHECKED_AT,
  OFFICIAL_CATALOG_GROUP_COUNT,
  OFFICIAL_CATALOG_GROUP_NAMES,
  OFFICIAL_CATALOG_SOURCE_URL,
  OFFICIAL_CATALOG_UNIQUE_TITLE_COUNT,
} from "~/features/fairy-finder/data/book-catalog";
import { FAIRY_LIST } from "~/features/fairy-finder/data/fairies";
import { FairySiteLayout } from "~/features/fairy-finder/fairy-site-layout";
import { matchFairy, normalizeName } from "~/features/fairy-finder/utils/match";
export const FAQ_ITEMS = [
  {
    question: "What is Rainbow Magic?",
    answer: "Rainbow Magic is a long-running collection of fairy stories. Many early books are organised in themed groups of seven, and each title follows a named fairy with a particular role or kind of magic.",
  },
  {
    question: "How many Rainbow Magic fairies are there?",
    answer: "This fan archive contains 324 cover-and-title records. The current Orchard Series Books page has a different scope: 39 catalog sections and 299 cards representing 296 unique normalized titles, so edition records and unique story titles should not be treated as the same count.",
  },
  {
    question: "What order should I read Rainbow Magic books?",
    answer: "A simple starting route is The Rainbow Fairies, followed by The Weather Fairies, Party Fairies, Jewel Fairies, and then the later themed sections in publisher order. Specials and alternate reader formats can be read separately.",
  },
] as const;

const OFFICIAL_GROUPS = OFFICIAL_CATALOG_GROUP_NAMES.map((name) => {
  const localGroup = BOOK_CATALOG_GROUPS.find((group) => group.name === name);
  return {
    name,
    id: localGroup?.id,
    // The live Specials section repeats Nur the Vlogger Fairy once; cards and unique archive records are different counts.
    cardCount: (localGroup?.books.length ?? 2) + (name === "Specials" ? 1 : 0),
  };
});

const CATALOG_RANGES = [
  { id: "catalog-01-10", label: "01–10", groups: OFFICIAL_GROUPS.slice(0, 10) },
  { id: "catalog-11-20", label: "11–20", groups: OFFICIAL_GROUPS.slice(10, 20) },
  { id: "catalog-21-30", label: "21–30", groups: OFFICIAL_GROUPS.slice(20, 30) },
  { id: "catalog-31-39", label: "31–39", groups: OFFICIAL_GROUPS.slice(30) },
] as const;

const describeGroup = (name: string, cardCount: number) => {
  if (name === "Specials") return `${cardCount} standalone, seasonal, and event-led titles grouped together by the publisher.`;
  if (name === "Rainbow Magic Graphic Novels") return `${cardCount} graphic-novel adaptations listed as their own current catalog section.`;
  return `${cardCount} titles grouped by the publisher around the ${name.replace(/^The /, "")} theme.`;
};

const GuideFinderCard = () => {
  const [name, setName] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const result = hasSearched ? matchFairy(name) : null;

  return (
    <article className="flex min-h-72 flex-col rounded-3xl border border-primary/15 bg-secondary-fixed/70 p-7">
      <p className="font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">Exact name lookup</p>
      <h3 className="mt-4 font-serif text-2xl font-bold text-on-surface">Find a fairy you already have in mind</h3>
      <p className="mt-3 text-sm leading-6 text-on-surface-variant">Use the same exact first-name matching as the homepage—no random fallback.</p>
      <form className="mt-6 flex gap-2" onSubmit={(event) => { event.preventDefault(); setHasSearched(Boolean(name.trim())); }}>
        <label className="sr-only" htmlFor="guide-fairy-name">Fairy first name</label>
        <input id="guide-fairy-name" value={name} onChange={(event) => { setName(event.target.value); setHasSearched(false); }} placeholder="Try Ruby or Amber" className="h-12 min-w-0 flex-1 rounded-xl border border-outline-variant bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
        <button type="submit" className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary font-black text-white focus:outline-none focus:ring-4 focus:ring-primary/20" aria-label="Check name">→</button>
      </form>
      <p className="mt-2 min-h-6 text-xs leading-6 text-on-surface-variant" aria-live="polite">
        {hasSearched ? (result ? `${result.fullTitle} is in the archive.` : "No exact match. Try another spelling or browse the A–Z list.") : "Exact first-name lookup only."}
      </p>
      <Link to={result ? `/fairy-names#fairy-${normalizeName(result.name)}-${result.id}` : "/fairy-names"} className="mt-auto inline-flex min-h-11 items-center font-extrabold text-primary underline decoration-primary/25 underline-offset-4">
        {result ? "View this fairy" : "Browse all fairy names"} <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
      </Link>
    </article>
  );
};

export function RainbowMagicFairyGuidePage() {
  return (
    <FairySiteLayout mainClassName="overflow-hidden bg-surface">
      <FairyPageHero
        breadcrumb={<FairyBreadcrumb current="Fairy guide" />}
        eyebrow="Reader's field guide"
        title="Rainbow Magic Fairies — Complete Guide"
        description="A clear starting point for readers trying to remember a fairy, choose a series, or turn a favourite set of books into a reading plan. This guide connects the name finder, A–Z catalog, all current publisher sections, and the full 324-record cover archive."
        visual={
          <FairyCoverFeature
            ariaLabel="Guide cover with three archived Rainbow Magic covers"
            eyebrow="39 current sections · 324 archive records"
            title="A reading map into Fairyland"
            fairies={[FAIRY_LIST[10], FAIRY_LIST[145], FAIRY_LIST[288]]}
          />
        }
      >
        <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
          <Link
            to="/"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary-container px-6 text-sm font-extrabold text-on-primary shadow-lg shadow-primary-container/20 transition hover:bg-primary-container/90 focus:outline-none focus:ring-4 focus:ring-primary/15"
          >
            <WandSparkles aria-hidden className="h-4 w-4" /> Find your fairy
          </Link>
          <Link
            to="/books"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-white px-6 text-sm font-extrabold text-on-surface shadow-sm transition hover:border-primary/40 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
          >
            <BookOpenCheck aria-hidden className="h-4 w-4" /> Open the book checklist
          </Link>
        </div>
      </FairyPageHero>

      <section className="border-b border-outline-variant bg-surface-container-low px-6" aria-label="Catalog scope summary">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-[11rem_repeat(4,1fr)]">
          <div className="col-span-2 flex items-center border-b border-outline-variant py-5 font-serif text-lg font-bold text-on-surface md:col-span-1 md:border-b-0 md:pr-5">Four counts.<br />Four meanings.</div>
          {[[OFFICIAL_CATALOG_GROUP_COUNT, "current publisher catalog sections"], [OFFICIAL_CATALOG_CARD_COUNT, "book cards on the current publisher page"], [OFFICIAL_CATALOG_UNIQUE_TITLE_COUNT, "unique normalized titles"], [BOOK_CATALOG_RECORD_COUNT, "cover-and-title archive records"]].map(([value, label]) => (
            <div key={label} className="border-l border-outline-variant px-4 py-5 md:px-6"><dt className="font-mono text-2xl font-black text-on-surface">{value}</dt><dd className="mt-2 text-xs leading-5 text-on-surface-variant">{label}</dd></div>
          ))}
        </dl>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <section className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="rounded-[1.75rem] bg-on-surface p-7 text-white shadow-xl md:p-9">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-container">Start here</p>
            <h2 className="mt-4 text-3xl font-black leading-tight">What is Rainbow Magic?</h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-on-surface-variant">
            <p>Rainbow Magic is built around short fairy adventures and a large cast of named characters. The early groups often use a pattern of seven related fairies, while later collections commonly contain four titles and the Specials section gathers standalone stories. That changing structure is why describing the range as only seven series is inaccurate.</p>
            <p>This site is a fan-made lookup, not a publisher catalogue. It helps readers find a matching character name, browse the local A–Z archive, and organise a reading run. Titles, editions, cover art, and names can differ by market, so the publisher or a library record remains the best source for buying and edition-specific questions.</p>
          </div>
        </section>

        <section className="mt-20" aria-labelledby="series-heading">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Reading map</p><h2 id="series-heading" className="mt-3 text-3xl font-black tracking-tight text-on-surface md:text-4xl">All current Rainbow Magic catalog sections</h2></div>
            <Link to="/books" className="inline-flex items-center gap-2 font-extrabold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary">See all {BOOK_CATALOG_RECORD_COUNT} archive records <ArrowRight aria-hidden className="h-4 w-4" /></Link>
          </div>
          <p className="mt-5 max-w-4xl text-base leading-8 text-on-surface-variant">The publisher page checked on {OFFICIAL_CATALOG_CHECKED_AT} uses {OFFICIAL_CATALOG_GROUP_COUNT} navigation headings. That count includes Specials and Graphic Novels, so “catalog sections” is more accurate than calling all 39 conventional series. <a href={OFFICIAL_CATALOG_SOURCE_URL} target="_blank" rel="external noopener noreferrer" className="font-bold text-primary underline underline-offset-4">Check the official source</a>.</p>
          <nav aria-label="Catalog section ranges" className="-mx-6 mt-8 flex gap-2 overflow-x-auto px-6 pb-2 lg:hidden">
            {CATALOG_RANGES.map((range) => <a key={range.id} href={`#${range.id}`} className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-primary/20 bg-white px-4 font-mono text-xs font-extrabold text-primary">{range.label}</a>)}
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-12">
            <nav aria-label="Desktop catalog navigation" className="sticky top-28 hidden self-start lg:block">
              <p className="font-mono text-[11px] font-extrabold uppercase tracking-[0.13em] text-on-surface-variant">Section ranges</p>
              <ol className="mt-4 border-l border-outline-variant pl-5">
                {CATALOG_RANGES.map((range) => <li key={range.id}><a href={`#${range.id}`} className="flex min-h-11 items-center text-sm font-bold text-on-surface-variant hover:text-primary">{range.label}</a></li>)}
              </ol>
            </nav>

            <div className="min-w-0 space-y-14">
              {CATALOG_RANGES.map((range) => (
                <section key={range.id} id={range.id} className="scroll-mt-28">
                  <div className="mb-4 flex items-center gap-4"><span className="h-9 w-2 rounded-full bg-secondary-fixed" aria-hidden /><h3 className="font-mono text-sm font-extrabold tracking-[0.08em] text-on-surface">Sections {range.label}</h3></div>
                  <div className="divide-y divide-outline-variant border-y border-on-surface">
                    {range.groups.map((group) => {
                      const index = OFFICIAL_GROUPS.indexOf(group);
                      return (
                        <details key={group.name} className="group">
                          <summary className="grid min-h-20 cursor-pointer list-none grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 py-4 marker:hidden md:grid-cols-[3.25rem_minmax(0,1fr)_auto_2.5rem]">
                            <span className="font-mono text-xs font-extrabold text-primary">{String(index + 1).padStart(2, "0")}</span>
                            <span className="font-serif text-xl font-bold text-on-surface md:text-2xl">{group.name}</span>
                            <span className="font-mono text-[11px] text-on-surface-variant">{group.cardCount} {group.cardCount === 1 ? "card" : "cards"}</span>
                            <span aria-hidden className="hidden h-9 w-9 items-center justify-center rounded-full border border-outline-variant text-primary transition group-open:rotate-45 md:inline-flex">+</span>
                          </summary>
                          <div className="pb-6 pl-[3.25rem] pr-2 md:pl-[4.25rem]">
                            <p className="max-w-2xl text-sm leading-7 text-on-surface-variant">{describeGroup(group.name, group.cardCount)}</p>
                            {group.id ? <Link to={`/books#${group.id}`} className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-primary underline decoration-primary/25 underline-offset-4 hover:decoration-primary">Browse checklist titles <ArrowRight aria-hidden className="h-4 w-4" /></Link> : <a href={OFFICIAL_CATALOG_SOURCE_URL} target="_blank" rel="external noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-primary underline decoration-primary/25 underline-offset-4 hover:decoration-primary">View on official catalog <ArrowRight aria-hidden className="h-4 w-4" /></a>}
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20" aria-labelledby="guide-paths-title">
          <p className="font-mono text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Explore</p>
          <h2 id="guide-paths-title" className="mt-3 font-serif text-3xl font-bold text-on-surface md:text-5xl">Three ways into Fairyland</h2>
          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            <GuideFinderCard />
            <Link to="/fairy-names" className="group flex min-h-72 flex-col rounded-3xl border border-outline-variant bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg"><Sparkles aria-hidden className="h-6 w-6 text-secondary" /><h3 className="mt-5 font-serif text-2xl font-bold text-on-surface">Browse All Fairy Names</h3><p className="mt-3 text-sm leading-6 text-on-surface-variant">Explore the complete local A–Z index, then open a title card when you recognise a fairy.</p><span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-extrabold text-primary">Open the A–Z catalog <ArrowRight aria-hidden className="h-4 w-4" /></span></Link>
            <Link to="/books" className="group flex min-h-72 flex-col rounded-3xl border border-outline-variant bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg"><BookOpenCheck aria-hidden className="h-6 w-6 text-tertiary" /><h3 className="mt-5 font-serif text-2xl font-bold text-on-surface">Rainbow Magic Books Checklist</h3><p className="mt-3 text-sm leading-6 text-on-surface-variant">Tick off all {BOOK_CATALOG_RECORD_COUNT} archived cover records, print the list, and return whenever you need it.</p><span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-extrabold text-primary">Start the checklist <ArrowRight aria-hidden className="h-4 w-4" /></span></Link>
          </div>
        </section>

        <section className="mt-20 rounded-[2rem] border border-outline-variant bg-surface-container-low p-7 md:p-10" aria-labelledby="guide-faq">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Reader questions</p>
          <h2 id="guide-faq" className="mt-3 text-3xl font-black text-on-surface">Rainbow Magic FAQ</h2>
          <div className="mt-8 divide-y divide-outline-variant">
            {FAQ_ITEMS.map((item) => <details key={item.question} className="group py-5"><summary className="cursor-pointer list-none pr-8 text-lg font-black text-on-surface marker:hidden">{item.question}<span aria-hidden className="float-right text-primary transition group-open:rotate-45">+</span></summary><p className="mt-3 max-w-3xl text-sm leading-7 text-on-surface-variant">{item.answer}</p></details>)}
          </div>
          <p className="mt-8 text-sm leading-7 text-on-surface-variant">For cover source and rights information, read the <Link to="/about" className="font-bold text-primary underline underline-offset-4">About this site</Link> notice. For a correction or rights-holder request, use the <Link to="/contact" className="font-bold text-primary underline underline-offset-4">contact page</Link>.</p>
        </section>
      </article>
    </FairySiteLayout>
  );
}

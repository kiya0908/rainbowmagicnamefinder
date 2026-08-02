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
    question: "What is a Rainbow Magic fairy?",
    answer: "A Rainbow Magic fairy is a named character connected to a particular color, season, activity, place, animal, or kind of magic. Each named character usually leads her own short adventure within a themed group of books, often supported by familiar settings, recurring friends, and shared magical rules across the series.",
  },
  {
    question: "How many Rainbow Magic fairies are there?",
    answer: `This guide uses the publisher catalog checked on ${OFFICIAL_CATALOG_CHECKED_AT} as its scope. It contains ${BOOK_CATALOG_RECORD_COUNT} title-and-cover records across ${OFFICIAL_CATALOG_GROUP_COUNT} sections, matching ${OFFICIAL_CATALOG_CARD_COUNT} publisher listings and ${OFFICIAL_CATALOG_UNIQUE_TITLE_COUNT} distinct titles.`,
  },
  {
    question: "Which fairy series should I read first?",
    answer: "A practical reading route starts with The Rainbow Fairies, then continues through The Weather Fairies, Party Fairies, and Jewel Fairies. Later themed sections can be explored independently, while Specials and alternate formats can stay separate.",
  },
] as const;

const GUIDE_STEPS = [
  {
    number: "01",
    title: "Start with an exact name",
    description: "Use the Rainbow Magic fairy name lookup when you remember a first name such as Ruby or Amber. It returns only an exact match from the checked publisher title set, so the result is predictable rather than random.",
  },
  {
    number: "02",
    title: "Check the full character title",
    description: "Open the A–Z name index when you need to confirm spelling, compare similar names, or identify the complete title attached to a character in the same official-catalog dataset.",
  },
  {
    number: "03",
    title: "Move from a character to a series",
    description: "Choose a fairy series from the catalog map, open its checklist, and follow the numbered books inside that themed section instead of treating every section as one continuous story.",
  },
] as const;

const OFFICIAL_GROUPS = OFFICIAL_CATALOG_GROUP_NAMES.map((name) => {
  const localGroup = BOOK_CATALOG_GROUPS.find((group) => group.name === name);
  return {
    name,
    id: localGroup?.id,
    cardCount: localGroup?.books.length ?? 0,
  };
});

const CATALOG_RANGES = [
  { id: "catalog-01-10", label: "01–10", groups: OFFICIAL_GROUPS.slice(0, 10) },
  { id: "catalog-11-20", label: "11–20", groups: OFFICIAL_GROUPS.slice(10, 20) },
  { id: "catalog-21-30", label: "21–30", groups: OFFICIAL_GROUPS.slice(20, 30) },
  { id: "catalog-31-39", label: "31–39", groups: OFFICIAL_GROUPS.slice(30) },
] as const;

const describeGroup = (name: string) => {
  if (name === "Specials") return "covering standalone, seasonal, and event-led titles grouped together by the publisher.";
  if (name === "Rainbow Magic Graphic Novels") return "for graphic-novel adaptations presented as their own current catalog section.";
  return <>{`the ${name.replace(/^The /, "")} `}<span aria-hidden className="guide-theme-label" />.</>;
};

const GuideFinderCard = () => {
  const [name, setName] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const result = hasSearched ? matchFairy(name) : null;

  return (
    <article className="flex min-h-72 flex-col rounded-3xl border border-primary/15 bg-secondary-fixed/70 p-7">
      <p className="font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">Exact name lookup</p>
      <h3 className="mt-4 font-serif text-2xl font-bold text-on-surface">Find a Rainbow Magic fairy by name</h3>
      <p className="mt-3 text-sm leading-6 text-on-surface-variant">Enter the first name of a Rainbow Magic fairy to check the same official title set used by the homepage. There is no random fallback.</p>
      <form className="mt-6 flex gap-2" onSubmit={(event) => { event.preventDefault(); setHasSearched(Boolean(name.trim())); }}>
        <label className="sr-only" htmlFor="guide-fairy-name">Fairy first name</label>
        <input id="guide-fairy-name" value={name} onChange={(event) => { setName(event.target.value); setHasSearched(false); }} placeholder="Try Ruby or Amber" className="h-12 min-w-0 flex-1 rounded-xl border border-outline-variant bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
        <button type="submit" className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary font-black text-white focus:outline-none focus:ring-4 focus:ring-primary/20" aria-label="Check name">→</button>
      </form>
      <p className="mt-2 min-h-6 text-xs leading-6 text-on-surface-variant" aria-live="polite">
        {hasSearched ? (result ? `${result.fullTitle} is in the checked catalog.` : "No exact match. Try another spelling or browse the A–Z list.") : "Exact first-name lookup only."}
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
        title="Rainbow Magic Fairy Guide: Names, Books & Series"
        description="Use this Rainbow Magic fairy guide to identify a character, confirm her full title, choose a themed series, and build a reading plan from the same 299-title publisher catalog used across this site."
        visual={
          <FairyCoverFeature
            ariaLabel="Guide cover with three Rainbow Magic catalog covers"
            eyebrow="39 official sections · 299 titles"
            title="A character-to-series reading map"
            fairies={[FAIRY_LIST[10], FAIRY_LIST[145], FAIRY_LIST[288]]}
          />
        }
      >
        <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
          <Link
            to="/"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary-container px-6 text-sm font-extrabold text-on-primary shadow-lg shadow-primary-container/20 transition hover:bg-primary-container/90 focus:outline-none focus:ring-4 focus:ring-primary/15"
          >
            <WandSparkles aria-hidden className="h-4 w-4" /> Find your Rainbow Magic fairy
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
          <div className="col-span-2 flex items-center border-b border-outline-variant py-5 font-serif text-lg font-bold text-on-surface md:col-span-1 md:border-b-0 md:pr-5">One catalog.<br />Four useful views.</div>
          {[[OFFICIAL_CATALOG_GROUP_COUNT, "publisher catalog sections"], [OFFICIAL_CATALOG_CARD_COUNT, "publisher catalog listings"], [OFFICIAL_CATALOG_UNIQUE_TITLE_COUNT, "distinct official titles"], [BOOK_CATALOG_RECORD_COUNT, "local title-and-cover records"]].map(([value, label]) => (
            <div key={label} className="border-l border-outline-variant px-4 py-5 md:px-6"><dt className="font-mono text-2xl font-black text-on-surface">{value}</dt><dd className="mt-2 text-xs leading-5 text-on-surface-variant">{label}</dd></div>
          ))}
        </dl>
      </section>

      <article className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <section className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="rounded-[1.75rem] bg-on-surface p-7 text-white shadow-xl md:p-9">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-container">Character basics</p>
            <h2 className="mt-4 text-3xl font-black leading-tight">What Is a Rainbow Magic Fairy?</h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-on-surface-variant">
            <p>A Rainbow Magic fairy is the central character in a short magical adventure. Her name and role usually connect to the theme of a book group: colors, weather, parties, jewels, pets, sports, seasons, and many later subjects all appear across the catalog. Early groups often contain seven related characters, while later sections commonly contain four listings.</p>
            <p>Because every Rainbow Magic fairy has a specific name and title, readers often remember one detail but not the whole book. This independent guide connects those details without pretending to be an official bibliography. Use it to move from a first name to a full title, then from the title to a themed section and its reading order.</p>
            <p>Catalog scope matters. Specials and Graphic Novels are official sections but do not represent conventional seven-book series, while out-of-catalog reader and reference formats are not included in this dataset. Titles and editions can also differ by market, so use the linked publisher catalog or a library record for edition-specific decisions.</p>
          </div>
        </section>

        <section className="mt-20" aria-labelledby="guide-steps-title">
          <div className="grid gap-5 border-b border-on-surface pb-7 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-end">
            <div><p className="font-mono text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Three-step route</p><h2 id="guide-steps-title" className="mt-3 font-serif text-3xl font-bold text-on-surface md:text-5xl">How to Use This Rainbow Magic Fairy Guide</h2></div>
            <p className="text-sm leading-7 text-on-surface-variant">Start with the detail you already know. The three paths share the same official title set, but each answers a different question: who is the character, what is her full title, and where does her series sit in the catalog?</p>
          </div>
          <ol className="grid divide-y divide-outline-variant border-b border-on-surface md:grid-cols-3 md:divide-x md:divide-y-0">
            {GUIDE_STEPS.map((step) => (
              <li key={step.number} className="py-7 md:px-7 md:py-9 first:md:pl-0 last:md:pr-0">
                <span className="font-mono text-xs font-extrabold text-primary">{step.number}</span>
                <h3 className="mt-5 font-serif text-xl font-bold text-on-surface">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-20" aria-labelledby="series-heading">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Reading map</p><h2 id="series-heading" className="mt-3 text-3xl font-black tracking-tight text-on-surface md:text-4xl">Rainbow Magic Fairy Series and Catalog Sections</h2></div>
            <Link to="/books" className="inline-flex items-center gap-2 font-extrabold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary">See all {BOOK_CATALOG_RECORD_COUNT} official titles <ArrowRight aria-hidden className="h-4 w-4" /></Link>
          </div>
          <p className="mt-5 max-w-4xl text-base leading-8 text-on-surface-variant">Each catalog section below follows the publisher navigation checked on {OFFICIAL_CATALOG_CHECKED_AT}. The {OFFICIAL_CATALOG_GROUP_COUNT} headings include Specials and Graphic Novels, so “catalog sections” is more accurate than calling all 39 conventional series. Expand a row for its scope, then open the matching checklist. <a href={OFFICIAL_CATALOG_SOURCE_URL} target="_blank" rel="external noopener noreferrer" className="font-bold text-primary underline underline-offset-4">Check the official source</a>.</p>
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
                            <span aria-label={`${group.cardCount} catalog entries`} className="font-mono text-[11px] text-on-surface-variant">{group.cardCount}<span aria-hidden className={`guide-listing-count-label${group.cardCount === 1 ? " is-singular" : ""}`} /></span>
                            <span aria-hidden className="hidden h-9 w-9 items-center justify-center rounded-full border border-outline-variant text-primary transition group-open:rotate-45 md:inline-flex">+</span>
                          </summary>
                          <div className="pb-6 pl-[3.25rem] pr-2 md:pl-[4.25rem]">
                            <p className="max-w-2xl text-sm leading-7 text-on-surface-variant">{group.cardCount} <span aria-hidden className="guide-publisher-listings-label" /> {describeGroup(group.name)}</p>
                            {group.id ? <Link to={`/books#${group.id}`} aria-label={`View ${group.name} series checklist`} className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-primary underline decoration-primary/25 underline-offset-4 hover:decoration-primary"><span aria-hidden className="guide-series-checklist-label" /><ArrowRight aria-hidden className="h-4 w-4" /></Link> : <a href={OFFICIAL_CATALOG_SOURCE_URL} target="_blank" rel="external noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-primary underline decoration-primary/25 underline-offset-4 hover:decoration-primary">View official catalog <ArrowRight aria-hidden className="h-4 w-4" /></a>}
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
          <h2 id="guide-paths-title" className="mt-3 font-serif text-3xl font-bold text-on-surface md:text-5xl">Choose Your Fairyland Path</h2>
          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            <GuideFinderCard />
            <Link to="/fairy-names" className="group flex min-h-72 flex-col rounded-3xl border border-outline-variant bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg"><Sparkles aria-hidden className="h-6 w-6 text-secondary" /><h3 className="mt-5 font-serif text-2xl font-bold text-on-surface">Browse All Fairy Names</h3><p className="mt-3 text-sm leading-6 text-on-surface-variant">Use the Rainbow Magic fairy A–Z index to compare names and open the complete title attached to any character you recognise.</p><span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-extrabold text-primary">Open the A–Z catalog <ArrowRight aria-hidden className="h-4 w-4" /></span></Link>
            <Link to="/books" className="group flex min-h-72 flex-col rounded-3xl border border-outline-variant bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg"><BookOpenCheck aria-hidden className="h-6 w-6 text-tertiary" /><h3 className="mt-5 font-serif text-2xl font-bold text-on-surface">Rainbow Magic Books Checklist</h3><p className="mt-3 text-sm leading-6 text-on-surface-variant">Tick off all {BOOK_CATALOG_RECORD_COUNT} official catalog titles, print the list, and return whenever you need it.</p><span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-extrabold text-primary">Start the checklist <ArrowRight aria-hidden className="h-4 w-4" /></span></Link>
          </div>
        </section>

        <section className="mt-20 rounded-[2rem] border border-outline-variant bg-surface-container-low p-7 md:p-10" aria-labelledby="guide-faq">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Reader questions</p>
          <h2 id="guide-faq" className="mt-3 text-3xl font-black text-on-surface">Rainbow Magic Fairy FAQ</h2>
          <div className="mt-8 divide-y divide-outline-variant">
            {FAQ_ITEMS.map((item) => <details key={item.question} className="group py-5"><summary className="cursor-pointer list-none pr-8 text-lg font-black text-on-surface marker:hidden">{item.question}<span aria-hidden className="float-right text-primary transition group-open:rotate-45">+</span></summary><p className="mt-3 max-w-3xl text-sm leading-7 text-on-surface-variant">{item.answer}</p></details>)}
          </div>
          <p className="mt-8 text-sm leading-7 text-on-surface-variant">For cover source and rights information, read the <Link to="/about" className="font-bold text-primary underline underline-offset-4">About this site</Link> notice. For a correction or rights-holder request, use the <Link to="/contact" className="font-bold text-primary underline underline-offset-4">contact page</Link>.</p>
        </section>
      </article>
      <style>{`
        .guide-series-checklist-label::after { content: "View series checklist"; }
        .guide-publisher-listings-label::after { content: "publisher listings organised around"; }
        .guide-listing-count-label::after { content: " listings"; }
        .guide-listing-count-label.is-singular::after { content: " listing"; }
        .guide-theme-label::after { content: "theme"; }
      `}</style>
    </FairySiteLayout>
  );
}

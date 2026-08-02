import {
  ArrowRight,
  Compass,
  Library,
  Printer,
  Search,
  ShieldCheck,
} from "lucide-react";

import { Link } from "~/components/common";
import { BookChecklist } from "~/features/fairy-finder/components/book-checklist";
import { FairyBreadcrumb } from "~/features/fairy-finder/components/fairy-breadcrumb";
import { FairyCoverFeature } from "~/features/fairy-finder/components/fairy-cover-feature";
import { CoverSourceNote } from "~/features/fairy-finder/components/fairy-image";
import { FairyPageHero } from "~/features/fairy-finder/components/fairy-page-hero";
import { FAIRY_LIST } from "~/features/fairy-finder/data/fairies";
import {
  BOOK_CATALOG_GROUPS,
  BOOK_CATALOG_RECORD_COUNT,
  OFFICIAL_CATALOG_CARD_COUNT,
  OFFICIAL_CATALOG_CHECKED_AT,
  OFFICIAL_CATALOG_GROUP_COUNT,
  OFFICIAL_CATALOG_SOURCE_URL,
  OFFICIAL_CATALOG_UNIQUE_TITLE_COUNT,
} from "~/features/fairy-finder/data/book-catalog";
import { FairySiteLayout } from "~/features/fairy-finder/fairy-site-layout";

const AT_A_GLANCE = [
  {
    question: "How many Rainbow Magic books are included in this guide?",
    answer: `This Rainbow Magic books list contains the same ${OFFICIAL_CATALOG_UNIQUE_TITLE_COUNT} titles shown across ${OFFICIAL_CATALOG_GROUP_COUNT} sections in the publisher catalog checked on ${OFFICIAL_CATALOG_CHECKED_AT}. Each title has one local identification cover and one checklist record.`,
  },
  {
    question: "Where should a new reader start?",
    answer: "A new reader exploring Rainbow Magic books can start with The Rainbow Fairies. It is the first current catalog section, its seven titles are displayed from Book 1 to Book 7, and the shelf opens automatically when this page first loads.",
  },
  {
    question: "Do the different fairy series need to be read in one continuous order?",
    answer: "No. To compare Rainbow Magic books in order, follow Book 1, Book 2, and the remaining numbered positions inside one themed shelf. The separate themes are catalog sections, not one compulsory story that every reader must follow from the first book to the last.",
  },
  {
    question: "Why do some UK and US editions have different titles?",
    answer: "Regional editions can use different titles or covers. A dependable Rainbow Magic books list should not guess those mappings, so this guide only displays an alternate title after the specific UK or US edition has been verified. No unverified regional title is shown today.",
  },
  {
    question: "Does this guide include titles outside the current publisher catalog?",
    answer: "No. The homepage, books checklist, A–Z title index, and fairy guide now use the same checked publisher catalog. Older formats that are not listed there are not mixed into the total.",
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "How many Rainbow Magic books are there?",
    answer: `This guide uses a precise scope: the publisher catalog checked on ${OFFICIAL_CATALOG_CHECKED_AT}. It contained ${OFFICIAL_CATALOG_GROUP_COUNT} sections and ${OFFICIAL_CATALOG_CARD_COUNT} listings, representing ${OFFICIAL_CATALOG_UNIQUE_TITLE_COUNT} distinct titles.`,
  },
  {
    question: "What is the first Rainbow Magic book?",
    answer: "Ruby the Red Fairy is Book 1 of The Rainbow Fairies, the first current shelf in this guide. Readers starting with Rainbow Magic books can open that seven-book shelf and continue through Amber, Saffron, Fern, Sky, Izzy, and Heather in the order displayed.",
  },
  {
    question: "Do Rainbow Magic books need to be read in order?",
    answer: "To read Rainbow Magic books in order, follow the numbered position inside an individual themed series. A Rainbow Magic book series such as The Rainbow Fairies or The Weather Fairies has its own shelf order; the different themes do not need to become one uninterrupted reading run.",
  },
  {
    question: "Why are some Rainbow Magic book titles different in the US and UK?",
    answer: "Regional editions may use different titles or covers. Because this Rainbow Magic books list does not yet contain a verified title-by-title UK/US mapping, it does not guess alternate names or manufacture regional buying links.",
  },
  {
    question: "Can I print this Rainbow Magic books checklist?",
    answer: "Yes. The printable Rainbow Magic books checklist expands every catalog section, removes navigation, filters, covers, and actions, and places a black-and-white box beside every official title. Saved browser progress is not required to print it.",
  },
  {
    question: "Does this page include older editions?",
    answer: `Only when the older edition is itself one of the ${OFFICIAL_CATALOG_UNIQUE_TITLE_COUNT} titles in the checked publisher catalog. This page no longer adds separate out-of-catalog reader or reference records.`,
  },
] as const;

const TASKS = [
  { href: "#book-catalog", label: "Browse Rainbow Magic books", hint: "Open the complete series directory", icon: Library },
  { href: "#catalog-tools", label: "Search the Rainbow Magic books list", hint: "Find a title or fairy and filter the catalog", icon: Search },
  { href: "#reading-order", label: "Read Rainbow Magic books in order", hint: "See how series and formats fit", icon: Compass },
  { href: "#printable-checklist", label: "Print the Rainbow Magic books checklist", hint: "Make a clean paper reading log", icon: Printer },
] as const;

const HERO_FAIRIES = [275, 11, 279].map((id) => {
  const fairy = FAIRY_LIST.find((item) => item.id === id);
  if (!fairy) throw new Error(`Missing verified hero cover record ${id}`);
  return fairy;
});

function ReadingOrderGuide() {
  return (
    <section id="reading-order" className="scroll-mt-28 border-y border-on-surface py-14 md:py-20" aria-labelledby="reading-order-title">
      <div className="grid gap-9 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div>
          <p className="font-mono text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Reading map</p>
          <h2 id="reading-order-title" className="mt-3 font-serif text-3xl font-bold leading-tight text-on-surface md:text-5xl">How to read Rainbow Magic books in order</h2>
          <a href="#the-rainbow-fairies" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary-container px-5 text-sm font-extrabold text-on-primary transition hover:bg-primary focus:outline-none focus:ring-4 focus:ring-primary/20">
            Browse The Rainbow Fairies <ArrowRight aria-hidden className="h-4 w-4" />
          </a>
        </div>
        <ol className="divide-y divide-outline-variant border-y border-outline-variant">
          {[
            ["01", "Start with the first shelf", "New readers can begin their Rainbow Magic books list with The Rainbow Fairies. It appears first in the current publisher catalog used by this guide and provides a clear seven-book starting sequence."],
            ["02", "Follow the order inside a series", "To read Rainbow Magic books in order, use Book 1, Book 2, and the remaining numbered positions inside the selected shelf. Search and filters preserve that position information."],
            ["03", "Treat themes as separate shelves", "Each Rainbow Magic book series is organized as its own shelf. Weather, party, jewel, pet, and later themes support discovery without implying one compulsory story from the first series to the last."],
            ["04", "Keep other formats distinct", "The publisher catalog treats Specials and Graphic Novels as their own sections. They stay separate from the numbered themed shelves without adding out-of-catalog formats to the checklist."],
          ].map(([number, title, text]) => (
            <li key={number} className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4 py-5 md:grid-cols-[3.5rem_minmax(0,1fr)] md:py-6">
              <span className="font-mono text-xs font-extrabold text-primary">{number}</span>
              <div><h3 className="font-serif text-xl font-bold text-on-surface">{title}</h3><p className="mt-2 text-sm leading-7 text-on-surface-variant">{text}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function BooksPage() {
  return (
    <FairySiteLayout mainClassName="bg-surface">
      <FairyPageHero
        breadcrumb={<FairyBreadcrumb current="Books" />}
        eyebrow="Book guide · Series order · Printable checklist"
        title="Rainbow Magic Books: Complete List in Series Order"
        description="Use this Rainbow Magic books list to browse all 299 titles in the checked publisher catalog, follow Rainbow Magic books in order within each shelf, and keep a printable reading checklist."
        visual={
          <FairyCoverFeature
            ariaLabel="Three Rainbow Magic book covers arranged as a reading-journal collage"
            eyebrow="A library, not a product grid"
            title="Find your next series, mark your place"
            fairies={HERO_FAIRIES}
          />
        }
      />

      <section className="books-screen-only border-b border-outline-variant bg-surface-container-low px-6" aria-label="Catalog facts">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
          {[
            [OFFICIAL_CATALOG_UNIQUE_TITLE_COUNT, "official catalog titles"],
            [OFFICIAL_CATALOG_GROUP_COUNT, "catalog sections"],
            [BOOK_CATALOG_RECORD_COUNT, "local cover records"],
            ["August 2, 2026", "Last catalog check"],
          ].map(([value, label], index) => (
            <div key={label} className={`px-4 py-5 md:px-6 ${index % 2 ? "" : "border-r border-outline-variant"} ${index < 2 ? "border-b border-outline-variant md:border-b-0" : ""} ${index > 0 ? "md:border-l md:border-outline-variant" : ""}`}>
              <dt className="font-serif text-2xl font-bold text-on-surface md:text-3xl">{value}</dt>
              <dd className="mt-1 text-xs leading-5 text-on-surface-variant">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <article className="mx-auto max-w-6xl px-5 py-14 sm:px-6 md:py-20">
        <section className="books-screen-only" aria-labelledby="at-a-glance-title">
          <p className="font-mono text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Quick answers</p>
          <h2 id="at-a-glance-title" className="mt-3 font-serif text-3xl font-bold text-on-surface md:text-5xl">Rainbow Magic books at a glance</h2>
          <dl className="mt-9 divide-y divide-outline-variant border-y border-on-surface">
            {AT_A_GLANCE.map((item, index) => (
              <div key={item.question} className="grid gap-2 py-5 md:grid-cols-[2.75rem_minmax(16rem,0.85fr)_minmax(0,1.15fr)] md:gap-6 md:py-6">
                <span className="hidden font-mono text-xs font-extrabold text-primary md:block">{String(index + 1).padStart(2, "0")}</span>
                <dt className="font-serif text-lg font-bold leading-6 text-on-surface">{item.question}</dt>
                <dd className="text-sm leading-7 text-on-surface-variant">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <nav className="books-screen-only mt-16" aria-labelledby="page-tasks-title">
          <div className="flex items-end justify-between gap-5">
            <div><p className="font-mono text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Use this guide</p><h2 id="page-tasks-title" className="mt-3 font-serif text-3xl font-bold text-on-surface md:text-4xl">Choose what you want to do</h2></div>
            <span className="hidden text-sm text-on-surface-variant md:block">All four paths stay on this page</span>
          </div>
          <div className="mt-7 grid border-y border-on-surface sm:grid-cols-2 lg:grid-cols-4">
            {TASKS.map(({ href, label, hint, icon: Icon }, index) => (
              <a key={href} href={href} className={`group min-h-36 p-5 transition hover:bg-surface-container-low focus:outline-none focus:ring-4 focus:ring-inset focus:ring-primary/15 ${index < 3 ? "lg:border-r lg:border-outline-variant" : ""} ${index % 2 === 0 ? "max-lg:border-r max-lg:border-outline-variant" : ""} ${index < 2 ? "max-lg:border-b max-lg:border-outline-variant" : ""}`}>
                <Icon aria-hidden className="h-5 w-5 text-primary" />
                <strong className="mt-5 block font-serif text-lg text-on-surface">{label}</strong>
                <span className="mt-2 block text-xs leading-5 text-on-surface-variant">{hint}</span>
              </a>
            ))}
          </div>
        </nav>

        <BookChecklist groups={BOOK_CATALOG_GROUPS} betweenControlsAndCatalog={<ReadingOrderGuide />} />

        <section id="printable-checklist" className="books-screen-only mt-16 scroll-mt-28 grid gap-8 border-t border-on-surface pt-12 md:grid-cols-[minmax(0,1fr)_18rem] md:items-start">
          <div><p className="font-mono text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Printable checklist</p><h2 className="mt-3 font-serif text-3xl font-bold text-on-surface md:text-5xl">Rainbow Magic books checklist for print</h2><p className="mt-5 max-w-2xl text-sm leading-7 text-on-surface-variant">The printable Rainbow Magic books checklist expands every catalog section and removes navigation, filters, covers, ads, detail actions, and purchase areas. It keeps the section heading, title, reading position, and a fillable black-and-white box for every official title. Your on-screen expanded sections return after printing.</p></div>
          <button type="button" onClick={() => window.print()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary-container px-5 text-sm font-extrabold text-on-primary transition hover:bg-primary focus:outline-none focus:ring-4 focus:ring-primary/20"><Printer aria-hidden className="h-4 w-4" /> Open print preview</button>
        </section>

        <section className="books-screen-only mt-16" aria-labelledby="books-faq-title">
          <p className="font-mono text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Reader questions</p>
          <h2 id="books-faq-title" className="mt-3 font-serif text-3xl font-bold text-on-surface md:text-5xl">Rainbow Magic books FAQ</h2>
          <div className="mt-8 divide-y divide-outline-variant border-y border-on-surface">
            {FAQ_ITEMS.map((item) => <details key={item.question} className="group py-5"><summary className="grid min-h-11 cursor-pointer list-none grid-cols-[minmax(0,1fr)_2rem] items-center gap-4 font-serif text-lg font-bold text-on-surface marker:hidden"><span>{item.question}</span><span aria-hidden className="text-center text-primary transition group-open:rotate-45">+</span></summary><p className="max-w-4xl pb-2 pr-10 text-sm leading-7 text-on-surface-variant">{item.answer}</p></details>)}
          </div>
        </section>

        <section className="books-screen-only mt-16 grid gap-8 border border-outline-variant bg-surface-container-low p-6 md:grid-cols-[2.25rem_minmax(0,1fr)] md:p-9" aria-labelledby="sources-title">
          <ShieldCheck aria-hidden className="h-7 w-7 text-primary" />
          <div>
            <p className="font-mono text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Sources &amp; update rules</p>
            <h2 id="sources-title" className="mt-3 font-serif text-2xl font-bold text-on-surface md:text-3xl">Independent fan-made project &amp; cover sources</h2>
            <div className="mt-5 grid gap-4 text-sm leading-7 text-on-surface-variant md:grid-cols-2 md:gap-8">
              <p>This independent Rainbow Magic books list is not an official publisher bibliography and is not affiliated with or endorsed by Rainbow Magic rights holders. Catalog groupings were checked against the <a href={OFFICIAL_CATALOG_SOURCE_URL} target="_blank" rel="external nofollow noopener noreferrer" className="font-bold text-primary underline underline-offset-4">Orchard Series Books catalog</a> on August 2, 2026. The date is not updated automatically.</p>
              <p>All four public book and fairy pages use the same checked catalog title set. Counts, editions, and regional titles may change when the publisher updates that source. Covers are shown only to help readers identify records and do not imply ownership. To report a correction, use the <Link to="/contact" className="font-bold text-primary underline underline-offset-4">contact page</Link>.</p>
            </div>
            <div className="mt-5 border-t border-outline-variant pt-4"><CoverSourceNote /></div>
          </div>
        </section>

        <section className="books-screen-only mt-16" aria-labelledby="related-tools-title">
          <p className="font-mono text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Keep exploring</p>
          <h2 id="related-tools-title" className="mt-3 font-serif text-3xl font-bold text-on-surface md:text-4xl">Related tools</h2>
          <div className="mt-7 divide-y divide-outline-variant border-y border-on-surface">
            {[
              ["/rainbow-magic-fairy", "Fairy Guide", "Understand the current catalog map and its themed sections."],
              ["/fairy-names", "Fairy Names", "Browse the complete A–Z fairy title index."],
              ["/", "Name Finder", "Look up an exact first-name match from the homepage."],
            ].map(([to, label, description]) => <Link key={to} to={to} className="group grid min-h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-5 py-4"><span><strong className="font-serif text-xl text-on-surface">{label}</strong><span className="mt-1 block text-sm leading-6 text-on-surface-variant">{description}</span></span><ArrowRight aria-hidden className="h-5 w-5 text-primary transition group-hover:translate-x-1" /></Link>)}
          </div>
        </section>

        <aside id="amazon-affiliate-disclosure" role="note" aria-labelledby="amazon-affiliate-disclosure-title" className="books-screen-only mt-16 rounded-[1.75rem] bg-on-surface p-7 text-white shadow-xl md:p-10">
          <div className="grid gap-5 md:grid-cols-[2.5rem_minmax(0,1fr)] md:gap-7">
            <ShieldCheck aria-hidden className="h-7 w-7 text-primary-container" />
            <div>
              <p className="font-mono text-xs font-extrabold uppercase tracking-[0.18em] text-primary-container">Affiliate disclosure</p>
              <h2 id="amazon-affiliate-disclosure-title" className="mt-3 font-serif text-2xl font-bold md:text-3xl">Amazon Associates disclosure</h2>
              <p className="mt-4 max-w-4xl text-sm leading-7 text-white/80"><strong className="text-white">As an Amazon Associate I earn from qualifying purchases.</strong> Links marked as paid Amazon affiliate links may earn this site a commission when you make a qualifying purchase, at no extra cost to you.</p>
            </div>
          </div>
        </aside>
      </article>
    </FairySiteLayout>
  );
}

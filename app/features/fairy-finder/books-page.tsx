import { CheckCircle2, Printer } from "lucide-react";

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
export function BooksPage() {
  return (
    <FairySiteLayout mainClassName="bg-surface">
      <FairyPageHero
        breadcrumb={
          <FairyBreadcrumb current="Books checklist" />
        }
        eyebrow="Reader's checklist"
        title="Rainbow Magic Books — Complete List & Reading Checklist"
        description={<>A printable, tick-as-you-go checklist for all {BOOK_CATALOG_RECORD_COUNT} official-source cover records preserved in this fan archive. The list follows the current publisher sections first, then keeps older Beginner Reader, Early Reader, and reference editions visible.</>}
        visual={
          <FairyCoverFeature
            ariaLabel="Three archived Rainbow Magic covers"
            eyebrow="Made to print"
            title="A 324-title reading checklist"
            fairies={[FAIRY_LIST[0], FAIRY_LIST[110], FAIRY_LIST[220]]}
          />
        }
      />

      <article className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        <section className="mb-16 border-y border-on-surface py-12" aria-labelledby="books-paths-title">
          <p className="font-mono text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Choose a route</p>
          <h2 id="books-paths-title" className="mt-3 font-serif text-3xl font-bold text-on-surface md:text-5xl">Start with the question you already have</h2>
          <div className="mt-9 border-t border-on-surface">
            {[
              ["01", "/rainbow-magic-fairy", "Need the context?", "Start with the Rainbow Magic fairy guide and its map of the current official catalog sections."],
              ["02", "/fairy-names", "Recognise a title?", "Open the A–Z fairy catalog to see the matching local record and cover reference."],
              ["03", "/", "Looking for a name?", "Try the exact-match fairy name finder from the homepage."],
            ].map(([index, to, title, description]) => (
              <Link key={to} to={to} className="group grid min-h-24 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 border-b border-outline-variant py-5 transition hover:bg-surface-container-low md:grid-cols-[3.5rem_minmax(0,1fr)_auto] md:gap-5 md:px-3">
                <span className="font-mono text-xs text-on-surface-variant">{index}</span>
                <span><strong className="block font-serif text-xl text-on-surface md:text-2xl">{title}</strong><span className="mt-1 block text-sm leading-6 text-on-surface-variant">{description}</span></span>
                <span className="col-start-2 text-sm font-extrabold text-primary md:col-start-auto">Explore <span aria-hidden>→</span></span>
              </Link>
            ))}
          </div>
        </section>

        <section id="catalog-source" className="mb-16" aria-labelledby="catalog-counts-title">
          <p className="font-mono text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Catalog scope</p>
          <h2 id="catalog-counts-title" className="mt-3 font-serif text-3xl font-bold text-on-surface md:text-5xl">Four numbers, four different meanings</h2>
          <dl className="mt-9 grid grid-cols-2 border-y border-on-surface md:grid-cols-4">
            {[[OFFICIAL_CATALOG_GROUP_COUNT, "current catalog sections"], [OFFICIAL_CATALOG_CARD_COUNT, "current publisher cards"], [OFFICIAL_CATALOG_UNIQUE_TITLE_COUNT, "unique normalized titles"], [BOOK_CATALOG_RECORD_COUNT, "archive cover records"]].map(([value, label], index) => (
              <div key={label} className={`p-5 md:p-7 ${index < 3 ? "md:border-r md:border-outline-variant" : ""} ${index % 2 === 0 ? "max-md:border-r max-md:border-outline-variant" : ""}`}><dt className="font-serif text-4xl font-bold text-on-surface md:text-6xl">{value}</dt><dd className="mt-3 text-xs leading-5 text-on-surface-variant">{label}</dd></div>
            ))}
          </dl>
          <p className="mt-7 max-w-4xl border-l-2 border-outline-variant pl-5 text-sm leading-7 text-on-surface-variant">Checked on {OFFICIAL_CATALOG_CHECKED_AT}, the <a href={OFFICIAL_CATALOG_SOURCE_URL} target="_blank" rel="external noopener noreferrer" className="font-bold text-primary underline underline-offset-4">current Orchard Series Books page</a> has a different scope from this older cover archive. The archive also preserves Beginner Reader, Early Reader, and reference editions; Graphic Novels reuse two existing fairy names with new-format covers.</p>
        </section>

        <BookChecklist groups={BOOK_CATALOG_GROUPS} />

        <section className="mt-16 grid gap-8 border-t border-on-surface pt-12 md:grid-cols-[minmax(0,1fr)_18rem] md:items-start">
          <div><p className="font-mono text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Print version</p><h2 className="mt-3 font-serif text-3xl font-bold text-on-surface md:text-5xl">The print version is designed, not captured</h2><p className="mt-5 max-w-2xl text-sm leading-7 text-on-surface-variant">Printing opens a clean checklist: navigation, ads, controls, and cover links are removed while every catalog section is expanded for paper.</p></div>
          <div className="rounded-3xl border border-outline-variant bg-white p-6 shadow-[0_18px_46px_rgba(49,30,84,0.08)]"><Printer aria-hidden className="h-6 w-6 text-primary" /><p className="mt-4 font-serif text-xl font-bold text-on-surface">324-title checklist</p><button type="button" onClick={() => window.print()} className="btn btn-primary mt-6 min-h-11 w-full">Open print preview</button></div>
        </section>

        <section className="mt-12 rounded-[1.75rem] border border-outline-variant bg-white p-6 md:p-8">
          <div className="flex gap-3"><CheckCircle2 aria-hidden className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><h2 className="text-xl font-black text-on-surface">A transparent fan-made checklist</h2><p className="mt-3 max-w-4xl text-sm leading-7 text-on-surface-variant">This is an independent fan-made reading aid, not an official bibliography. It does not invent publication dates: the current publisher catalog does not expose a consistent date for every card. Regional names, dates, formats, and covers can vary. No Amazon links are shown because this site does not currently have a verified Associate tag and per-title ASIN data.</p></div></div>
          <div className="mt-5 rounded-xl bg-surface-container-low p-4"><CoverSourceNote /></div>
        </section>
      </article>
    </FairySiteLayout>
  );
}

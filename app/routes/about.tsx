import type { Route } from "./+types/about";

import { Link } from "~/components/common";
import { FairySiteLayout } from "~/features/fairy-finder/fairy-site-layout";
import { createSeoDescriptors, createWebPageJsonLd } from "~/utils/meta";

export const meta: Route.MetaFunction = ({ matches }) => {
  const title = "About - Rainbow Magic Fairy Name Finder";
  const description = "Learn who operates this independent fan-made fairy name lookup, how matching works, and what the site is not affiliated with.";
  return [
    { title },
    { name: "description", content: description },
    ...createSeoDescriptors({
      pathname: "/about",
      domain: matches[0]?.data?.DOMAIN,
      title,
      description,
      jsonLd: createWebPageJsonLd({ pathname: "/about", domain: matches[0]?.data?.DOMAIN, title, description }),
    }),
  ];
};

export default function AboutPage() {
  return (
    <FairySiteLayout mainClassName="bg-surface-container-low px-5 py-12 md:py-20">
      <article className="mx-auto max-w-4xl rounded-[2rem] border border-outline-variant bg-white p-7 shadow-sm md:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">About this site</p>
        <h1 className="mt-4 text-4xl font-black text-on-surface md:text-5xl">An independent fan-made lookup</h1>
        <div className="mt-8 space-y-6 text-base leading-8 text-on-surface-variant">
          <p>Rainbow Magic Fairy Name Finder is a small, independently operated reference tool. It helps visitors compare a first name with a manually curated list of Rainbow Magic character titles.</p>
          <p>The matching rule is intentionally simple and verifiable: the site normalizes the submitted first name and returns an exact catalog match, or says that no match was found. It does not invent a random character when the name is absent.</p>
          <p>Book cover images are cached and served as versioned same-origin static assets so readers can see them immediately and identify the matching title. Each cover keeps a visible source link to <a href="https://orchardseriesbooks.co.uk/" target="_blank" rel="external nofollow noopener noreferrer" className="font-bold text-primary underline underline-offset-4">Orchard Series Books</a>. Artwork, character, book, and publishing rights remain with their respective owners.</p>
          <p>Source attribution is not presented as proof of a licence or endorsement. If a rights holder wants an image corrected or removed, the operator will review a substantiated request sent through the contact channel.</p>
          <p><strong>Independence notice:</strong> this website is not affiliated with, sponsored by, approved by, or endorsed by the Rainbow Magic publishers, authors, illustrators, or other rights holders. Rainbow Magic names and related properties belong to their respective owners.</p>
          <p>We correct factual errors and respond to rights-holder concerns. See the <Link to="/contact" className="font-bold text-primary underline underline-offset-4">contact page</Link> for the appropriate channel.</p>
        </div>
      </article>
    </FairySiteLayout>
  );
}

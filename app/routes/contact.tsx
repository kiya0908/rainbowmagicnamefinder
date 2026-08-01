import type { Route } from "./+types/contact";

import { SITE_SUPPORT_EMAIL, SITE_SUPPORT_MAILTO } from "~/config/site";
import { FairySiteLayout } from "~/features/fairy-finder/fairy-site-layout";
import { createSeoDescriptors, createWebPageJsonLd } from "~/utils/meta";

export const meta: Route.MetaFunction = ({ matches }) => {
  const title = "Contact - Rainbow Magic Fairy Name Finder";
  const description = "Contact the independent operator of Rainbow Magic Fairy Name Finder for support, corrections, privacy, or rights-holder requests.";
  return [
    { title },
    { name: "description", content: description },
    ...createSeoDescriptors({
      pathname: "/contact",
      domain: matches[0]?.data?.DOMAIN,
      title,
      description,
      jsonLd: createWebPageJsonLd({ pathname: "/contact", domain: matches[0]?.data?.DOMAIN, title, description }),
    }),
  ];
};

export default function ContactPage() {
  return (
    <FairySiteLayout mainClassName="bg-surface-container-low px-5 py-12 md:py-20">
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-outline-variant bg-white p-7 shadow-sm md:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Contact</p>
        <h1 className="mt-4 text-4xl font-black text-on-surface md:text-5xl">Tell us what needs attention</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-on-surface-variant">Use this address for site support, catalog corrections, privacy requests, accessibility feedback, or intellectual-property and rights-holder notices.</p>
        <a href={SITE_SUPPORT_MAILTO} className="mt-8 inline-flex min-h-12 max-w-full items-center break-all rounded-xl bg-primary px-4 text-center font-extrabold text-on-primary shadow-sm transition hover:bg-primary-container focus:outline-none focus:ring-4 focus:ring-primary/25 sm:px-6">
          {SITE_SUPPORT_EMAIL}
        </a>
        <div className="mt-8 rounded-2xl bg-surface-container-low p-5 text-sm leading-7 text-on-surface-variant">
          <p className="font-bold text-on-surface">For rights-holder requests, please include:</p>
          <p className="mt-2">the page URL, the material concerned, your relationship to the relevant rights, and a reliable reply address. We will review substantiated notices and can correct or remove material where appropriate.</p>
        </div>
      </section>
    </FairySiteLayout>
  );
}

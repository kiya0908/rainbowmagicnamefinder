import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { CoverMarquee } from "./components/cover-marquee";
import { GenerateAgainButton } from "./components/generate-again-button";
import { InputSection, type InputSectionHandle } from "./components/input-section";
import { ResultCard } from "./components/result-card";
import { FAIRY_LIST } from "./data/fairies";
import { ShareActions } from "./components/share-actions";
import type { FairyData } from "./data/types";
import { FairySiteLayout } from "./fairy-site-layout";
import { getFairyFinderHomeCopy } from "./i18n";
import { matchFairy } from "./utils/match";
import { Link } from "~/components/common";

const SUGGESTED_NAMES = ["Lily", "Ruby", "Amber", "Saffron"] as const;

export default function FairyFinderLandingPage() {
  const copy = getFairyFinderHomeCopy("en");
  const [result, setResult] = useState<FairyData | null>(null);
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [lookupSequence, setLookupSequence] = useState(0);
  const [inputRenderKey, setInputRenderKey] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const inputZoneRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<InputSectionHandle | null>(null);
  const resultPanelRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = (name: string) => {
    setSubmittedName(name);
    setHasSubmitted(true);
    setResult(matchFairy(name));
    setLookupSequence((previous) => previous + 1);
  };

  const trySuggestedName = (name: string, shouldSubmit = true) => {
    if (shouldSubmit) {
      inputRef.current?.submitName(name);
      return;
    }

    inputRef.current?.setName(name);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (!hasSubmitted) return;

    const scrollTimer = window.setTimeout(() => {
      const resultPanel = resultPanelRef.current;
      if (!resultPanel) return;

      const rect = resultPanel.getBoundingClientRect();
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;
      const preferredTop = Math.min(120, Math.max(72, viewportHeight * 0.14));
      const isTooLow = rect.top > viewportHeight * 0.55;
      const isTooHigh = rect.top < 16;

      if (!isTooLow && !isTooHigh) return;

      window.scrollBy({
        top: rect.top - preferredTop,
        behavior: "smooth",
      });
    }, 80);

    return () => {
      window.clearTimeout(scrollTimer);
    };
  }, [hasSubmitted, lookupSequence]);

  const handleGenerateAgain = () => {
    setResult(null);
    setSubmittedName(null);
    setHasSubmitted(false);
    setInputRenderKey((previous) => previous + 1);

    window.setTimeout(() => {
      const nextInput =
        inputZoneRef.current?.querySelector<HTMLInputElement>("input[type='text']") ??
        null;

      if (!nextInput) return;
      nextInput.scrollIntoView({ behavior: "smooth", block: "center" });
      nextInput.focus();
    }, 320);
  };

  const scrollToInput = () => {
    const target = inputZoneRef.current;
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 280);
  };

  return (
    <FairySiteLayout>
      <section className="bg-surface px-5 pb-20 pt-10 md:px-6 md:pb-28 md:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 hidden rounded-full bg-secondary-fixed px-4 py-1.5 text-xs font-bold tracking-widest text-primary md:inline-flex"
          >
            {copy.hero.eyebrow}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="mb-4 text-3xl font-extrabold leading-tight text-on-surface md:mb-6 md:text-6xl"
          >
            {copy.hero.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="mx-auto mb-8 hidden max-w-2xl text-lg text-on-surface-variant md:block"
          >
            {copy.hero.subtitle}
          </motion.p>

          <motion.div
            ref={inputZoneRef}
            id="fairy-input-zone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
          >
            <InputSection
              key={inputRenderKey}
              ref={inputRef}
              label={copy.hero.inputLabel}
              placeholder={copy.hero.inputPlaceholder}
              submitLabel={copy.hero.submitLabel}
              onSubmit={handleSubmit}
            />

            {!hasSubmitted ? (
              <p className="mx-auto mt-3 max-w-xl text-left text-sm text-on-surface-variant">
                Enter a first name to find your Rainbow Magic fairy.
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-on-surface-variant">
              <span>Try:</span>
              {SUGGESTED_NAMES.map((name, index) => (
                <span key={name} className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    className="font-bold text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-4 focus:ring-primary/15"
                    onClick={() => trySuggestedName(name)}
                  >
                    {name}
                  </button>
                  {index < SUGGESTED_NAMES.length - 1 ? (
                    <span aria-hidden="true">·</span>
                  ) : null}
                </span>
              ))}
            </div>

            <Link
              to="/fairy-names"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-primary/20 bg-white px-5 text-sm font-extrabold text-primary shadow-sm transition hover:border-primary/40 hover:bg-secondary-fixed/30 focus:outline-none focus:ring-4 focus:ring-primary/15"
            >
              Browse All {FAIRY_LIST.length} Fairy Names
            </Link>

            <AnimatePresence initial={false} mode="popLayout">
              {hasSubmitted ? (
                <motion.div
                  key={`lookup-${lookupSequence}`}
                  ref={resultPanelRef}
                  id="result"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  role="region"
                  aria-live="polite"
                  aria-label="Fairy lookup result"
                  className="mx-auto mt-6 w-full max-w-4xl scroll-mt-6"
                >
                  {result ? (
                    <ResultCard
                      fairy={result}
                      actions={
                        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                          <GenerateAgainButton
                            onGenerateAgain={handleGenerateAgain}
                            focusTargetRef={inputZoneRef}
                          />
                          <Link
                            to="/fairy-names"
                            className="inline-flex h-11 min-w-40 items-center justify-center rounded-xl bg-primary px-5 text-sm font-extrabold text-on-primary shadow-[0_14px_30px_rgba(139,92,246,0.28)] transition hover:bg-primary-container focus:outline-none focus:ring-4 focus:ring-primary/25"
                          >
                            Browse All Fairy Names
                          </Link>
                          <ShareActions
                            title={`${result.fullTitle} | ${copy.hero.title}`}
                            text={`I got ${result.fullTitle}. What is your fairy name?`}
                          />
                        </div>
                      }
                    />
                  ) : (
                    <motion.section
                      initial={{ opacity: 0, scale: 0.96, y: 16 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-white/85 via-secondary-fixed/40 to-white/70 p-6 text-center shadow-[0_30px_80px_rgba(92,57,173,0.25)] backdrop-blur-xl md:p-8"
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -top-16 right-0 h-44 w-44 rounded-full bg-primary/15 blur-2xl"
                      />
                      <div className="relative space-y-4">
                        <h3 className="text-2xl font-extrabold text-on-surface md:text-3xl">
                          No exact match found.
                        </h3>
                        <p className="text-sm text-on-surface-variant md:text-base">
                          Try another spelling, or test one of these:
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {SUGGESTED_NAMES.map((name) => (
                            <button
                              key={name}
                              type="button"
                              className="rounded-full border border-primary/15 bg-white px-3 py-1.5 text-sm font-bold text-primary transition hover:border-primary/35 hover:bg-secondary-fixed/30 focus:outline-none focus:ring-4 focus:ring-primary/15"
                              onClick={() => trySuggestedName(name)}
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                        <div className="pt-2">
                          <Link
                            to="/fairy-names"
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-extrabold text-on-primary shadow-[0_14px_30px_rgba(139,92,246,0.28)] transition hover:bg-primary-container focus:outline-none focus:ring-4 focus:ring-primary/25"
                          >
                            Browse All Fairy Names
                          </Link>
                        </div>
                      </div>
                    </motion.section>
                  )}

                  <p className="mt-6 text-center text-sm text-on-surface-variant/80">
                    Want to create your own fairy? Coming soon!
                  </p>
                  {submittedName && result ? (
                    <p className="mt-2 text-center text-xs text-on-surface-variant/70">
                      Matched from name: {submittedName}
                    </p>
                  ) : submittedName ? (
                    <p className="mt-2 text-center text-xs text-on-surface-variant/70">
                      Searched name: {submittedName}
                    </p>
                  ) : null}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="mx-auto mt-12 max-w-5xl md:mt-10"
          >
            <CoverMarquee />
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="bg-surface px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              {copy.howItWorks.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-bold text-on-surface md:text-4xl">
              {copy.howItWorks.title}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-outline-variant bg-white p-7 shadow-sm md:p-8">
              <div className="space-y-5 text-base leading-8 text-on-surface-variant">
                {copy.howItWorks.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-secondary-fixed/60 via-white to-primary/5 p-7 shadow-sm md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                {copy.howItWorks.spotlight.label}
              </p>
              <h3 className="mt-3 text-2xl font-bold text-on-surface">
                {copy.howItWorks.spotlight.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-on-surface-variant md:text-base">
                {copy.howItWorks.spotlight.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {copy.howItWorks.spotlight.examples.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-primary/15 bg-white/80 px-3 py-1.5 text-xs font-semibold text-primary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-outline-variant bg-surface-container-low/60 p-6 md:p-8">
            <h3 className="text-2xl font-bold text-on-surface">
              {copy.howItWorks.methodsTitle}
            </h3>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {copy.howItWorks.methods.map((method) => (
                <article
                  key={method.title}
                  className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                    {method.label}
                  </p>
                  <h4 className="mt-3 text-lg font-bold text-on-surface">
                    {method.title}
                  </h4>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                    {method.description}
                  </p>
                  <p className="mt-4 rounded-2xl bg-secondary-fixed/55 px-4 py-3 text-sm leading-6 text-on-surface">
                    {method.example}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.88fr]">
            <div className="rounded-3xl border border-outline-variant bg-white p-7 shadow-sm md:p-8">
              <h3 className="text-2xl font-bold text-on-surface">
                {copy.howItWorks.profile.title}
              </h3>
              <div className="mt-5 space-y-4 text-base leading-8 text-on-surface-variant">
                {copy.howItWorks.profile.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-outline-variant bg-white p-7 shadow-sm md:p-8">
              <h3 className="text-2xl font-bold text-on-surface">
                {copy.howItWorks.highlightsTitle}
              </h3>
              <ul className="mt-5 space-y-4">
                {copy.howItWorks.highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-2xl bg-surface-container-low px-4 py-4"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary"
                    />
                    <span className="text-sm leading-7 text-on-surface-variant">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="what-is" className="bg-surface-container-low px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              {copy.whatIs.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-bold text-on-surface md:text-4xl">
              {copy.whatIs.title}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <article className="rounded-3xl border border-outline-variant bg-white p-7 shadow-sm md:p-8">
              <div className="space-y-6">
                {copy.whatIs.paragraphs.map((paragraph, index) => (
                  <p
                    key={paragraph}
                    className={
                      index === 0
                        ? "text-base leading-8 text-on-surface md:text-lg"
                        : "text-base leading-8 text-on-surface-variant"
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>

            <aside className="space-y-4">
              {copy.whatIs.highlights.map((item) => (
                <article
                  key={item.title}
                  className="rounded-3xl border border-primary/15 bg-gradient-to-br from-secondary-fixed/60 via-white to-primary/5 p-6 shadow-sm"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                    {item.label}
                  </p>
                  <h3 className="mt-3 text-xl font-bold text-on-surface">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                    {item.description}
                  </p>
                </article>
              ))}
            </aside>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-surface px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-on-surface md:text-4xl">
              {copy.faq.title}
            </h2>
            <p className="mt-4 text-sm leading-7 text-on-surface-variant md:text-base">
              Short answers to the questions users ask most often.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {copy.faq.items.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={item.question}
                  className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm"
                >
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-4 bg-gradient-to-r from-white to-secondary-fixed/20 px-5 py-4 text-left"
                    onClick={() =>
                      setOpenFaqIndex((previous) =>
                        previous === index ? null : index
                      )
                    }
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-1 text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      <span className="font-semibold leading-6 text-on-surface">
                        {item.question}
                      </span>
                    </div>
                    <span className="text-xl leading-none text-primary">
                      {isOpen ? "-" : "+"}
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                    aria-hidden={!isOpen}
                  >
                    <p className="px-5 pb-5 text-sm leading-7 text-on-surface-variant md:text-base">
                      {item.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="bg-surface-container-low px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-outline-variant bg-white p-8 text-center shadow-sm md:p-12">
          <h2 className="text-2xl font-bold text-on-surface md:text-3xl">
            {copy.cta.title}
          </h2>
          <button
            type="button"
            className="btn btn-primary mt-6 h-11 rounded-xl px-8"
            onClick={scrollToInput}
          >
            {copy.cta.buttonLabel}
          </button>
        </div>
      </section>
    </FairySiteLayout>
  );
}

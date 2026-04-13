import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { CoverMarquee } from "./components/cover-marquee";
import { GenerateAgainButton } from "./components/generate-again-button";
import { InputSection } from "./components/input-section";
import { ResultCard } from "./components/result-card";
import { ShareActions } from "./components/share-actions";
import type { FairyData } from "./data/types";
import { FairySiteLayout } from "./fairy-site-layout";
import { getFairyFinderHomeCopy } from "./i18n";
import { matchFairy } from "./utils/match";

export default function FairyFinderLandingPage() {
  const copy = getFairyFinderHomeCopy("en");
  const [result, setResult] = useState<FairyData | null>(null);
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [inputRenderKey, setInputRenderKey] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const inputZoneRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resultSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    inputRef.current =
      inputZoneRef.current?.querySelector<HTMLInputElement>("input[type='text']") ??
      null;
  }, [inputRenderKey]);

  const handleSubmit = (name: string) => {
    setSubmittedName(name);
    setHasSubmitted(true);
    setResult(matchFairy(name));
  };

  useEffect(() => {
    if (!hasSubmitted) return;
    resultSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [hasSubmitted, result]);

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
      <section className="bg-surface px-6 pb-24 pt-20 md:pb-28 md:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 inline-flex rounded-full bg-secondary-fixed px-4 py-1.5 text-xs font-bold tracking-widest text-primary"
          >
            {copy.hero.eyebrow}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="mb-6 text-4xl font-extrabold leading-tight text-on-surface md:text-6xl"
          >
            {copy.hero.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="mx-auto mb-10 max-w-2xl text-lg text-on-surface-variant"
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
              label={copy.hero.inputLabel}
              placeholder={copy.hero.inputPlaceholder}
              submitLabel={copy.hero.submitLabel}
              onSubmit={handleSubmit}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="mx-auto mt-10 max-w-5xl"
          >
            <CoverMarquee />
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {hasSubmitted ? (
          <motion.section
            ref={resultSectionRef}
            id="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-surface-container-low px-6 pb-20"
          >
            <div className="mx-auto max-w-4xl">
              {result ? (
                <ResultCard
                  fairy={result}
                  actions={
                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                      <ShareActions
                        title={`${result.fullTitle} | ${copy.hero.title}`}
                        text={`I got ${result.fullTitle}. What is your fairy name?`}
                      />
                      <GenerateAgainButton
                        onGenerateAgain={handleGenerateAgain}
                        focusTargetRef={inputZoneRef}
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
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                      No exact fairy match found
                    </p>
                    <h3 className="text-2xl font-extrabold text-on-surface md:text-3xl">
                      {submittedName ? `No match for "${submittedName}"` : "No match found"}
                    </h3>
                    <p className="text-sm text-on-surface-variant md:text-base">
                      Try entering an exact fairy first name from the Rainbow Magic list.
                    </p>
                    <div className="pt-2">
                      <GenerateAgainButton
                        onGenerateAgain={handleGenerateAgain}
                        focusTargetRef={inputZoneRef}
                      />
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
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

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

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        key={`faq-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm leading-7 text-on-surface-variant md:text-base">
                          {item.answer}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
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

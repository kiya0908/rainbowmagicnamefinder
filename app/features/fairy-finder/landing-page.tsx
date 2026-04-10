import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-on-surface md:text-4xl">
            {copy.howItWorks.title}
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {copy.howItWorks.steps.map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-outline-variant bg-white p-6 text-left shadow-sm"
              >
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">
                  Step {index + 1}
                </p>
                <p className="text-base font-semibold text-on-surface">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="what-is" className="bg-surface-container-low px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-on-surface md:text-4xl">
            {copy.whatIs.title}
          </h2>

          <div className="mx-auto mt-8 max-w-3xl space-y-4 text-base leading-relaxed text-on-surface-variant">
            {copy.whatIs.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-on-surface">300+ Unique Fairies</h3>
              <p className="mt-2 text-sm text-on-surface-variant">
                A broad fairy list gives each match a different flavor and identity.
              </p>
            </div>
            <div className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-on-surface">Instant Match</h3>
              <p className="mt-2 text-sm text-on-surface-variant">
                Enter your name and get the result immediately with deterministic logic.
              </p>
            </div>
            <div className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-on-surface">Share & Compare</h3>
              <p className="mt-2 text-sm text-on-surface-variant">
                Share your fairy identity and compare your result with friends.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-surface px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold text-on-surface md:text-4xl">
            {copy.faq.title}
          </h2>

          <div className="mt-8 space-y-3">
            {copy.faq.items.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={item.question}
                  className="rounded-2xl border border-outline-variant bg-white"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    onClick={() =>
                      setOpenFaqIndex((previous) =>
                        previous === index ? null : index
                      )
                    }
                  >
                    <span className="font-semibold text-on-surface">{item.question}</span>
                    <span className="text-xl leading-none text-primary">
                      {isOpen ? "−" : "+"}
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
                        <p className="px-5 pb-5 text-sm text-on-surface-variant">
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

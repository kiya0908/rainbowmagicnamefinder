import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type { FairyData } from "../data/types";
import { hashString } from "../utils/match";
import { getFairyImageSrc } from "../utils/image";
import { FairyImage } from "./fairy-image";

const EMOTIONAL_LINES = [
  "This is literally you",
  "Why does this match you so well?",
  "Is this your fairy twin?",
  "You've found your fairy identity!",
  "This fairy was made for you",
] as const;

interface ResultCardProps {
  fairy: FairyData;
  actions?: React.ReactNode;
}

const getEmotionalLine = (fairy: FairyData) => {
  const seed = `${fairy.fullTitle}-${fairy.id}`;
  const index = hashString(seed) % EMOTIONAL_LINES.length;
  return EMOTIONAL_LINES[index];
};

export const ResultCard = ({ fairy, actions }: ResultCardProps) => {
  const emotionalLine = getEmotionalLine(fairy);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!isPreviewOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPreviewOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPreviewOpen]);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-white/85 via-secondary-fixed/40 to-white/70 p-6 shadow-[0_30px_80px_rgba(92,57,173,0.25)] backdrop-blur-xl md:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 right-0 h-44 w-44 rounded-full bg-primary/15 blur-2xl"
        />

        <div className="relative space-y-6 text-center">
          <FairyImage
            imageUrl={fairy.imageUrl}
            fairyName={fairy.fullTitle}
            onOpenPreview={() => setIsPreviewOpen(true)}
          />

          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {emotionalLine}
          </p>

          <h3 className="text-2xl font-extrabold text-on-surface md:text-3xl">
            {fairy.fullTitle}
          </h3>

          <p className="text-sm text-on-surface-variant md:text-base">
            Does she look like you?
          </p>

          <div className="pt-2">
            {actions ?? (
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled
                  className="btn h-11 min-w-36 rounded-xl border border-outline-variant bg-white/80 text-on-surface-variant"
                >
                  Share
                </button>
                <button
                  type="button"
                  disabled
                  className="btn h-11 min-w-36 rounded-xl border border-outline-variant bg-white/80 text-on-surface-variant"
                >
                  Try Another Name
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {isPreviewOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-on-surface/70 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fairy-preview-title"
          onClick={() => setIsPreviewOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative max-h-full w-full max-w-4xl overflow-auto rounded-3xl bg-white p-4 shadow-[0_30px_90px_rgba(0,0,0,0.35)] md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-on-surface shadow-sm transition hover:bg-surface-container-low focus:outline-none focus:ring-4 focus:ring-primary/25"
              onClick={() => setIsPreviewOpen(false)}
              aria-label="Close cover preview"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(280px,0.7fr)] md:items-center">
              <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-surface-container-low">
                <img
                  src={getFairyImageSrc(fairy.imageUrl)}
                  alt={fairy.fullTitle}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="text-center md:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                  Cover Preview
                </p>
                <h3
                  id="fairy-preview-title"
                  className="mt-3 text-2xl font-extrabold text-on-surface md:text-3xl"
                >
                  {fairy.fullTitle}
                </h3>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                  Does this cover match your fairy identity?
                </p>

                <div className="mt-6 flex flex-col items-center gap-3 md:items-start">
                  {actions}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </>
  );
};

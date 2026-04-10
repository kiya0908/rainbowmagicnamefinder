import { motion } from "motion/react";

import type { FairyData } from "../data/types";
import { hashString } from "../utils/match";
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

  return (
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
        <FairyImage imageUrl={fairy.imageUrl} fairyName={fairy.fullTitle} />

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
  );
};

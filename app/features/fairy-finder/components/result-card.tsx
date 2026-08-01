import type { FairyData } from "../data/types";
import { hashString } from "../utils/match";
import { CoverSourceNote, FairyCover } from "./fairy-image";

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

export const ResultCard = ({ fairy, actions }: ResultCardProps) => {
  const emotionalLine = EMOTIONAL_LINES[hashString(`${fairy.fullTitle}-${fairy.id}`) % EMOTIONAL_LINES.length];

  return (
    <section className="relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-white/85 via-secondary-fixed/40 to-white/70 p-6 shadow-[0_30px_80px_rgba(92,57,173,0.25)] backdrop-blur-xl md:p-8">
      <div aria-hidden className="pointer-events-none absolute -top-16 right-0 h-44 w-44 rounded-full bg-primary/15 blur-2xl" />
      <div className="relative space-y-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Your Fairy Match</p>
        <h3 className="text-2xl font-extrabold text-on-surface md:text-3xl">{fairy.fullTitle}</h3>
        <FairyCover imageUrl={fairy.imageUrl} fairyName={fairy.fullTitle} className="mx-auto max-w-[220px] md:max-w-[280px]" eager />
        <CoverSourceNote imageUrl={fairy.imageUrl} />
        <p className="text-sm text-on-surface-variant md:text-base">{emotionalLine}</p>
        <div className="pt-2">{actions}</div>
      </div>
    </section>
  );
};

import type { FairyData } from "../data/types";
import { FairyCover } from "./fairy-image";

interface FairyCoverFeatureProps {
  ariaLabel: string;
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  fairies: readonly (FairyData | undefined)[];
}

export function FairyCoverFeature({
  ariaLabel,
  eyebrow,
  title,
  fairies,
}: FairyCoverFeatureProps) {
  return (
    <aside
      className="relative min-h-[25rem] overflow-hidden rounded-[1.75rem] border border-outline-variant bg-surface-container-low p-7 shadow-[0_24px_64px_rgba(49,30,84,0.11)]"
      aria-label={ariaLabel}
    >
      <p className="relative z-20 font-mono text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">
        {eyebrow}
      </p>
      <p className="relative z-20 mt-4 max-w-[13ch] font-serif text-3xl font-bold leading-tight text-on-surface">
        {title}
      </p>

      <div className="absolute inset-x-5 bottom-7 flex items-end justify-center -space-x-12">
        {fairies.map((fairy, index) =>
          fairy ? (
            <FairyCover
              key={fairy.id}
              imageUrl={fairy.imageUrl}
              fairyName={fairy.fullTitle}
              eager
              className={`w-28 border-4 border-white shadow-xl ${
                index === 1
                  ? "z-10 w-36 -translate-y-3"
                  : index === 0
                    ? "-rotate-6"
                    : "rotate-6"
              }`}
            />
          ) : null
        )}
      </div>
    </aside>
  );
}

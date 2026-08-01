import clsx from "clsx";
import { Sparkles } from "lucide-react";
import { useState } from "react";

import { hashString } from "../utils/match";
import { getFairyCoverAssetPath } from "../utils/cover-assets";

const ARTWORK_THEMES = [
  "from-rose-100 via-amber-50 to-violet-200",
  "from-sky-100 via-white to-fuchsia-200",
  "from-emerald-100 via-lime-50 to-cyan-200",
  "from-violet-100 via-pink-50 to-orange-100",
  "from-indigo-100 via-sky-50 to-rose-200",
] as const;

interface FairyArtworkProps {
  fairyName: string;
  compact?: boolean;
  className?: string;
}

interface FairyCoverProps extends FairyArtworkProps {
  imageUrl: string;
  eager?: boolean;
}

export const FairyArtwork = ({
  fairyName,
  compact = false,
  className,
}: FairyArtworkProps) => {
  const theme = ARTWORK_THEMES[hashString(fairyName) % ARTWORK_THEMES.length];
  const initial = fairyName.trim().charAt(0).toUpperCase() || "F";

  return (
    <div
      role="img"
      aria-label={`Fan-made identity artwork for ${fairyName}`}
      className={clsx(
        "relative isolate flex aspect-[3/4] w-full overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br shadow-[0_18px_45px_rgba(80,50,140,0.18)]",
        theme,
        className
      )}
    >
      <div aria-hidden className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-[18px] border-white/40" />
      <div aria-hidden className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/45 blur-sm" />
      <Sparkles aria-hidden className={clsx("absolute text-primary/55", compact ? "right-2 top-2 h-4 w-4" : "right-4 top-4 h-7 w-7")} />

      <div className="relative m-auto flex max-w-[88%] flex-col items-center text-center">
        <span className={clsx("font-black leading-none text-primary/80 drop-shadow-sm", compact ? "text-3xl" : "text-7xl md:text-8xl")}>
          {initial}
        </span>
        {!compact ? (
          <>
            <span className="mt-4 line-clamp-3 text-sm font-extrabold leading-6 text-on-surface md:text-base">
              {fairyName}
            </span>
            <span className="mt-4 rounded-full border border-primary/15 bg-white/75 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              Fan-made identity card
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
};

export const FairyCover = ({
  imageUrl,
  fairyName,
  compact = false,
  className,
  eager = false,
}: FairyCoverProps) => {
  const [hasError, setHasError] = useState(false);
  const coverAssetPath = getFairyCoverAssetPath(imageUrl);

  if (hasError || !coverAssetPath) {
    return <FairyArtwork fairyName={fairyName} compact={compact} className={className} />;
  }

  return (
    <div className={clsx("relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-white/70 bg-surface-container-low shadow-[0_18px_45px_rgba(80,50,140,0.18)]", className)}>
      <img
        src={coverAssetPath}
        alt={`${fairyName} book cover`}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onError={() => setHasError(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
};

export const CoverSourceNote = ({ imageUrl }: { imageUrl?: string }) => (
  <p className="text-xs leading-5 text-on-surface-variant">
    Cover image source: {" "}
    <a
      href={imageUrl ?? "https://orchardseriesbooks.co.uk/"}
      target="_blank"
      rel="external nofollow noopener noreferrer"
      className="font-bold text-primary underline underline-offset-4"
    >
      Orchard Series Books
    </a>
    . Used for book identification; artwork and publishing rights remain with their respective owners.
  </p>
);

import { useState } from "react";
import { ZoomIn } from "lucide-react";

import { getFairyImageSrc } from "../utils/image";

interface FairyImageProps {
  imageUrl: string;
  fairyName: string;
  onOpenPreview?: () => void;
}

export const FairyImage = ({
  imageUrl,
  fairyName,
  onOpenPreview,
}: FairyImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <button
      type="button"
      className="group relative mx-auto aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-2xl border border-white/40 bg-surface-container-low text-left shadow-[0_20px_50px_rgba(80,50,140,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_58px_rgba(80,50,140,0.3)] focus:outline-none focus:ring-4 focus:ring-primary/25"
      onClick={onOpenPreview}
      aria-label={`Open larger cover preview for ${fairyName}`}
    >
      {isLoading ? (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/70 via-secondary-fixed/60 to-white/50" />
      ) : null}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-secondary-fixed/80 via-white/80 to-surface-container-low text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Cover
          </span>
          <p className="px-4 text-sm font-semibold text-on-surface">
            {fairyName}
          </p>
        </div>
      ) : (
        <img
          src={getFairyImageSrc(imageUrl)}
          alt={fairyName}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className="h-full w-full object-cover"
        />
      )}

      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-primary opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
        <ZoomIn className="h-3.5 w-3.5" />
        View
      </span>
    </button>
  );
};

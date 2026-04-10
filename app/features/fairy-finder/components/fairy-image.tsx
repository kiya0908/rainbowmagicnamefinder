import { useState } from "react";

interface FairyImageProps {
  imageUrl: string;
  fairyName: string;
}

export const FairyImage = ({ imageUrl, fairyName }: FairyImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-2xl border border-white/40 bg-surface-container-low shadow-[0_20px_50px_rgba(80,50,140,0.22)]">
      {isLoading ? (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/70 via-secondary-fixed/60 to-white/50" />
      ) : null}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-secondary-fixed/80 via-white/80 to-surface-container-low text-center">
          <span className="text-4xl">✨</span>
          <p className="px-4 text-sm font-semibold text-on-surface">{fairyName}</p>
        </div>
      ) : (
        <img
          src={imageUrl}
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
    </div>
  );
};

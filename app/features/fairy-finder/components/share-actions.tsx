import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Share2 } from "lucide-react";

interface ShareActionsProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

const COPIED_FEEDBACK_TIMEOUT_MS = 2000;

export const ShareActions = ({
  title,
  text,
  url,
  className,
}: ShareActionsProps) => {
  const [canUseWebShare, setCanUseWebShare] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle"
  );
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setCanUseWebShare(typeof navigator !== "undefined" && !!navigator.share);
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const shareUrl = useMemo(() => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  }, [url]);

  const handleWebShare = async () => {
    if (!canUseWebShare) return;

    try {
      await navigator.share({
        title,
        text,
        url: shareUrl,
      });
    } catch {
      // User canceled share panel or runtime blocked sharing; no hard error UI needed.
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setCopyStatus("idle");
    }, COPIED_FEEDBACK_TIMEOUT_MS);
  };

  return (
    <div className={className}>
      {canUseWebShare ? (
        <button
          type="button"
          className="btn btn-primary inline-flex h-11 min-w-36 items-center justify-center gap-2 rounded-xl px-5 leading-none"
          onClick={() => {
            void handleWebShare();
          }}
        >
          <Share2 className="h-4 w-4 shrink-0" />
          <span className="leading-none">Share</span>
        </button>
      ) : (
        <button
          type="button"
          className="btn inline-flex h-11 min-w-36 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-white text-on-surface hover:border-primary/30 leading-none"
          onClick={() => {
            void handleCopyLink();
          }}
        >
          <Copy className="h-4 w-4 shrink-0" />
          <span className="leading-none">
            {copyStatus === "copied" ? "Copied!" : "Copy Link"}
          </span>
        </button>
      )}

      {copyStatus === "error" ? (
        <p className="mt-2 text-center text-xs text-red-600">
          Copy failed. Please try again.
        </p>
      ) : null}
    </div>
  );
};

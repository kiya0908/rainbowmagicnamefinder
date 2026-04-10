interface GenerateAgainButtonProps {
  onGenerateAgain: () => void;
  focusTargetId?: string;
  focusTargetRef?: React.RefObject<HTMLElement | null>;
  label?: string;
  className?: string;
}

const FOCUS_DELAY_MS = 280;

export const GenerateAgainButton = ({
  onGenerateAgain,
  focusTargetId,
  focusTargetRef,
  label = "Try Another Name",
  className,
}: GenerateAgainButtonProps) => {
  const handleClick = () => {
    onGenerateAgain();

    const targetElement =
      focusTargetRef?.current ??
      (focusTargetId
        ? (document.getElementById(focusTargetId) as HTMLElement | null)
        : null);

    if (!targetElement) return;

    targetElement.scrollIntoView({ behavior: "smooth", block: "center" });

    window.setTimeout(() => {
      targetElement.focus();
    }, FOCUS_DELAY_MS);
  };

  return (
    <button
      type="button"
      className={`btn inline-flex h-11 min-w-40 items-center justify-center rounded-xl border border-outline-variant bg-white text-on-surface hover:border-primary/30 leading-none ${className ?? ""}`.trim()}
      onClick={handleClick}
    >
      <span className="leading-none">{label}</span>
    </button>
  );
};

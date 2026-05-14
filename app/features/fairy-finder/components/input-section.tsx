import { useEffect, useRef, useState } from "react";

interface InputSectionProps {
  label: string;
  placeholder: string;
  submitLabel: string;
  onSubmit: (name: string) => void;
}

export const InputSection = ({
  label,
  placeholder,
  submitLabel,
  onSubmit,
}: InputSectionProps) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (submittingTimerRef.current !== null) {
        window.clearTimeout(submittingTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = name.trim();
    if (!value) {
      setError("Please enter your name first.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    onSubmit(value);

    if (submittingTimerRef.current !== null) {
      window.clearTimeout(submittingTimerRef.current);
    }

    submittingTimerRef.current = window.setTimeout(() => {
      setIsSubmitting(false);
      submittingTimerRef.current = null;
    }, 360);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-xl rounded-2xl border border-outline-variant bg-surface-container-lowest/90 p-4 shadow-sm md:p-5"
    >
      <label className="mb-2 block text-left text-sm font-semibold text-on-surface">
        {label}
      </label>
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (error) setError("");
          }}
          placeholder={placeholder}
          className="h-12 flex-1 rounded-xl border border-outline-variant bg-white px-4 text-base text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 min-w-40 items-center justify-center rounded-xl bg-primary px-6 text-sm font-extrabold text-on-primary shadow-[0_14px_30px_rgba(139,92,246,0.35)] transition hover:bg-primary-container hover:shadow-[0_18px_34px_rgba(124,58,237,0.38)] focus:outline-none focus:ring-4 focus:ring-primary/25 active:translate-y-px disabled:cursor-wait disabled:opacity-80 max-md:w-full"
        >
          {isSubmitting ? "Finding..." : submitLabel}
        </button>
      </div>
      <p className="mt-2 min-h-5 text-left text-xs text-red-600">{error}</p>
      <p className="sr-only" aria-live="polite">
        {isSubmitting ? "Finding your fairy result." : ""}
      </p>
    </form>
  );
};

import { useState } from "react";

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = name.trim();
    if (!value) {
      setError("Please enter your name first.");
      return;
    }

    setError("");
    onSubmit(value);
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
          className="h-12 flex-1 rounded-xl border border-outline-variant bg-white px-4 text-base text-on-surface outline-none transition focus:border-primary"
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary h-12 rounded-xl px-6">
          {submitLabel}
        </button>
      </div>
      <p className="mt-2 min-h-5 text-left text-xs text-red-600">{error}</p>
    </form>
  );
};

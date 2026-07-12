'use client';

/** A two-or-more-way toggle styled like the main view tabs. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  ariaLabel?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex gap-1 rounded-xl bg-paper-sunken p-[4px]"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className={`cursor-pointer rounded-[9px] px-3.5 py-1.5 text-[13px] font-extrabold
            transition-colors ${
        option.value === value
          ? 'bg-foreground text-background'
          : 'text-foreground hover:bg-card/60'
        }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

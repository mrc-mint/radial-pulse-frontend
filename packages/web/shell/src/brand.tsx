/**
 * Radial Pulse brand mark: concentric pulse rings. Colours come from tokens
 * through CSS custom properties, so the mark follows the theme.
 */
export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="rp-brand__mark"
    >
      <circle cx="16" cy="16" r="14" className="rp-brand__ring-outer" strokeWidth="3" />
      <path
        d="M16 2a14 14 0 0 1 14 14"
        className="rp-brand__arc"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="8" className="rp-brand__ring-inner" strokeWidth="3" />
      <circle cx="16" cy="16" r="3" className="rp-brand__core" />
    </svg>
  );
}

export function Brand({ tagline = true }: { tagline?: boolean }) {
  return (
    <span className="rp-brand">
      <BrandMark />
      <span className="rp-brand__text">
        <span className="rp-brand__name">Radial Pulse</span>
        {tagline && <span className="rp-brand__tagline">Grow Clinics. Greater Impact.</span>}
      </span>
    </span>
  );
}

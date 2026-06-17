"use client";

/**
 * A lotus that "blooms" — petals trace in sequence, then fade and re-bloom.
 * The whole flower drifts in a slow rotation, like a tanpura's drone breathing.
 */
export default function RaagLoader({
  size = 28,
  label,
}: {
  size?: number;
  label?: string;
}) {
  return (
    <span
      className="raag-loader inline-flex items-center gap-3"
      role="status"
      aria-label={label ?? "Loading"}
    >
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="raag-lotus">
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path className="petal p1" d="M32 50 C 18 46, 12 36, 14 28 C 22 30, 28 36, 32 50 Z" />
          <path className="petal p2" d="M32 50 C 24 44, 20 34, 22 22 C 28 30, 30 40, 32 50 Z" />
          <path className="petal p3" d="M32 50 C 30 38, 28 26, 32 14 C 36 26, 34 38, 32 50 Z" />
          <path className="petal p4" d="M32 50 C 40 44, 44 34, 42 22 C 36 30, 34 40, 32 50 Z" />
          <path className="petal p5" d="M32 50 C 46 46, 52 36, 50 28 C 42 30, 36 36, 32 50 Z" />
        </g>
      </svg>
      {label && (
        <span
          className="text-[10px] tracking-[0.32em] uppercase raag-label"
          style={{ color: "var(--ink-2)" }}
        >
          {label}
        </span>
      )}
    </span>
  );
}

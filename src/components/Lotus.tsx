export default function Lotus({ size = 28 }: { size?: number }) {
  return (
    <svg className="lotus" width={size} height={size} viewBox="0 0 64 64" fill="none">
      <g fill="none" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 50 C 18 46, 12 36, 14 28 C 22 30, 28 36, 32 50 Z" />
        <path d="M32 50 C 46 46, 52 36, 50 28 C 42 30, 36 36, 32 50 Z" />
        <path d="M32 50 C 30 38, 28 26, 32 14 C 36 26, 34 38, 32 50 Z" />
        <path d="M32 50 C 24 44, 20 34, 22 22 C 28 30, 30 40, 32 50 Z" />
        <path d="M32 50 C 40 44, 44 34, 42 22 C 36 30, 34 40, 32 50 Z" />
      </g>
    </svg>
  );
}

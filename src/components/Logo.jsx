// Play11 jersey mark — a football-shirt silhouette in Play11 gold with "11"
// on it and sleeve stripes. Inspired by the jersey-store style, rebranded.
export default function Logo({ size = 34, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Play11"
    >
      <defs>
        <linearGradient id="p11jersey" x1="6" y1="8" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e6cd92" />
          <stop offset="0.55" stopColor="#c8a24a" />
          <stop offset="1" stopColor="#9c7a2e" />
        </linearGradient>
      </defs>
      {/* jersey silhouette */}
      <path
        d="M24 9 L12 14 L4 24 L10 33 L18 27 L18 57 L46 57 L46 27 L54 33 L60 24 L52 14 L40 9 L32 16 Z"
        fill="url(#p11jersey)"
        stroke="url(#p11jersey)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* sleeve stripes */}
      <path d="M9 22 L15 29" stroke="#101116" strokeWidth="2.3" strokeLinecap="round" />
      <path d="M55 22 L49 29" stroke="#101116" strokeWidth="2.3" strokeLinecap="round" />
      {/* number 11 (knockout) */}
      <rect x="26.4" y="37" width="3.7" height="15" rx="1.2" fill="#101116" />
      <rect x="33.9" y="37" width="3.7" height="15" rx="1.2" fill="#101116" />
      {/* tiny flags on the 1s */}
      <path d="M26.4 38.5 L24 40" stroke="#101116" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M33.9 38.5 L31.5 40" stroke="#101116" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

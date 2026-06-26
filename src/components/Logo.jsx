// Play11 emblem — a premium gold "11" badge with a football + motion lines.
// Used in the navbar, footer, and admin bar. Pure SVG, scales crisply.
export default function Logo({ size = 34, withWordmark = false, className = '' }) {
  return (
    <span className={`logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem' }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Play11">
        <defs>
          <linearGradient id="p11g" x1="8" y1="8" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#e0c486" />
            <stop offset="0.55" stopColor="#c8a24a" />
            <stop offset="1" stopColor="#9c7a2e" />
          </linearGradient>
        </defs>
        {/* Shield / badge */}
        <path
          d="M32 3 L57 12 V31 C57 46 46 56 32 61 C18 56 7 46 7 31 V12 Z"
          fill="#101116"
          stroke="url(#p11g)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Motion lines */}
        <path d="M13 24 H22" stroke="url(#p11g)" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
        <path d="M13 30 H19" stroke="url(#p11g)" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
        {/* The "11" */}
        <text
          x="33" y="40"
          textAnchor="middle"
          fontFamily="Anton, Impact, sans-serif"
          fontSize="30"
          fill="url(#p11g)"
          letterSpacing="1"
        >
          11
        </text>
        {/* Football dot */}
        <circle cx="45.5" cy="45.5" r="5" fill="#101116" stroke="url(#p11g)" strokeWidth="2" />
        <path d="M45.5 41.8 l2.6 1.9 -1 3 h-3.2 l-1-3 z" fill="url(#p11g)" />
      </svg>
      {withWordmark && (
        <span className="logo__word" style={{ fontFamily: 'Anton, sans-serif', fontSize: size * 0.62, letterSpacing: '0.06em', lineHeight: 1 }}>
          PLAY<span style={{ color: 'var(--gold)' }}>11</span>
        </span>
      )}
    </span>
  )
}

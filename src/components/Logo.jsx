// Play11 official logo (the exact artwork supplied by the owner).
// Two files live in /public:
//   play11-logo.png        → black artwork (use on light backgrounds)
//   play11-logo-white.png  → white artwork (use on dark backgrounds)
// The site's bars are dark, so the white version is the default.
export default function Logo({ className = '', variant = 'white' }) {
  const src = variant === 'black' ? '/play11-logo.png' : '/play11-logo-white.png'
  return <img src={src} alt="PLAY11" className={`p11-logo-img ${className}`} />
}

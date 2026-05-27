export default function Logo({ size = 32, className = '' }) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#3b63ff" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="url(#logo-grad)" />
        <g fill="#ffffff">
          <rect x="14" y="36" width="8" height="16" rx="2" />
          <rect x="28" y="26" width="8" height="26" rx="2" />
          <rect x="42" y="16" width="8" height="36" rx="2" />
        </g>
      </svg>
    </div>
  )
}

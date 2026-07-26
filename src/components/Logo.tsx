export function Logo() {
  return (
    <span className="flex items-center gap-2 text-sm font-semibold tracking-[-0.02em] text-bone-white">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="logo-gradient" x1="2" y1="18" x2="18" y2="2" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563eb" />
            <stop offset="1" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        <path d="M10 1.5L18.5 18H1.5L10 1.5Z" fill="url(#logo-gradient)" />
      </svg>
      Sinotech Voyage
    </span>
  )
}

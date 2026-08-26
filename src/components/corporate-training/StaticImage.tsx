import { useState } from 'react'
import { ImageOff } from 'lucide-react'

/**
 * An <img> that degrades to a neutral placeholder tile when the file at
 * `src` doesn't exist (404) — real photos for this section are dropped
 * directly into /public later via GitHub, with no code change, so every
 * path can 404 for a while. Same pattern as CompanyMark's onError logo
 * fallback, generalized for plain photos instead of logos.
 */
export function StaticImage({
  src,
  alt,
  className = '',
  placeholderLabel,
}: {
  src: string
  alt: string
  className?: string
  placeholderLabel?: string
}) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-surface text-ash-gray ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageOff size={28} strokeWidth={1.5} aria-hidden="true" />
        {placeholderLabel && <span className="px-3 text-center text-xs font-medium">{placeholderLabel}</span>}
      </div>
    )
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} loading="lazy" />
}

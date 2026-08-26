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
  placeholderContent,
  onFailedChange,
}: {
  src: string
  alt: string
  className?: string
  placeholderLabel?: string
  /** Overrides the default icon+label fallback below with custom content
   * (e.g. a big centered company logo for a hero photo slot) — still
   * rendered inside the same sized/rounded tile as the real photo would be. */
  placeholderContent?: React.ReactNode
  /** Lets a parent know whether the real photo failed to load, so it can
   * e.g. swap in a bigger fallback visual (like a large centered logo)
   * instead of just the generic icon+label below. */
  onFailedChange?: (failed: boolean) => void
}) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    if (placeholderContent) {
      return (
        <div className={`flex items-center justify-center bg-surface ${className}`} role="img" aria-label={alt}>
          {placeholderContent}
        </div>
      )
    }
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

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        setFailed(true)
        onFailedChange?.(true)
      }}
      loading="lazy"
    />
  )
}

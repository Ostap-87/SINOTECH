import { useEffect, useRef, useState } from 'react'

/** Shared timing so callers (e.g. the hero, to stage the 3D map after the
 * headline) can compute "when does this text finish" without duplicating
 * the constants baked into the CSS transition below. */
export const REVEAL_WORD_STEP_MS = 270
export const REVEAL_WORD_DURATION_MS = 2800

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Word-by-word entrance: each word fades in from a faint tint of its own
 * colour into full color while a soft light band sweeps through it (a slow
 * "sheen", not a hard shimmer loop) — the whole paragraph reads as a single
 * unhurried wave rather than a typewriter or a blunt fade. Plays once on
 * mount; skipped entirely under prefers-reduced-motion. */
export function RevealText({
  text,
  startDelayMs = 0,
  className,
}: {
  text: string
  startDelayMs?: number
  className?: string
}) {
  const [playing, setPlaying] = useState(false)
  const reduced = useRef(prefersReducedMotion())

  useEffect(() => {
    if (reduced.current) return
    // Double rAF so the browser commits the initial (unrevealed) styles
    // before the "appear" class flips — otherwise the transition can get
    // skipped and the text just pops in.
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPlaying(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [])

  const parts = text.split(/(\s+)/)
  let wordIndex = 0

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (/^\s+$/.test(part)) return <span key={i}>{part}</span>
        const delay = reduced.current ? 0 : startDelayMs + wordIndex * REVEAL_WORD_STEP_MS
        wordIndex += 1
        return (
          <span
            key={i}
            className={`reveal-word${playing || reduced.current ? ' reveal-word-in' : ''}`}
            style={reduced.current ? undefined : { transitionDelay: `${delay}ms` }}
          >
            {part}
          </span>
        )
      })}
    </span>
  )
}

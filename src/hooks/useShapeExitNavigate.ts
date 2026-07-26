import { useState } from 'react'
import type { RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ParticleCanvasHandle } from '@/components/ParticleCanvas'

const DEFAULT_DURATION_MS = 2200

interface ClickGuard {
  button?: number
  metaKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  preventDefault: () => void
}

/**
 * Shared "disperse the particle shape, then navigate" transition — reverse
 * of the assembly morph, so leaving a page with a ParticleCanvas hero reads
 * as one continuous motion into the next page instead of an abrupt cut.
 * The destination page's own canvas mount then assembles from scratch.
 */
export function useShapeExitNavigate(
  canvasRef: RefObject<ParticleCanvasHandle | null>,
  durationMs = DEFAULT_DURATION_MS,
) {
  const navigate = useNavigate()
  const [isLeaving, setIsLeaving] = useState(false)

  function goTo(path: string, event?: ClickGuard) {
    if (event) {
      // Let modified clicks (open in new tab, etc.) behave normally.
      if (event.button !== undefined && event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      navigate(path)
      return
    }

    setIsLeaving(true)
    canvasRef.current?.disperse(durationMs)
    setTimeout(() => navigate(path), durationMs)
  }

  return { goTo, isLeaving, durationMs }
}

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { ParticleFieldEngine } from '@/three/ParticleFieldEngine'
import { generateShape, type ShapeKey } from '@/three/shapes'

function getParticleCount(): number {
  const debugCount = new URLSearchParams(window.location.search).get('debugCount')
  if (debugCount) return Number(debugCount)
  // Each particle is now a real 3D polyhedron (InstancedMesh) with its own
  // per-frame matrix compose, not a flat billboard — meaningfully heavier per
  // instance than the old point sprites, so counts sit lower than before.
  if (typeof window === 'undefined') return 3200
  const isSmallScreen = window.innerWidth < 768
  const cores = navigator.hardwareConcurrency ?? 4
  if (isSmallScreen) return 1800
  if (cores <= 4) return 3800
  return 7000
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** On phones the shape still assembles and spins on its own, but isn't
 * drag-interactive — touch-action:none on a hero-covering canvas otherwise
 * eats the touch gestures meant for the buttons/scroll underneath it. */
function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 768
}

export interface ParticleCanvasHandle {
  /** Scatters the current shape back apart — see ParticleFieldEngine.disperse(). */
  disperse: (durationMs?: number) => void
}

export const ParticleCanvas = forwardRef<
  ParticleCanvasHandle,
  { shape: ShapeKey; layout?: 'default' | 'centered' }
>(function ParticleCanvas({ shape, layout = 'default' }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<ParticleFieldEngine | null>(null)
  const countRef = useRef(getParticleCount())

  useImperativeHandle(ref, () => ({
    disperse: (durationMs?: number) => engineRef.current?.disperse(durationMs),
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reducedMotion = prefersReducedMotion()
    const interactive = !isMobileViewport()
    const initial = generateShape(shape, countRef.current)
    const engine = new ParticleFieldEngine(canvas, initial, { reducedMotion, layout, interactive })
    engineRef.current = engine

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) engine.resize(width, height)
    })
    resizeObserver.observe(canvas)

    return () => {
      resizeObserver.disconnect()
      engine.dispose()
      engineRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!engineRef.current) return
    engineRef.current.setTarget(generateShape(shape, countRef.current))
  }, [shape])

  return <canvas ref={canvasRef} className="h-full w-full" />
})

import { useEffect, useRef } from 'react'
import { ParticleFieldEngine } from '@/three/ParticleFieldEngine'
import { generateShape, type ShapeKey } from '@/three/shapes'

function getParticleCount(): number {
  const debugCount = new URLSearchParams(window.location.search).get('debugCount')
  if (debugCount) return Number(debugCount)
  if (typeof window === 'undefined') return 10000
  const isSmallScreen = window.innerWidth < 768
  const cores = navigator.hardwareConcurrency ?? 4
  if (isSmallScreen) return 6000
  if (cores <= 4) return 12000
  return 22000
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function ParticleCanvas({ shape }: { shape: ShapeKey }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<ParticleFieldEngine | null>(null)
  const countRef = useRef(getParticleCount())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reducedMotion = prefersReducedMotion()
    const initial = generateShape(shape, countRef.current)
    const engine = new ParticleFieldEngine(canvas, initial, { reducedMotion })
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
}

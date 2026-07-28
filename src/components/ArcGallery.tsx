import { useEffect, useMemo, useState } from 'react'

export interface ArcGalleryItem {
  id: string
  title: string
  subtitle?: string
  gradient: string
}

interface Metrics {
  radius: number
  spread: number
  edgeScale: number
  cardWidth: number
  cardHeight: number
  spacing: number
}

const DESKTOP_METRICS: Metrics = {
  radius: 340,
  spread: 52,
  edgeScale: 0.16,
  cardWidth: 150,
  cardHeight: 200,
  spacing: 168,
}

const MOBILE_METRICS: Metrics = {
  radius: 170,
  spread: 44,
  edgeScale: 0.16,
  cardWidth: 96,
  cardHeight: 128,
  spacing: 100,
}

function useMetrics(breakpoint = 768): Metrics {
  const [metrics, setMetrics] = useState<Metrics>(() =>
    typeof window !== 'undefined' && window.innerWidth < breakpoint ? MOBILE_METRICS : DESKTOP_METRICS,
  )

  useEffect(() => {
    function onResize() {
      setMetrics(window.innerWidth < breakpoint ? MOBILE_METRICS : DESKTOP_METRICS)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])

  return metrics
}

type CardState = 'flat' | 'arc' | 'hovered' | 'sibling'

function cardTransform(index: number, mid: number, step: number, metrics: Metrics, state: CardState): string {
  if (state === 'flat') {
    const x = (index - mid) * metrics.spacing
    return `translate(${x}px, 0px) rotate(0deg) scale(0.9)`
  }

  const angleDeg = (index - mid) * step
  const angleRad = (angleDeg * Math.PI) / 180
  const x = metrics.radius * Math.sin(angleRad)
  const y = metrics.radius * Math.cos(angleRad) - metrics.radius
  const baseScale = 1 - (metrics.edgeScale * Math.abs(angleDeg)) / (metrics.spread / 2)

  let rotate = angleDeg
  let lift = 0
  let extraScale = 1

  if (state === 'hovered') {
    rotate = 0
    lift = -24
    extraScale = 1.12
  } else if (state === 'sibling') {
    extraScale = 0.96
  }

  return `translate(${x}px, ${y + lift}px) rotate(${rotate}deg) scale(${baseScale * extraScale})`
}

/**
 * Fan/arc carousel: cards start in a flat row, then ease into a fanned arc
 * on mount (translate + rotate per card, trig-placed along a circle).
 * Hovering a card straightens and lifts it to the front while its
 * neighbours dim and shrink slightly — a card-fan interaction, not a
 * traditional slider.
 */
export function ArcGallery({ items }: { items: ArcGalleryItem[] }) {
  const metrics = useMetrics()
  const [assembled, setAssembled] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setAssembled(true))
      return () => cancelAnimationFrame(raf2)
    })
    return () => cancelAnimationFrame(raf1)
  }, [])

  const mid = (items.length - 1) / 2
  const step = items.length > 1 ? metrics.spread / (items.length - 1) : 0

  const trackHeight = useMemo(
    () => metrics.cardHeight + metrics.radius * (1 - Math.cos((metrics.spread / 2) * (Math.PI / 180))) + 60,
    [metrics],
  )

  return (
    <div
      className="relative mx-auto w-full"
      style={{ height: assembled ? trackHeight : metrics.cardHeight + 40, perspective: 1200 }}
    >
      {items.map((item, i) => {
        const state: CardState = !assembled
          ? 'flat'
          : hoveredIndex === null
            ? 'arc'
            : hoveredIndex === i
              ? 'hovered'
              : 'sibling'

        return (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="absolute left-1/2 top-1/2 cursor-pointer overflow-hidden rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
            style={{
              width: metrics.cardWidth,
              height: metrics.cardHeight,
              marginLeft: -metrics.cardWidth / 2,
              marginTop: -metrics.cardHeight / 2,
              transform: cardTransform(i, mid, step, metrics, state),
              zIndex: state === 'hovered' ? 100 : state === 'sibling' ? 10 : i,
              filter: state === 'sibling' ? 'brightness(0.85)' : 'none',
              transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), filter 0.4s ease, z-index 0s',
              willChange: 'transform',
            }}
          >
            <div className="h-full w-full" style={{ background: item.gradient }} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
              <p className="text-xs font-semibold leading-tight text-white">{item.title}</p>
              {item.subtitle && <p className="mt-0.5 text-[11px] leading-tight text-white/75">{item.subtitle}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

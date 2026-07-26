import { useEffect, useMemo, useState } from 'react'
import chinaOutline from '@/data/china-outline.json'
import { getCity } from '@/data'
import { useLanguage } from '@/i18n/LanguageContext'

export interface RouteMapStop {
  key: string
  day: number
  cityId: string
  cityLabel: string
  companies: string[]
}

interface RouteMapProps {
  stops: RouteMapStop[]
  className?: string
}

type Ring = [number, number][]
type Polygon = Ring[]

const RINGS = chinaOutline as unknown as Polygon[]
const REVEAL_INTERVAL_MS = 2600
const ARC_DRAW_MS = 1000

/**
 * Equirectangular projection with a cosine correction on longitude — cheap
 * and close enough for a stylized route illustration (not for navigation),
 * over China's fairly narrow ~18–53°N latitude band.
 */
function buildProjection() {
  const allPoints: [number, number][] = []
  for (const polygon of RINGS) {
    for (const ring of polygon) {
      for (const point of ring) allPoints.push(point)
    }
  }

  let latMin = Infinity
  let latMax = -Infinity
  for (const [, lat] of allPoints) {
    if (lat < latMin) latMin = lat
    if (lat > latMax) latMax = lat
  }
  const meanLatRad = ((latMin + latMax) / 2) * (Math.PI / 180)
  const lngCos = Math.cos(meanLatRad)

  let rawXMin = Infinity
  let rawXMax = -Infinity
  let rawYMin = Infinity
  let rawYMax = -Infinity
  for (const [lng, lat] of allPoints) {
    const rawX = lng * lngCos
    if (rawX < rawXMin) rawXMin = rawX
    if (rawX > rawXMax) rawXMax = rawX
    if (lat < rawYMin) rawYMin = lat
    if (lat > rawYMax) rawYMax = lat
  }

  const width = 1000
  const scale = width / (rawXMax - rawXMin)
  const height = (rawYMax - rawYMin) * scale

  function project(lng: number, lat: number): [number, number] {
    const x = (lng * lngCos - rawXMin) * scale
    const y = height - (lat - rawYMin) * scale
    return [x, y]
  }

  const ringPaths = RINGS.map((polygon) =>
    polygon
      .map((ring) => {
        const points = ring.map(([lng, lat]) => project(lng, lat))
        return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ') + ' Z'
      })
      .join(' '),
  )

  return { project, ringPaths, width, height }
}

let cachedProjection: ReturnType<typeof buildProjection> | null = null

function useProjection() {
  return useMemo(() => (cachedProjection ??= buildProjection()), [])
}

function arcPath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dist = Math.hypot(x2 - x1, y2 - y1)
  // Bend the control point toward the top of the map (screen-space up), so
  // arcs read as gentle flight-path curves rather than straight connectors.
  const cx = mx
  const cy = my - dist * 0.18
  return `M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`
}

function AnimatedArc({ d }: { d: string }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setProgress(1))
    return () => cancelAnimationFrame(id)
  }, [])
  return (
    <path
      d={d}
      pathLength={1}
      className="fill-none stroke-electric-iris"
      strokeWidth={2.2}
      strokeLinecap="round"
      style={{
        strokeDasharray: 1,
        strokeDashoffset: 1 - progress,
        transition: `stroke-dashoffset ${ARC_DRAW_MS}ms ease-out`,
      }}
    />
  )
}

export function RouteMap({ stops, className }: RouteMapProps) {
  const { locale } = useLanguage()
  const { project, ringPaths, width, height } = useProjection()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing) return
    if (currentIndex >= stops.length - 1) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setCurrentIndex((i) => Math.min(i + 1, stops.length - 1)), REVEAL_INTERVAL_MS)
    return () => clearTimeout(t)
  }, [playing, currentIndex, stops.length])

  if (stops.length === 0) return null

  const points = stops.map((stop) => {
    const city = getCity(stop.cityId)
    return city ? project(city.lng, city.lat) : ([width / 2, height / 2] as [number, number])
  })

  const current = stops[currentIndex]

  function goTo(index: number) {
    setPlaying(false)
    setCurrentIndex(Math.max(0, Math.min(stops.length - 1, index)))
  }

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/40">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" preserveAspectRatio="xMidYMid meet">
          {ringPaths.map((d, i) => (
            <path key={i} d={d} className="fill-white/[0.03] stroke-white/15" strokeWidth={1.2} />
          ))}

          {stops.slice(0, currentIndex + 1).map((_, i) => {
            if (i === 0) return null
            const [x1, y1] = points[i - 1]
            const [x2, y2] = points[i]
            return <AnimatedArc key={`arc-${i}`} d={arcPath(x1, y1, x2, y2)} />
          })}

          {stops.slice(0, currentIndex + 1).map((stop, i) => {
            const [x, y] = points[i]
            const isCurrent = i === currentIndex
            return (
              <g key={stop.key} onClick={() => goTo(i)} className="cursor-pointer">
                {isCurrent && (
                  <circle cx={x} cy={y} r={14} className="fill-none stroke-electric-iris/60">
                    <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isCurrent ? 7 : 4.5}
                  className={isCurrent ? 'fill-electric-iris' : 'fill-bone-white/70'}
                />
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.025em] text-saffron-spark">
            {locale === 'ru' ? 'День' : 'Day'} {current.day} · {current.cityLabel}
          </p>
          <p className="mt-1 text-sm text-silver-mist">{current.companies.join(', ')}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-ash-gray transition-colors hover:text-bone-white disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous day"
          >
            ‹
          </button>
          {currentIndex >= stops.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                setCurrentIndex(0)
                setPlaying(true)
              }}
              className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray transition-colors hover:text-bone-white"
            >
              {locale === 'ru' ? 'Заново' : 'Restart'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray transition-colors hover:text-bone-white"
            >
              {playing ? (locale === 'ru' ? 'Пауза' : 'Pause') : locale === 'ru' ? 'Играть' : 'Play'}
            </button>
          )}
          <button
            type="button"
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex >= stops.length - 1}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-ash-gray transition-colors hover:text-bone-white disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next day"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}

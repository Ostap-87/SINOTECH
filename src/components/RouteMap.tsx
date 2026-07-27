import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import chinaProvinces from '@/data/china-provinces.json'
import { getCity, companiesData } from '@/data'
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
  /** When set, highlights that region's provinces on the map — see RegionHighlight. */
  regionCode?: string
}

export interface RouteMapHandle {
  /** Jumps the map to the stop matching the given itinerary day, pausing autoplay. */
  goToDay: (day: number) => void
}

type Ring = [number, number][]
type Polygon = Ring[]
interface ProvinceEntry {
  nameEn: string
  nameRu: string
  polygons: Polygon[]
}

const PROVINCES = chinaProvinces as unknown as ProvinceEntry[]
const REVEAL_INTERVAL_MS = 2600
const ARC_DRAW_MS = 1000

function polygonToPath(polygon: Polygon, project: (lng: number, lat: number) => [number, number]): string {
  return polygon
    .map((ring) => {
      const points = ring.map(([lng, lat]) => project(lng, lat))
      return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ') + ' Z'
    })
    .join(' ')
}

/**
 * Equirectangular projection with a cosine correction on longitude — cheap
 * and close enough for a stylized route illustration (not for navigation),
 * over China's fairly narrow ~18–53°N latitude band. Built from real
 * province-level boundaries (34 provinces incl. Hong Kong/Macau/Taiwan) —
 * drawing every province's border, rather than just the national outline,
 * is what makes a per-province highlight possible.
 */
function buildProjection() {
  const allPoints: [number, number][] = []
  for (const province of PROVINCES) {
    for (const polygon of province.polygons) {
      for (const ring of polygon) {
        for (const point of ring) allPoints.push(point)
      }
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

  const provincePaths = PROVINCES.map((province) => ({
    nameEn: province.nameEn,
    d: province.polygons.map((polygon) => polygonToPath(polygon, project)).join(' '),
  }))

  return { project, provincePaths, width, height }
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

const REGION_REVEAL_DELAY_MS = 700
const REGION_REVEAL_MS = 900

/**
 * Highlights a region's actual provinces on the map — the whole map is
 * already visible from the start (every province drawn), so this fades in
 * a beat later, reading as "here's the country, and here's where within
 * it" rather than both at once. A region (north/south/etc.) spans several
 * provinces, so every province with at least one city in that region gets
 * traced and filled.
 */
function RegionHighlight({
  regionCode,
  project,
  locale,
}: {
  regionCode: string
  project: (lng: number, lat: number) => [number, number]
  locale: 'ru' | 'en'
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), REGION_REVEAL_DELAY_MS)
    return () => clearTimeout(t)
  }, [])

  const region = companiesData.regions.find((r) => r.code === regionCode)
  const cities = companiesData.cities.filter((c) => c.region === regionCode)
  if (!region || cities.length === 0) return null

  const provinceNames = new Set(cities.map((c) => c.province_en))
  const matchedProvinces = PROVINCES.filter((p) => provinceNames.has(p.nameEn))
  if (matchedProvinces.length === 0) return null

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  const provincePaths = matchedProvinces.map((province) => {
    const d = province.polygons.map((polygon) => polygonToPath(polygon, project)).join(' ')
    for (const polygon of province.polygons) {
      for (const ring of polygon) {
        for (const [lng, lat] of ring) {
          const [x, y] = project(lng, lat)
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }
    return d
  })

  const cx = (minX + maxX) / 2
  const labelY = Math.max(minY - 20, 20)

  return (
    <g style={{ opacity: visible ? 1 : 0, transition: `opacity ${REGION_REVEAL_MS}ms ease-out` }}>
      {provincePaths.map((d, i) => (
        <path
          key={i}
          d={d}
          className="fill-electric-iris/12 stroke-electric-iris/60"
          strokeWidth={2}
        />
      ))}
      <text
        x={cx}
        y={labelY}
        textAnchor="middle"
        className="fill-electric-iris font-semibold uppercase"
        style={{ fontSize: 20, letterSpacing: '0.04em' }}
      >
        {locale === 'ru' ? region.ru : region.en}
      </text>
    </g>
  )
}

/**
 * A small plane glyph flies along the arc as it draws, rather than the
 * connector reading as an abstract line — this is what signals "flight
 * between cities" rather than a generic route hop.
 */
function AnimatedArc({ d }: { d: string }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setProgress(1))
    return () => cancelAnimationFrame(id)
  }, [])
  return (
    <g>
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
      <path d="M-7,-3.5 L7,0 L-7,3.5 L-3,0 Z" className="fill-electric-iris stroke-white" strokeWidth={0.6}>
        <animateMotion dur={`${ARC_DRAW_MS}ms`} path={d} rotate="auto" fill="freeze" begin="0s" />
      </path>
    </g>
  )
}

export const RouteMap = forwardRef<RouteMapHandle, RouteMapProps>(function RouteMap(
  { stops, className, regionCode },
  ref,
) {
  const { locale } = useLanguage()
  const { project, provincePaths, width, height } = useProjection()
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

  useImperativeHandle(
    ref,
    () => ({
      goToDay(day: number) {
        const index = stops.findIndex((stop) => stop.day === day)
        if (index === -1) return
        setPlaying(false)
        setCurrentIndex(index)
      },
    }),
    [stops],
  )

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
    <div className={`flex h-full flex-col ${className ?? ''}`}>
      <div className="flex-1 overflow-hidden rounded-2xl border border-black/15 bg-surface/60">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="route-map-glow" x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {provincePaths.map((province) => (
            <path
              key={province.nameEn}
              d={province.d}
              className="fill-black/[0.04] stroke-black/25"
              strokeWidth={1}
            />
          ))}

          {regionCode && <RegionHighlight regionCode={regionCode} project={project} locale={locale} />}

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
                {/* Soft glow halo behind every visited point — reads as "lit up" against the flat map. */}
                <circle
                  cx={x}
                  cy={y}
                  r={isCurrent ? 16 : 10}
                  className="fill-electric-iris/35"
                  filter="url(#route-map-glow)"
                />
                {isCurrent && (
                  <circle cx={x} cy={y} r={14} className="fill-none stroke-electric-iris/60">
                    <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isCurrent ? 7 : 5}
                  className={isCurrent ? 'fill-electric-iris' : 'fill-electric-iris/70'}
                  stroke="white"
                  strokeWidth={1.5}
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
            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/15 text-ash-gray transition-colors hover:text-bone-white disabled:cursor-not-allowed disabled:opacity-30"
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
              className="rounded-full border border-black/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray transition-colors hover:text-bone-white"
            >
              {locale === 'ru' ? 'Заново' : 'Restart'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="rounded-full border border-black/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray transition-colors hover:text-bone-white"
            >
              {playing ? (locale === 'ru' ? 'Пауза' : 'Pause') : locale === 'ru' ? 'Играть' : 'Play'}
            </button>
          )}
          <button
            type="button"
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex >= stops.length - 1}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/15 text-ash-gray transition-colors hover:text-bone-white disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next day"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
})

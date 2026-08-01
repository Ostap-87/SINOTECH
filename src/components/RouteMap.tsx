import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import chinaProvinces from '@/data/china-provinces.json'
import japanProvinces from '@/data/japan-provinces.json'
import koreaProvinces from '@/data/korea-provinces.json'
import indiaProvinces from '@/data/india-provinces.json'
import thailandProvinces from '@/data/thailand-provinces.json'
import malaysiaProvinces from '@/data/malaysia-provinces.json'
import indonesiaProvinces from '@/data/indonesia-provinces.json'
import vietnamProvinces from '@/data/vietnam-provinces.json'
import { getCity, companiesData } from '@/data'
import { useLanguage } from '@/i18n/LanguageContext'
import { ShimmerText } from './ShimmerText'

export interface RouteMapStop {
  key: string
  day: number
  cityId: string
  cityLabel: string
  companies: string[]
  /** How this stop was reached from the previous one — picks the arc glyph (plane vs train). Defaults to 'flight'. */
  legMode?: 'flight' | 'train'
}

export type RouteMapCountry =
  | 'china'
  | 'japan'
  | 'korea'
  | 'india'
  | 'thailand'
  | 'malaysia'
  | 'indonesia'
  | 'vietnam'

interface RouteMapProps {
  stops: RouteMapStop[]
  className?: string
  /** Which province-level boundary set to draw — one per country, China by default. */
  country?: RouteMapCountry
  /** When set, highlights that region's provinces on the map — China only, see RegionHighlight. */
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

// Every country map is pre-built at province/state/prefecture level (like
// China's) so a future expedition anywhere just plugs in stops — no new
// boundary data to source first.
const PROVINCE_SETS: Record<RouteMapCountry, ProvinceEntry[]> = {
  china: chinaProvinces as unknown as ProvinceEntry[],
  japan: japanProvinces as unknown as ProvinceEntry[],
  korea: koreaProvinces as unknown as ProvinceEntry[],
  india: indiaProvinces as unknown as ProvinceEntry[],
  thailand: thailandProvinces as unknown as ProvinceEntry[],
  malaysia: malaysiaProvinces as unknown as ProvinceEntry[],
  indonesia: indonesiaProvinces as unknown as ProvinceEntry[],
  vietnam: vietnamProvinces as unknown as ProvinceEntry[],
}

const REVEAL_INTERVAL_MS = 2600
const ARC_DRAW_MS = 1900

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
 * and close enough for a stylized route illustration (not for navigation).
 * Built from real province-level boundaries — drawing every province's
 * border, rather than just the national outline, is what makes a
 * per-province highlight possible.
 */
function buildProjection(provinces: ProvinceEntry[]) {
  const allPoints: [number, number][] = []
  for (const province of provinces) {
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

  const provincePaths = provinces.map((province) => ({
    nameEn: province.nameEn,
    d: province.polygons.map((polygon) => polygonToPath(polygon, project)).join(' '),
  }))

  return { project, provincePaths, width, height }
}

const projectionCache = new Map<RouteMapCountry, ReturnType<typeof buildProjection>>()

function useProjection(country: RouteMapCountry) {
  return useMemo(() => {
    let cached = projectionCache.get(country)
    if (!cached) {
      cached = buildProjection(PROVINCE_SETS[country])
      projectionCache.set(country, cached)
    }
    return cached
  }, [country])
}

/**
 * Bend the control point toward the top of the map (screen-space up), so
 * arcs read as gentle flight-path curves rather than straight connectors.
 */
function arcControlPoint(x1: number, y1: number, x2: number, y2: number): [number, number] {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dist = Math.hypot(x2 - x1, y2 - y1)
  return [mx, my - dist * 0.18]
}

function quadraticPoint(t: number, x1: number, y1: number, cx: number, cy: number, x2: number, y2: number) {
  const mt = 1 - t
  const x = mt * mt * x1 + 2 * mt * t * cx + t * t * x2
  const y = mt * mt * y1 + 2 * mt * t * cy + t * t * y2
  const dx = 2 * mt * (cx - x1) + 2 * t * (x2 - cx)
  const dy = 2 * mt * (cy - y1) + 2 * t * (y2 - cy)
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI }
}

// --- Leg-aware camera: zoom to the provinces (or, for a flight, to the two
// airport points) actually involved in the current day's travel, instead of
// always showing the whole country at a fixed zoom. ---

type Box = [number, number, number, number] // [x, y, width, height] in the map's projected SVG units

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function lerpBox(a: Box, b: Box, t: number): Box {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t]
}

function padBox([x, y, w, h]: Box, pad: number): Box {
  return [x - pad, y - pad, w + pad * 2, h + pad * 2]
}

function unionBox(a: Box, b: Box): Box {
  const x0 = Math.min(a[0], b[0])
  const y0 = Math.min(a[1], b[1])
  const x1 = Math.max(a[0] + a[2], b[0] + b[2])
  const y1 = Math.max(a[1] + a[3], b[1] + b[3])
  return [x0, y0, x1 - x0, y1 - y0]
}

function pointBox(x: number, y: number, size: number): Box {
  return [x - size / 2, y - size / 2, size, size]
}

/** Ray-casting point-in-ring test, run directly on raw [lng, lat] coordinates. */
function pointInRing(lng: number, lat: number, ring: [number, number][]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function pointInPolygon(lng: number, lat: number, polygon: Polygon): boolean {
  const [outer, ...holes] = polygon
  if (!outer || !pointInRing(lng, lat, outer)) return false
  for (const hole of holes) if (pointInRing(lng, lat, hole)) return false
  return true
}

/**
 * Which province a city sits in — tested geometrically against the real
 * boundaries rather than a hand-tagged field, so it works for any country's
 * data without needing a province name pre-recorded per city. Falls back to
 * nearest-by-centroid for the rare point that lands just outside every
 * simplified ring (coastline decimation, offshore city marker, etc.).
 */
function findProvinceForCity(lng: number, lat: number, provinces: ProvinceEntry[]): ProvinceEntry | undefined {
  for (const province of provinces) {
    for (const polygon of province.polygons) {
      if (pointInPolygon(lng, lat, polygon)) return province
    }
  }
  let best: ProvinceEntry | undefined
  let bestDist = Infinity
  for (const province of provinces) {
    const ring = province.polygons[0]?.[0]
    if (!ring || ring.length === 0) continue
    let sx = 0
    let sy = 0
    for (const [x, y] of ring) {
      sx += x
      sy += y
    }
    const dist = Math.hypot(sx / ring.length - lng, sy / ring.length - lat)
    if (dist < bestDist) {
      bestDist = dist
      best = province
    }
  }
  return best
}

function provinceProjectedBBox(province: ProvinceEntry, project: (lng: number, lat: number) => [number, number]): Box {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
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
  return [minX, minY, maxX - minX, maxY - minY]
}

interface ViewTarget {
  box: Box
  transitionMs: number
  holdMs: number
  labels: { x: number; y: number; text: string }[]
}

const FLIGHT_DEPART_MS = 800
const FLIGHT_DEPART_HOLD_MS = 600
const FLIGHT_TRANSIT_MS = 700
// Held long enough that the plane (which starts moving the instant the
// transit phase begins) finishes its flight while the camera is still on
// the wide view — otherwise the camera would already be zoomed in on the
// arrival city before the plane visibly lands.
const FLIGHT_TRANSIT_HOLD_MS = Math.max(ARC_DRAW_MS - FLIGHT_TRANSIT_MS, 400)
const FLIGHT_ARRIVE_MS = 800
const LEG_ZOOM_MS = 1100
const PROVINCE_PAD_RATIO = 0.35
const PROVINCE_MIN_PAD = 40
const CITY_TIGHT_SIZE_RATIO = 0.16
const CITY_WIDE_PAD_RATIO = 0.55
// After the last stop's own zoom settles, hold briefly so the arrival still
// reads, then pull back out to the full route overview instead of leaving
// the camera parked on the final city forever.
const FINAL_STOP_HOLD_MS = 1400
const FINAL_OVERVIEW_MS = 900

/**
 * Where the very first leg's plane enters the frame from — just inside the
 * top-left corner of the full map box, well outside the country's own
 * silhouette (which is padded away from the edges), so the opening flight
 * visibly crosses the border into the first city rather than starting from
 * a point already inside it.
 */
function internationalArrivalOrigin(fullBox: Box): [number, number] {
  const [x, y, w, h] = fullBox
  return [x + w * 0.05, y + h * 0.1]
}

/**
 * Builds the camera sequence for the leg arriving at `stops[currentIndex]`,
 * plus how long the connecting arc should wait before it starts drawing —
 * for a flight, that's until the departure close-up has landed, so the
 * plane visibly takes off from a city we've already zoomed to rather than
 * finishing its flight before the camera has caught up.
 */
function buildLegTargets(
  stops: RouteMapStop[],
  currentIndex: number,
  points: [number, number][],
  provinces: ProvinceEntry[],
  project: (lng: number, lat: number) => [number, number],
  fullBox: Box,
): { targets: ViewTarget[]; arcStartDelayMs: number } {
  if (currentIndex === 0) {
    const [x0, y0] = points[0]
    return {
      targets: [{ box: fullBox, transitionMs: 900, holdMs: Infinity, labels: [{ x: x0, y: y0, text: stops[0].cityLabel }] }],
      // Waits for the initial overview pan to settle before the
      // international arrival flight starts crossing the border.
      arcStartDelayMs: 700,
    }
  }

  const prevStop = stops[currentIndex - 1]
  const stop = stops[currentIndex]
  const [x1, y1] = points[currentIndex - 1]
  const [x2, y2] = points[currentIndex]
  const refSize = Math.max(fullBox[2], fullBox[3])
  const isFinalStop = currentIndex === stops.length - 1

  let targets: ViewTarget[]
  let arcStartDelayMs = 0

  if (stop.legMode === 'flight') {
    const tight = refSize * CITY_TIGHT_SIZE_RATIO
    const departBox = pointBox(x1, y1, tight)
    const arriveBox = pointBox(x2, y2, tight)
    const transitBox = padBox(unionBox(pointBox(x1, y1, 1), pointBox(x2, y2, 1)), refSize * CITY_WIDE_PAD_RATIO)
    targets = [
      { box: departBox, transitionMs: FLIGHT_DEPART_MS, holdMs: FLIGHT_DEPART_HOLD_MS, labels: [{ x: x1, y: y1, text: prevStop.cityLabel }] },
      { box: transitBox, transitionMs: FLIGHT_TRANSIT_MS, holdMs: FLIGHT_TRANSIT_HOLD_MS, labels: [] },
      { box: arriveBox, transitionMs: FLIGHT_ARRIVE_MS, holdMs: Infinity, labels: [{ x: x2, y: y2, text: stop.cityLabel }] },
    ]
    arcStartDelayMs = FLIGHT_DEPART_MS + FLIGHT_DEPART_HOLD_MS
  } else {
    const cityA = getCity(prevStop.cityId)
    const cityB = getCity(stop.cityId)
    const provinceA = cityA && findProvinceForCity(cityA.lng, cityA.lat, provinces)
    const provinceB = cityB && findProvinceForCity(cityB.lng, cityB.lat, provinces)

    let box: Box
    if (provinceA && provinceB) {
      const boxA = provinceProjectedBBox(provinceA, project)
      const boxB = provinceProjectedBBox(provinceB, project)
      const merged = unionBox(boxA, boxB)
      box = padBox(merged, Math.max(Math.max(merged[2], merged[3]) * PROVINCE_PAD_RATIO, PROVINCE_MIN_PAD))
    } else {
      box = padBox(unionBox(pointBox(x1, y1, 1), pointBox(x2, y2, 1)), refSize * CITY_WIDE_PAD_RATIO)
    }

    // Always label the stop we're actually arriving at — the departure
    // label only joins it for a genuine inter-city leg; a same-city stop
    // (e.g. two days running in the same host city) must show its own
    // label, not the previous day's.
    const labels =
      stop.cityId !== prevStop.cityId
        ? [{ x: x1, y: y1, text: prevStop.cityLabel }, { x: x2, y: y2, text: stop.cityLabel }]
        : [{ x: x2, y: y2, text: stop.cityLabel }]

    targets = [{ box, transitionMs: LEG_ZOOM_MS, holdMs: Infinity, labels }]
  }

  if (isFinalStop) {
    const last = targets[targets.length - 1]
    targets = [
      ...targets.slice(0, -1),
      { ...last, holdMs: FINAL_STOP_HOLD_MS },
      { box: fullBox, transitionMs: FINAL_OVERVIEW_MS, holdMs: Infinity, labels: [] },
    ]
  }

  return { targets, arcStartDelayMs }
}

/** Total time before the sequence settles — used to pace autoplay so it doesn't cut a flight's zoom short. */
function legSequenceDurationMs(targets: ViewTarget[]): number {
  let total = 0
  for (const target of targets) {
    total += target.transitionMs
    total += Number.isFinite(target.holdMs) ? target.holdMs : 0
  }
  return total
}

/**
 * Animates the map's viewBox through a leg's camera sequence (a single pan/
 * zoom for a train or car leg; departure → transit → arrival for a flight),
 * starting from wherever the camera currently sits so consecutive legs read
 * as one continuous move rather than a jump cut.
 */
function useLegView(targets: ViewTarget[]) {
  const initialBoxRef = useRef(targets[0]?.box ?? ([0, 0, 1000, 1000] as Box))
  const [box, setBox] = useState<Box>(initialBoxRef.current)
  const [labels, setLabels] = useState(targets[0]?.labels ?? [])
  const currentBoxRef = useRef(box)
  currentBoxRef.current = box

  useEffect(() => {
    let cancelled = false
    let rafId = 0
    let timeoutId = 0

    function animateTo(fromBox: Box, target: ViewTarget, onDone: () => void) {
      const start = performance.now()
      setLabels(target.labels)
      function step(now: number) {
        if (cancelled) return
        const t = Math.min((now - start) / target.transitionMs, 1)
        setBox(lerpBox(fromBox, target.box, easeInOutCubic(t)))
        if (t < 1) rafId = requestAnimationFrame(step)
        else onDone()
      }
      rafId = requestAnimationFrame(step)
    }

    function runIndex(i: number, fromBox: Box) {
      if (cancelled || i >= targets.length) return
      const target = targets[i]
      animateTo(fromBox, target, () => {
        if (cancelled) return
        if (i < targets.length - 1 && Number.isFinite(target.holdMs)) {
          timeoutId = window.setTimeout(() => runIndex(i + 1, target.box), target.holdMs)
        }
      })
    }

    runIndex(0, currentBoxRef.current)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      window.clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets])

  return { box, labels }
}

function CityLabel({ x, y, text, boxWidth }: { x: number; y: number; text: string; boxWidth: number }) {
  const fontSize = Math.max(boxWidth * 0.034, 10)
  return (
    <text
      x={x}
      y={y - fontSize * 1.3}
      textAnchor="middle"
      className="fill-bone-white font-semibold"
      style={{
        fontSize,
        stroke: 'white',
        strokeWidth: fontSize * 0.28,
        paintOrder: 'stroke',
      }}
    >
      {text}
    </text>
  )
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
  provinces,
  project,
  locale,
}: {
  regionCode: string
  provinces: ProvinceEntry[]
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
  const matchedProvinces = provinces.filter((p) => provinceNames.has(p.nameEn))
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
 * between cities" rather than a generic route hop. Driven by
 * requestAnimationFrame (not SMIL's animateMotion) because SMIL's `begin`
 * timing is anchored to the document's animation timeline, not to when the
 * element is inserted — a React-mounted animateMotion with begin="0s" ends
 * up already "in the past" and jumps straight to its frozen end frame
 * instead of playing, which is exactly what read as "just a dot".
 */
function AnimatedArc({
  x1,
  y1,
  x2,
  y2,
  mode = 'flight',
  startDelayMs = 0,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  mode?: 'flight' | 'train'
  /** Waits before drawing — for a flight, until the departure close-up has landed. */
  startDelayMs?: number
}) {
  const [progress, setProgress] = useState(0)
  const [planeT, setPlaneT] = useState(0)
  useEffect(() => {
    let startId = 0
    let frameId = 0
    const delayId = window.setTimeout(() => {
      startId = requestAnimationFrame(() => setProgress(1))
      const start = performance.now()
      frameId = requestAnimationFrame(function frame(now: number) {
        const t = Math.min((now - start) / ARC_DRAW_MS, 1)
        setPlaneT(t)
        if (t < 1) frameId = requestAnimationFrame(frame)
      })
    }, startDelayMs)
    return () => {
      window.clearTimeout(delayId)
      cancelAnimationFrame(startId)
      cancelAnimationFrame(frameId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [cx, cy] = arcControlPoint(x1, y1, x2, y2)
  const d = `M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`
  const plane = quadraticPoint(planeT, x1, y1, cx, cy, x2, y2)
  // Faded in just after takeoff and out just before landing, so it never has
  // to sit "parked" on top of the destination dot once it reaches t=1.
  const planeOpacity = planeT < 0.12 ? planeT / 0.12 : planeT > 0.8 ? Math.max(0, (1 - planeT) / 0.2) : 1

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
      {/*
       * Plane vs train glyph tracks how this leg is actually travelled — a
       * train icon on a rail leg keeps users from thinking every connector
       * on the map is a flight, which is what a plane-only icon implied.
       */}
      {mode === 'train' ? (
        <path
          d="M18,0 L8,-6 L-14,-6 Q-17,-6 -17,-3 L-17,3 Q-17,6 -14,6 L8,6 Z
             M-11,-3 L-11,3 L-7,3 L-7,-3 Z
             M-4,-3 L-4,3 L0,3 L0,-3 Z
             M3,-3 L3,3 L7,3 L7,-3 Z"
          fillRule="evenodd"
          className="fill-electric-iris"
          style={{ opacity: planeOpacity }}
          transform={`translate(${plane.x.toFixed(1)} ${plane.y.toFixed(1)}) rotate(${plane.angle.toFixed(1)})`}
        />
      ) : (
        // A top-down aircraft silhouette (fuselage + swept wings + tail fins
        // as separate closed subpaths in one fill) rather than a simple
        // arrow — big enough to read unmistakably as a plane, not a chevron.
        <path
          d="M18,0 L8,-2 L-16,-2 L-18,0 L-16,2 L8,2 Z
             M2,-1.6 L-11,-14 L-14,-14 L-1,-1.6 Z
             M2,1.6 L-11,14 L-14,14 L-1,1.6 Z
             M-11,-1.4 L-16,-7 L-17,-7 L-12,-1.4 Z
             M-11,1.4 L-16,7 L-17,7 L-12,1.4 Z"
          className="fill-electric-iris"
          style={{ opacity: planeOpacity }}
          transform={`translate(${plane.x.toFixed(1)} ${plane.y.toFixed(1)}) rotate(${plane.angle.toFixed(1)})`}
        />
      )}
    </g>
  )
}

export const RouteMap = forwardRef<RouteMapHandle, RouteMapProps>(function RouteMap(
  { stops, className, country = 'china', regionCode },
  ref,
) {
  const { locale } = useLanguage()
  const { project, provincePaths, width, height } = useProjection(country)
  const provinces = PROVINCE_SETS[country]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playing, setPlaying] = useState(true)

  const points = stops.map((stop) => {
    const city = getCity(stop.cityId)
    return city ? project(city.lng, city.lat) : ([width / 2, height / 2] as [number, number])
  })

  // `stops` is rebuilt fresh (new array reference) on every parent render, so
  // memoizing on it directly would restart the camera sequence on any
  // unrelated re-render — this content-based key only changes when the
  // itinerary, current day, or country actually change.
  const legSignature = `${country}#${currentIndex}#${stops.map((s) => `${s.cityId}:${s.legMode ?? ''}`).join(',')}`
  const fullBox = useMemo<Box>(() => [0, 0, width, height], [width, height])
  const { targets, arcStartDelayMs } = useMemo(
    () => buildLegTargets(stops, currentIndex, points, provinces, project, fullBox),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [legSignature, fullBox],
  )
  const { box: viewBox, labels: viewLabels } = useLegView(targets)

  useEffect(() => {
    if (!playing) return
    if (currentIndex >= stops.length - 1) {
      setPlaying(false)
      return
    }
    const nextStop = stops[currentIndex + 1]
    const delay = nextStop?.legMode === 'flight' ? legSequenceDurationMs(buildLegTargets(stops, currentIndex + 1, points, provinces, project, fullBox).targets) + 600 : REVEAL_INTERVAL_MS
    const t = setTimeout(() => setCurrentIndex((i) => Math.min(i + 1, stops.length - 1)), delay)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const current = stops[currentIndex]

  function goTo(index: number) {
    setPlaying(false)
    setCurrentIndex(Math.max(0, Math.min(stops.length - 1, index)))
  }

  return (
    <div className={`flex h-full flex-col ${className ?? ''}`}>
      <div className="flex-1 overflow-hidden rounded-2xl border border-black/15 bg-surface/60">
        <svg
          viewBox={`${viewBox[0].toFixed(1)} ${viewBox[1].toFixed(1)} ${viewBox[2].toFixed(1)} ${viewBox[3].toFixed(1)}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
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

          {regionCode && country === 'china' && (
            <RegionHighlight regionCode={regionCode} provinces={PROVINCE_SETS.china} project={project} locale={locale} />
          )}

          {stops.slice(0, currentIndex + 1).map((stop, i) => {
            if (i === 0) {
              // The delegation's opening leg — a plane crossing in from
              // outside the country's own borders to the first stop, not a
              // hop from a previous city.
              const [ox, oy] = internationalArrivalOrigin(fullBox)
              const [x2, y2] = points[0]
              return (
                <AnimatedArc
                  key="arc-arrival"
                  x1={ox}
                  y1={oy}
                  x2={x2}
                  y2={y2}
                  mode="flight"
                  startDelayMs={arcStartDelayMs}
                />
              )
            }
            const [x1, y1] = points[i - 1]
            const [x2, y2] = points[i]
            return (
              <AnimatedArc
                key={`arc-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                mode={stop.legMode}
                startDelayMs={i === currentIndex ? arcStartDelayMs : 0}
              />
            )
          })}

          {viewLabels.map((label) => (
            <CityLabel key={label.text + label.x} x={label.x} y={label.y} text={label.text} boxWidth={viewBox[2]} />
          ))}

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

      <div className="mt-4 flex flex-col items-center gap-3 text-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.025em]">
            <ShimmerText
              variant="saffron"
              text={`${locale === 'ru' ? 'День' : 'Day'} ${current.day} · ${current.cityLabel}`}
            />
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

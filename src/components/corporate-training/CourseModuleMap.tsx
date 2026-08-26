import { useLayoutEffect, useRef, useState, type RefObject } from 'react'
import type { CourseModule } from '@/data/corporateTraining'

/**
 * Visual module map (Stage 2.1 of the spec) — an org-chart / mind-map style
 * diagram: one root node (the programme), branching to module nodes
 * (max 3 per row, wrapping to a second centered row), and a separate pair
 * of "Фото с обучения" / "Форма заявки" nodes branching directly from the
 * root as a second, parallel group — not chained through the modules.
 *
 * Implementation choice: real DOM nodes (so module names/descriptions are
 * plain readable/indexable text, not text baked into an SVG or raster
 * image) with an absolutely-positioned SVG *underneath* them purely for
 * the connector lines, measured via getBoundingClientRect on mount/resize.
 * This gets the accessibility requirement "for free" — no separate
 * aria-label duplication needed, the diagram *is* real text. A hidden
 * <ul> of module titles is still included for the (rare) case the visual
 * layout hides content from very old screen readers, plus a one-line
 * caption that always renders describing the map for context.
 *
 * No diagram/orgchart library exists in this project's dependencies (see
 * Stage 0 audit) — this is a small purpose-built component instead of
 * pulling one in for a single use case.
 *
 * Below the `md` breakpoint the whole connector system is skipped —
 * CSS switches to a plain single-column stack (root → modules in order →
 * photo → form), per the spec's explicit mobile behavior.
 */
export function CourseModuleMap({ programTitle, modules }: { programTitle: string; modules: CourseModule[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const moduleRefs = useRef<(HTMLDivElement | null)[]>([])
  const photoRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const [paths, setPaths] = useState<string[]>([])
  const [viewport, setViewport] = useState({ width: 0, height: 0 })

  // Row layout: chunks of 3, last row wraps and is centered via CSS
  // (justify-center) rather than the grid — see the module row rendering
  // below.
  const rows: CourseModule[][] = []
  for (let i = 0; i < modules.length; i += 3) rows.push(modules.slice(i, i + 3))

  useLayoutEffect(() => {
    function measure() {
      const container = containerRef.current
      const root = rootRef.current
      const photo = photoRef.current
      const form = formRef.current
      if (!container || !root || !photo || !form) return
      // Only draw connectors when the desktop/tablet (grid) layout is
      // actually active — on mobile everything is display:none for the
      // diagram parts and rects would all read as zero/stacked.
      const isDesktopLayout = window.matchMedia('(min-width: 768px)').matches
      if (!isDesktopLayout) {
        setPaths([])
        return
      }

      const containerRect = container.getBoundingClientRect()
      const rel = (r: DOMRect) => ({
        top: r.top - containerRect.top,
        bottom: r.bottom - containerRect.top,
        left: r.left - containerRect.left,
        right: r.right - containerRect.left,
        centerX: r.left - containerRect.left + r.width / 2,
      })

      const rootBox = rel(root.getBoundingClientRect())
      const nextPaths: string[] = []

      // --- Modules: shared horizontal bus just below the root, one
      // vertical drop per module straight into its box top-center. A
      // module in row 2 shares its column's x with its row-1 counterpart,
      // so its line runs straight down (behind the row-1 box, thanks to
      // z-index — see the JSX below) rather than needing its own elbow. ---
      const busY = rootBox.bottom + Math.max(16, (rows[0] ? rel(moduleRefs.current[0]!.getBoundingClientRect()).top - rootBox.bottom : 32) * 0.4)
      const seenColumnX = new Set<number>()
      modules.forEach((_, i) => {
        const el = moduleRefs.current[i]
        if (!el) return
        const box = rel(el.getBoundingClientRect())
        const x = Math.round(box.centerX)
        if (seenColumnX.has(x)) {
          // Same column as an earlier (row-1) module — the vertical line
          // was already drawn down to that one; this module just needs
          // the segment continuing further down into its own box, which
          // the same straight vertical trunk already covers visually
          // since it's drawn full-length below. Nothing to add.
          return
        }
        seenColumnX.add(x)
        // Full-length vertical for this column, drawn once, deep enough to
        // reach the deepest module sharing this x (row 2 if present).
        const deepest = modules.reduce((maxBottom, __, j) => {
          const jEl = moduleRefs.current[j]
          if (!jEl) return maxBottom
          const jBox = rel(jEl.getBoundingClientRect())
          if (Math.round(jBox.centerX) !== x) return maxBottom
          return Math.max(maxBottom, jBox.top)
        }, box.top)
        nextPaths.push(`M ${rootBox.centerX} ${rootBox.bottom} L ${rootBox.centerX} ${busY} L ${x} ${busY} L ${x} ${deepest}`)
      })

      // --- Photo / Form: routed via the outer left/right rails so they
      // never cross the module grid, and land as a visually distinct
      // parallel group straight from the root (root → rail → bottom row,
      // not root → modules → bottom row). ---
      const railInset = 10
      const railLeftX = railInset
      const railRightX = containerRect.width - railInset
      const photoBox = rel(photo.getBoundingClientRect())
      const formBox = rel(form.getBoundingClientRect())
      const bottomDropY = rootBox.bottom + 16

      nextPaths.push(
        `M ${rootBox.centerX} ${rootBox.bottom} L ${rootBox.centerX} ${bottomDropY} L ${railLeftX} ${bottomDropY} L ${railLeftX} ${photoBox.top - 14} L ${photoBox.centerX} ${photoBox.top - 14} L ${photoBox.centerX} ${photoBox.top}`,
      )
      nextPaths.push(
        `M ${rootBox.centerX} ${rootBox.bottom} L ${rootBox.centerX} ${bottomDropY} L ${railRightX} ${bottomDropY} L ${railRightX} ${formBox.top - 14} L ${formBox.centerX} ${formBox.top - 14} L ${formBox.centerX} ${formBox.top}`,
      )

      setPaths(nextPaths)
      setViewport({ width: containerRect.width, height: containerRect.height })
    }

    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules])

  return (
    <div>
      <p className="text-sm text-ash-gray">
        Схема курса: как программа «{programTitle}» распадается на модули, плюс фото с прошлых заездов и форма
        заявки — оба блока относятся к программе целиком.
      </p>

      <div ref={containerRef} className="relative mt-6">
        <svg
          className="pointer-events-none absolute inset-0 hidden md:block"
          width={viewport.width}
          height={viewport.height}
          aria-hidden="true"
        >
          {paths.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="var(--color-ash-gray)" strokeOpacity={0.35} strokeWidth={1.5} />
          ))}
        </svg>

        <div className="relative flex flex-col items-center gap-3 md:gap-6">
          {/* Level 1 — root */}
          <div
            ref={rootRef}
            className="relative z-10 w-full max-w-sm rounded-2xl border border-black/10 bg-surface px-5 py-4 text-center shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">Программа</p>
            <p className="mt-1 text-base font-semibold text-bone-white">{programTitle}</p>
          </div>

          {/* Level 2 — modules, max 3 per row, remainder centered */}
          <div className="flex w-full flex-col items-stretch gap-3 md:gap-6">
            {rows.map((row, rowIndex) => (
              <ModuleRow
                key={rowIndex}
                row={row}
                startIndex={rowIndex * 3}
                fullRow={rowIndex === 0}
                moduleRefs={moduleRefs}
              />
            ))}
          </div>

          {/* Level 3 — photo + form, always exactly two, direct from root */}
          <div className="mt-1 flex w-full flex-col gap-3 md:flex-row md:justify-center md:mt-4 md:gap-8">
            <div
              ref={photoRef}
              className="relative z-10 flex-1 rounded-2xl border border-black/10 bg-surface px-5 py-4 text-center md:max-w-[280px]"
              style={{ borderColor: 'color-mix(in srgb, var(--color-deep-verdant) 45%, transparent)' }}
            >
              <p className="text-sm font-bold text-bone-white">Фото с обучения</p>
              <p className="mt-1 text-xs text-silver-mist">галерея прошлых заездов</p>
            </div>
            <div
              ref={formRef}
              className="relative z-10 flex-1 rounded-2xl border-2 bg-electric-iris/10 px-5 py-4 text-center md:max-w-[280px]"
              style={{ borderColor: 'var(--color-electric-iris)' }}
            >
              <p className="text-sm font-bold text-electric-iris">Форма заявки</p>
              <p className="mt-1 text-xs text-silver-mist">имя · компания · телефон/email</p>
            </div>
          </div>
        </div>
      </div>

      {/* Text duplication for accessibility/SEO — the diagram above is a
          visual aid, this is the authoritative list of module names. */}
      <ul className="sr-only">
        {modules.map((m) => (
          <li key={m.id}>{m.title}</li>
        ))}
        <li>Фото с обучения</li>
        <li>Форма заявки</li>
      </ul>
    </div>
  )
}

function ModuleRow({
  row,
  startIndex,
  fullRow,
  moduleRefs,
}: {
  row: CourseModule[]
  startIndex: number
  fullRow: boolean
  moduleRefs: RefObject<(HTMLDivElement | null)[]>
}) {
  return (
    <div className={`flex flex-col gap-3 md:flex-row md:gap-6 ${fullRow ? "" : "md:justify-center"}`}>
      {row.map((mod, i) => (
        <div
          key={mod.id}
          ref={(el) => {
            moduleRefs.current[startIndex + i] = el
          }}
          className="relative z-10 flex-1 rounded-2xl border-2 px-5 py-4 md:max-w-[260px]"
          style={{
            borderColor: 'color-mix(in srgb, var(--color-electric-iris) 35%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--color-electric-iris) 6%, var(--color-surface))',
          }}
        >
          <p className="text-sm font-bold text-bone-white">{mod.title}</p>
          <p className="mt-1 text-xs text-silver-mist">{mod.short}</p>
        </div>
      ))}
    </div>
  )
}

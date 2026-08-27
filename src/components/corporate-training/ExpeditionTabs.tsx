import { useRef, useState, type KeyboardEvent } from 'react'
import { Check, Clock, Globe2 } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import type { ExpeditionTab } from '@/data/methodology'

/**
 * Interactive tab navigator for the three expeditions — the same
 * "select a pill, content panel below swaps" pattern as the Huawei page's
 * "Как устроена программа", plus a diagram with hotspot dots kept in sync
 * with the active tab (Section 2 of the methodology brief).
 *
 * Keyboard: standard tablist behavior — Left/Right (and Up/Down) move
 * focus and selection between tabs, Home/End jump to the first/last tab.
 * The hotspot dots are decorative only (aria-hidden, not focusable) since
 * the tabs themselves are the accessible control surface.
 *
 * prefers-reduced-motion: all transition classes are paired with
 * `motion-reduce:transition-none`, so the color/box-shadow swap becomes
 * instant instead of animated.
 */
export function ExpeditionTabs({
  tabs,
  diagramSrc,
  diagramAlt,
  diagramCaptionMask,
  diagramCaption,
}: {
  tabs: ExpeditionTab[]
  diagramSrc: string
  diagramAlt: string
  /**
   * Optional crop mask (in percent of the diagram image itself) hiding a
   * baked-in caption strip inside the source image — e.g. the robotics
   * diagram's untranslated Russian caption. Left undefined for diagrams
   * with no baked-in text (e.g. the restaurant circle diagram).
   */
  diagramCaptionMask?: { left: number; top: number; width: number; height: number }
  /** HTML caption rendered below the diagram, replacing a masked one. */
  diagramCaption?: string
}) {
  const { locale } = useLanguage()
  const [activeIndex, setActiveIndex] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const active = tabs[activeIndex]

  function focusTab(index: number) {
    const wrapped = (index + tabs.length) % tabs.length
    setActiveIndex(wrapped)
    tabRefs.current[wrapped]?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        focusTab(index + 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        focusTab(index - 1)
        break
      case 'Home':
        event.preventDefault()
        focusTab(0)
        break
      case 'End':
        event.preventDefault()
        focusTab(tabs.length - 1)
        break
      default:
        break
    }
  }

  const CalloutIcon = active.calloutIcon === 'clock' ? Clock : active.calloutIcon === 'globe' ? Globe2 : null

  return (
    <div>
      {/* Diagram with hotspots, kept in sync with the active tab */}
      <div className="relative mx-auto w-full max-w-[260px] overflow-hidden rounded-2xl border border-black/10 bg-void p-4 shadow-sm sm:max-w-[300px]">
        <div className="relative">
          <img src={diagramSrc} alt={diagramAlt} className="w-full" />
          {diagramCaptionMask && (
            <div
              aria-hidden="true"
              className="absolute bg-surface"
              style={{
                left: `${diagramCaptionMask.left}%`,
                top: `${diagramCaptionMask.top}%`,
                width: `${diagramCaptionMask.width}%`,
                height: `${diagramCaptionMask.height}%`,
              }}
            />
          )}
        </div>
        {tabs.map((tab, i) => (
          <span
            key={tab.id}
            aria-hidden="true"
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-[background-color,box-shadow] duration-200 motion-reduce:transition-none"
            style={{
              left: `${tab.hotspot.x}%`,
              top: `${tab.hotspot.y}%`,
              borderColor: 'var(--color-electric-iris)',
              backgroundColor:
                i === activeIndex ? 'var(--color-electric-iris)' : 'var(--color-void)',
              boxShadow:
                i === activeIndex
                  ? '0 0 0 5px color-mix(in srgb, var(--color-electric-iris) 25%, transparent)'
                  : 'none',
            }}
          />
        ))}
      </div>
      {diagramCaption && <p className="mt-2 text-center text-xs text-ash-gray">{diagramCaption}</p>}

      {/* Tabs */}
      <div
        role="tablist"
        aria-label={locale === 'ru' ? 'Три экспедиции' : 'Three expeditions'}
        className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-3"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`expedition-tab-${tab.id}`}
            aria-selected={i === activeIndex}
            aria-controls={`expedition-panel-${tab.id}`}
            tabIndex={i === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(i)}
            onKeyDown={(event) => onKeyDown(event, i)}
            className={`flex-1 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-iris ${
              i === activeIndex
                ? 'border-electric-iris bg-electric-iris/10 text-bone-white'
                : 'border-black/10 bg-surface/60 text-silver-mist hover:text-bone-white'
            }`}
          >
            <span className="text-electric-iris">{tab.numberLabel} · </span>
            {locale === 'ru' ? tab.tabTitle : tab.tabTitle_en}
          </button>
        ))}
      </div>

      {/* Active panel */}
      <div
        role="tabpanel"
        id={`expedition-panel-${active.id}`}
        aria-labelledby={`expedition-tab-${active.id}`}
        className="mt-6 rounded-2xl border border-black/10 bg-surface/60 p-6 sm:p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.025em] text-saffron-spark">
          {locale === 'ru' ? active.badge : active.badge_en}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-bone-white">
          {locale === 'ru' ? active.title : active.title_en}
        </h3>
        <p className="mt-3 text-sm text-silver-mist">{locale === 'ru' ? active.lede : active.lede_en}</p>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">
          {locale === 'ru' ? 'Что смотрим' : 'What we look at'}
        </p>
        <ul className="mt-2.5 flex flex-col gap-2">
          {(locale === 'ru' ? active.whatWeSee : active.whatWeSee_en).map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-bone-white">
              <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-electric-iris" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">
          {locale === 'ru' ? 'С кем встречаемся' : 'Who we meet'}
        </p>
        <ul className="mt-2.5 flex flex-col gap-2">
          {(locale === 'ru' ? active.whoWeMeet : active.whoWeMeet_en).map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-bone-white">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ash-gray" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex gap-3 rounded-xl bg-electric-iris/10 p-4">
          {CalloutIcon && (
            <CalloutIcon size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-electric-iris" aria-hidden="true" />
          )}
          <p className="text-sm text-bone-white">
            <span className="font-semibold">{locale === 'ru' ? active.calloutTitle : active.calloutTitle_en}. </span>
            {locale === 'ru' ? active.calloutText : active.calloutText_en}
          </p>
        </div>
      </div>
    </div>
  )
}

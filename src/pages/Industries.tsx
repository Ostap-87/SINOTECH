import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage, pick } from '@/i18n/LanguageContext'
import { companiesData } from '@/data'
import { ParticleCanvas } from '@/components/ParticleCanvas'

// Fully visible by SCROLL_FADE_END pixels of scroll, invisible at the top —
// the map assembles into view as you scroll down through the sector list,
// rather than competing with the hero copy right at the top of the page.
const SCROLL_FADE_START = 80
const SCROLL_FADE_END = 480
const MAX_BACKDROP_OPACITY = 0.4

export function Industries() {
  const { locale } = useLanguage()
  const navigate = useNavigate()
  const [backdropOpacity, setBackdropOpacity] = useState(0)

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY
      const progress = Math.min(1, Math.max(0, (y - SCROLL_FADE_START) / (SCROLL_FADE_END - SCROLL_FADE_START)))
      setBackdropOpacity(progress * MAX_BACKDROP_OPACITY)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const sectorCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const company of companiesData.companies) {
      counts.set(company.sector, (counts.get(company.sector) ?? 0) + 1)
    }
    return counts
  }, [])

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 ease-out"
        style={{ opacity: backdropOpacity }}
        aria-hidden="true"
      >
        <ParticleCanvas shape="china" />
      </div>

      <div className="relative z-10">
        <section className="mx-auto max-w-[1280px] px-6 py-16 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.025em] text-saffron-spark">
            {locale === 'ru' ? 'Каталог' : 'Catalog'}
          </p>
          <h1 className="mt-6 max-w-2xl text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[48px] lg:text-[56px]">
            {locale === 'ru' ? 'Какую индустрию хотите изучить?' : 'Which industry would you like to explore?'}
          </h1>
          <p className="mt-4 max-w-xl text-lg font-normal text-silver-mist">
            {locale === 'ru'
              ? 'Выберите отрасль — и решите, взять готовый тур или собрать свой.'
              : 'Pick a sector, then choose a ready-made tour or build your own.'}
          </p>
        </section>

        <section className="mx-auto max-w-[1280px] px-6 pb-24">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companiesData.sectors.map((sector) => {
              return (
                <button
                  key={sector.code}
                  type="button"
                  data-sector={sector.code}
                  onClick={() => navigate(`/industries/${sector.code}`)}
                  className="group flex items-center justify-between rounded-2xl border border-black/10 bg-surface/70 px-5 py-4 text-left backdrop-blur-sm transition-colors hover:border-electric-iris/60 hover:bg-surface/90"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: sector.color }}
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block text-base font-medium text-bone-white">
                        {pick(sector, 'label', locale)}
                      </span>
                      <span className="mt-0.5 block text-xs text-ash-gray">
                        {sectorCounts.get(sector.code) ?? 0} {locale === 'ru' ? 'компаний' : 'companies'}
                      </span>
                    </span>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="shrink-0 text-ash-gray transition-transform group-hover:translate-x-1 group-hover:text-electric-iris"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}

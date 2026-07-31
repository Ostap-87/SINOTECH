import { useMemo, useRef } from 'react'
import { useLanguage, pick } from '@/i18n/LanguageContext'
import { companiesData } from '@/data'
import { ParticleCanvas } from '@/components/ParticleCanvas'
import type { ParticleCanvasHandle } from '@/components/ParticleCanvas'
import { useShapeExitNavigate } from '@/hooks/useShapeExitNavigate'
import { usePageMeta } from '@/hooks/usePageMeta'

export function Industries() {
  const { locale } = useLanguage()
  const canvasHandleRef = useRef<ParticleCanvasHandle>(null)
  const { goTo, isLeaving, durationMs } = useShapeExitNavigate(canvasHandleRef)

  usePageMeta(
    locale === 'ru' ? 'Индустрии — Sinotech Voyage' : 'Industries — Sinotech Voyage',
    locale === 'ru'
      ? 'Каталог из 350+ китайских компаний по 17 отраслям — от робототехники и автопрома до биотеха и финтеха. Выберите индустрию и посмотрите готовые программы.'
      : 'A catalogue of 350+ Chinese companies across 17 sectors — from robotics and automotive to biotech and fintech. Pick a sector and see ready-made programmes.',
  )

  const sectorCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const company of companiesData.companies) {
      counts.set(company.sector, (counts.get(company.sector) ?? 0) + 1)
    }
    return counts
  }, [])

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <ParticleCanvas ref={canvasHandleRef} shape="china" />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
          style={{
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            maskImage: 'linear-gradient(to bottom, transparent, black)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 pb-16 pt-[26px] lg:pb-20 lg:pt-[42px]">
        <div
          className="pointer-events-none"
          style={{ opacity: isLeaving ? 0 : 1, transition: `opacity ${durationMs}ms ease-in-out` }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.025em] text-saffron-spark">
            {locale === 'ru' ? 'Каталог' : 'Catalog'}
          </p>
          <h1 className="mt-6 max-w-2xl text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[48px] lg:text-[56px]">
            {locale === 'ru' ? 'Какую индустрию хотите изучить?' : 'Which industry would you like to explore?'}
          </h1>
          <p className="mt-4 max-w-xl text-lg font-normal text-silver-mist">
            {locale === 'ru'
              ? 'Наш каталог состоит из более чем 350 компаний и 17 отраслей — решайте, взять готовый тур или собрать свой.'
              : 'Our catalogue holds over 350 companies across 17 sectors — take a ready-made tour or build your own.'}
          </p>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-3">
          {companiesData.sectors.map((sector) => (
            <button
              key={sector.code}
              type="button"
              data-sector={sector.code}
              onClick={() => goTo(`/industries/${sector.code}`)}
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
          ))}
        </div>
      </div>
    </section>
  )
}

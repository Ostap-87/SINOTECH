import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage, pick } from '@/i18n/LanguageContext'
import { toursData } from '@/data'
import { useSelectedCountry } from '@/context/SelectedCountryContext'
import { COUNTRY_SHAPES } from '@/data/countryShapes'
import { ParticleCanvas } from '@/components/ParticleCanvas'
import type { ParticleCanvasHandle } from '@/components/ParticleCanvas'
import { ExpeditionsTabs } from '@/components/ExpeditionsTabs'
import { useShapeExitNavigate } from '@/hooks/useShapeExitNavigate'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ShimmerText } from '@/components/ShimmerText'
import { RevealText } from '@/components/RevealText'

export function ExpeditionsReady() {
  const { locale } = useLanguage()
  const { countryCode } = useSelectedCountry()
  const country = COUNTRY_SHAPES[countryCode] ?? COUNTRY_SHAPES.cn
  const tours = useMemo(
    () => toursData.tours.filter((tour) => tour.country === countryCode),
    [countryCode],
  )
  const canvasHandleRef = useRef<ParticleCanvasHandle>(null)
  const { goTo, isLeaving, durationMs } = useShapeExitNavigate(canvasHandleRef)

  usePageMeta(
    locale === 'ru' ? 'Экспедиции — Global Tech Tour' : 'Expeditions — Global Tech Tour',
    locale === 'ru'
      ? 'Курируемые программы по приоритетным нишам — маршрут, компании и логистика уже собраны.'
      : 'Curated programmes for priority niches — route, companies and logistics already put together.',
  )

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[820px] lg:h-[720px]">
        <ParticleCanvas ref={canvasHandleRef} shape={country.shape} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, transparent 35%, var(--color-void) 92%, var(--color-void) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 pb-24 lg:pt-20">
        <div
          className="pointer-events-none"
          style={{ opacity: isLeaving ? 0 : 1, transition: `opacity ${durationMs}ms ease-in-out` }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.025em]">
            <ShimmerText variant="saffron" text={locale === 'ru' ? 'Каталог' : 'Catalog'} />
          </p>
          <h1 className="mt-6 max-w-2xl text-[36px] font-normal leading-[1.05] tracking-[-0.04em] sm:text-[48px] lg:text-[56px]">
            <RevealText
              text={locale === 'ru' ? `Экспедиции: ${country.name_ru}` : `Expeditions: ${country.name_en}`}
            />
          </h1>
          <p className="mt-4 max-w-xl text-lg font-normal text-silver-mist">
            {locale === 'ru'
              ? 'Курируемые программы по приоритетным нишам — маршрут, компании и логистика уже собраны.'
              : 'Curated programs for priority niches — route, companies, and logistics already assembled.'}
          </p>
        </div>

        <div className="pointer-events-auto mt-9">
          <ExpeditionsTabs onCustom={(event) => goTo('/industries', event)} />
        </div>

        {tours.length === 0 && (
          <div className="mt-9 rounded-2xl border border-dashed border-black/15 bg-surface/50 p-10 text-center backdrop-blur-sm">
            <p className="text-lg font-medium text-bone-white">
              {locale === 'ru'
                ? `Готовые программы для страны «${country.name_ru}» пока не собраны — загляните позже.`
                : `Ready-made programs for ${country.name_en} aren't assembled yet — check back soon.`}
            </p>
          </div>
        )}

        <div className="mt-9 grid grid-cols-1 gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => (
            <Link
              key={tour.tour_id}
              to={`/expeditions/${tour.tour_id}`}
              onClick={(event) => goTo(`/expeditions/${tour.tour_id}`, event)}
              className="group flex flex-col rounded-2xl border border-black/10 bg-surface/70 p-5 backdrop-blur-sm transition-colors hover:border-electric-iris/60 hover:bg-surface/90"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">
                {pick(tour, 'eyebrow', locale)}
              </p>
              <h2 className="mt-2 text-xl font-medium tracking-[-0.02em] text-bone-white">
                {pick(tour, 'title', locale)}
              </h2>
              <p className="mt-1 text-sm text-electric-iris">{pick(tour, 'tagline', locale)}</p>
              <p className="mt-3 flex-1 text-sm text-silver-mist">{pick(tour, 'positioning', locale)}</p>

              <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4">
                <div className="flex gap-4 text-xs text-ash-gray">
                  <span>
                    <span className="font-semibold text-bone-white">{tour.stats.cities}</span>{' '}
                    {locale === 'ru' ? 'города' : 'cities'}
                  </span>
                  <span>
                    <span className="font-semibold text-bone-white">{tour.stats.days}</span>{' '}
                    {locale === 'ru' ? 'дней' : 'days'}
                  </span>
                  <span>
                    <span className="font-semibold text-bone-white">{tour.stats.companies}</span>{' '}
                    {locale === 'ru' ? 'компаний' : 'companies'}
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
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

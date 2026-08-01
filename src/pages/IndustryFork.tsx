import { useMemo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage, pick } from '@/i18n/LanguageContext'
import { companiesData, toursData } from '@/data'
import { ParticleCanvas } from '@/components/ParticleCanvas'
import type { ParticleCanvasHandle } from '@/components/ParticleCanvas'
import { useShapeExitNavigate } from '@/hooks/useShapeExitNavigate'
import { usePageMeta } from '@/hooks/usePageMeta'
import { Placeholder } from './Placeholder'

export function IndustryFork() {
  const { locale } = useLanguage()
  const { sector: sectorCode } = useParams<{ sector: string }>()
  const canvasHandleRef = useRef<ParticleCanvasHandle>(null)
  const { goTo, isLeaving, durationMs } = useShapeExitNavigate(canvasHandleRef)

  const sector = companiesData.sectors.find((s) => s.code === sectorCode)

  const companyCount = useMemo(
    () => companiesData.companies.filter((c) => c.sector === sectorCode).length,
    [sectorCode],
  )

  const readyTour = toursData.tours.find((tour) => tour.sector === sectorCode)

  const sectorLabel = sector ? pick(sector, 'label', locale) : null
  usePageMeta(
    sectorLabel
      ? `${sectorLabel} — Global Tech Tour`
      : locale === 'ru'
        ? 'Индустрия — Global Tech Tour'
        : 'Industry — Global Tech Tour',
    sectorLabel
      ? locale === 'ru'
        ? `${companyCount} компаний в отрасли «${sectorLabel}» — готовые экспедиции или соберите свою программу.`
        : `${companyCount} companies in the "${sectorLabel}" sector — ready expeditions or build your own programme.`
      : undefined,
    { noindex: !sector },
  )

  if (!sector) {
    return (
      <Placeholder
        title_ru="Отрасль не найдена"
        title_en="Sector not found"
        note_ru="Вернитесь к списку индустрий и выберите отрасль ещё раз."
        note_en="Go back to the industries list and pick a sector again."
      />
    )
  }

  const readyTourPath = readyTour ? `/expeditions/${readyTour.tour_id}` : '/expeditions'
  const constructorPath = `/constructor?sector=${sector.code}`

  return (
    <section className="relative min-h-[720px] overflow-hidden">
      <div className="absolute inset-0">
        <ParticleCanvas ref={canvasHandleRef} shape="china" layout="centered" />
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

      <div
        className="pointer-events-none relative z-10 mx-auto max-w-[1280px] px-6 py-16 lg:py-20"
        style={{ opacity: isLeaving ? 0 : 1, transition: `opacity ${durationMs}ms ease-in-out` }}
      >
        <Link
          to="/industries"
          onClick={(event) => goTo('/industries', event)}
          className="pointer-events-auto inline-flex items-center gap-1 text-sm text-ash-gray hover:text-bone-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          {locale === 'ru' ? 'Все индустрии' : 'All industries'}
        </Link>

        <div className="mx-auto max-w-2xl text-center">
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.025em] text-saffron-spark">
            {companyCount} {locale === 'ru' ? 'компаний в каталоге' : 'companies in catalogue'}
          </p>
          <h1 className="mt-3 text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[48px] lg:text-[56px]">
            {pick(sector, 'label', locale)}
          </h1>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          <Link
            to={readyTourPath}
            onClick={(event) => goTo(readyTourPath, event)}
            className="pointer-events-auto rounded-2xl border border-black/10 bg-surface/60 p-8 text-center transition-colors hover:border-electric-iris/60"
          >
            <h2 className="text-xl font-medium">{locale === 'ru' ? 'Экспедиции' : 'Expeditions'}</h2>
            <p className="mt-3 text-base text-bone-white">
              {readyTour
                ? locale === 'ru'
                  ? `Есть готовая программа: «${readyTour.title_ru}»`
                  : `A ready itinerary exists: "${readyTour.title_en}"`
                : locale === 'ru'
                  ? 'Для этой отрасли пока нет готовой программы — посмотрите весь каталог экспедиций.'
                  : "No ready itinerary for this sector yet — browse the full expedition catalog."}
            </p>
          </Link>

          <Link
            to={constructorPath}
            onClick={(event) => goTo(constructorPath, event)}
            className="pointer-events-auto rounded-2xl border border-black/10 bg-surface/60 p-8 text-center transition-colors hover:border-electric-iris/60"
          >
            <h2 className="text-xl font-medium">{locale === 'ru' ? 'Собрать свой' : 'Build your own'}</h2>
            <p className="mt-3 text-base text-bone-white">
              {locale === 'ru'
                ? 'Выберите формат (2 или 5 дней) и отметьте компании — мы соберём программу на основе вашего списка.'
                : 'Pick a format (2 or 5 days) and mark companies — we’ll assemble the program from your list.'}
            </p>
          </Link>
        </div>
      </div>
    </section>
  )
}

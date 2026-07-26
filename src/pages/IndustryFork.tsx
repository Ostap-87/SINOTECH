import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage, pick } from '@/i18n/LanguageContext'
import { companiesData, toursData } from '@/data'
import { ParticleCanvas } from '@/components/ParticleCanvas'
import { shapeKeyForSector } from '@/three/shapes'
import { Placeholder } from './Placeholder'

export function IndustryFork() {
  const { locale } = useLanguage()
  const { sector: sectorCode } = useParams<{ sector: string }>()

  const sector = companiesData.sectors.find((s) => s.code === sectorCode)

  const companyCount = useMemo(
    () => companiesData.companies.filter((c) => c.sector === sectorCode).length,
    [sectorCode],
  )

  const readyTour = toursData.tours.find((tour) => tour.sector === sectorCode)

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

  return (
    <section className="relative min-h-[640px] overflow-hidden">
      <div className="absolute inset-0">
        <ParticleCanvas shape={shapeKeyForSector(sector.code)} />
      </div>

      <div className="pointer-events-none relative z-10 mx-auto max-w-[1280px] px-6 py-16 lg:py-20">
        <Link
          to="/industries"
          className="pointer-events-auto inline-flex items-center gap-1 text-sm text-ash-gray hover:text-bone-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          {locale === 'ru' ? 'Все индустрии' : 'All industries'}
        </Link>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.025em] text-saffron-spark">
          {companyCount} {locale === 'ru' ? 'компаний в каталоге' : 'companies in catalogue'}
        </p>
        <h1 className="mt-3 max-w-2xl text-[36px] font-normal leading-[1.05] tracking-[-0.04em] sm:text-[48px] lg:text-[56px]">
          {pick(sector, 'label', locale)}
        </h1>

        <div className="mt-12 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            to={readyTour ? `/tours#${readyTour.tour_id}` : '/tours'}
            className="pointer-events-auto rounded-2xl border border-white/10 bg-surface/60 p-6 transition-colors hover:border-electric-iris/60"
          >
            <h2 className="text-lg font-medium">{locale === 'ru' ? 'Готовые туры' : 'Ready-made tours'}</h2>
            <p className="mt-2 text-sm text-silver-mist">
              {readyTour
                ? locale === 'ru'
                  ? `Есть готовая программа: «${readyTour.title_ru}»`
                  : `A ready itinerary exists: "${readyTour.title_en}"`
                : locale === 'ru'
                  ? 'Для этой отрасли пока нет готовой программы — посмотрите весь каталог туров.'
                  : "No ready itinerary for this sector yet — browse the full tour catalog."}
            </p>
          </Link>

          <Link
            to={`/constructor?sector=${sector.code}`}
            className="pointer-events-auto rounded-2xl border border-white/10 bg-surface/60 p-6 transition-colors hover:border-electric-iris/60"
          >
            <h2 className="text-lg font-medium">{locale === 'ru' ? 'Собрать свой' : 'Build your own'}</h2>
            <p className="mt-2 text-sm text-silver-mist">
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

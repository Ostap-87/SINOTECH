import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage, pick } from '@/i18n/LanguageContext'
import { companiesData, toursData, getCity, getSector, companyNameZh } from '@/data'
import { usePageMeta } from '@/hooks/usePageMeta'
import { CompanyMark } from '@/components/CompanyMark'
import { RevealText } from '@/components/RevealText'
import { Placeholder } from './Placeholder'

export function CompanyDetail() {
  const { locale } = useLanguage()
  const { id } = useParams<{ id: string }>()

  const company = companiesData.companies.find((c) => c.id === id)

  const relatedTours = useMemo(() => {
    if (!company) return []
    return toursData.tours.filter((tour) => tour.itinerary.some((day) => day.companies?.includes(company.id)))
  }, [company])

  usePageMeta(
    company ? `${companyNameZh(company)} — Global Tech Tour` : locale === 'ru' ? 'Компания — Global Tech Tour' : 'Company — Global Tech Tour',
    company ? pick(company, 'desc', locale) : undefined,
    { noindex: !company },
  )

  if (!company) {
    return (
      <Placeholder
        title_ru="Компания не найдена"
        title_en="Company not found"
        note_ru="Вернитесь в каталог компаний и выберите ещё раз."
        note_en="Go back to the companies catalogue and pick again."
      />
    )
  }

  const sector = getSector(company.sector)
  const city = getCity(company.city)
  const region = city ? companiesData.regions.find((r) => r.code === city.region) : undefined
  const businessArea = company.category_ru || company.category_en ? pick(company, 'category', locale) : null

  return (
    <section className="mx-auto w-full max-w-[900px] px-6 py-16 lg:py-20">
      <Link
        to="/companies"
        className="inline-flex items-center gap-1 text-sm text-ash-gray hover:text-bone-white"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        {locale === 'ru' ? 'Все компании' : 'All companies'}
      </Link>

      <div className="mt-8 flex items-center gap-5">
        <CompanyMark company={company} size={72} />
        <div className="min-w-0">
          <h1 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-bone-white sm:text-[40px]">
            <RevealText text={company.name_en} />
          </h1>
          <p className="mt-1 text-xl text-silver-mist">{company.name_zh}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {sector && (
          <Link
            to={`/companies?sector=${sector.code}`}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors hover:border-electric-iris/60 hover:text-bone-white"
            style={{ color: sector.color, borderColor: `${sector.color}55` }}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: sector.color }} aria-hidden="true" />
            {pick(sector, 'label', locale)}
          </Link>
        )}
        {city && (
          <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-ash-gray">
            {pick(city, 'name', locale)}
            {region ? ` · ${locale === 'ru' ? region.ru : region.en}` : ''}
          </span>
        )}
        {company.own_supplier && (
          <span className="rounded-full border border-electric-iris/40 bg-electric-iris/10 px-3 py-1 text-xs text-electric-iris">
            {locale === 'ru' ? 'Прямой партнёр Aura' : 'Direct Aura partner'}
          </span>
        )}
      </div>

      <div className="mt-10 rounded-2xl border border-black/10 bg-surface/60 p-6 sm:p-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.025em] text-ash-gray">
          {locale === 'ru' ? 'Сфера деятельности' : 'Business focus'}
        </h2>
        <p className="mt-2 text-lg text-bone-white">{businessArea ?? (sector ? pick(sector, 'label', locale) : '—')}</p>

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-[0.025em] text-ash-gray">
          {locale === 'ru' ? 'Описание' : 'Description'}
        </h2>
        <p className="mt-2 text-base text-silver-mist">{pick(company, 'desc', locale)}</p>
      </div>

      {relatedTours.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.025em] text-ash-gray">
            {locale === 'ru' ? 'В программах' : 'Featured in programmes'}
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {relatedTours.map((tour) => (
              <Link
                key={tour.tour_id}
                to={`/expeditions/${tour.tour_id}`}
                className="rounded-2xl border border-black/10 bg-surface/60 p-4 transition-colors hover:border-electric-iris/60"
              >
                <p className="text-sm font-medium text-bone-white">{pick(tour, 'title', locale)}</p>
                <p className="mt-1 text-xs text-ash-gray">{pick(tour, 'tagline', locale)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link
        to={`/constructor?sector=${company.sector}`}
        className="mt-10 inline-flex items-center justify-center rounded-full bg-electric-iris px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        {locale === 'ru' ? 'Собрать программу с этой компанией' : 'Build a programme around this company'}
      </Link>
    </section>
  )
}

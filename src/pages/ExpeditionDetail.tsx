import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage, pick } from '@/i18n/LanguageContext'
import { toursData, companiesData, getSector, companyNameZh } from '@/data'
import { RouteMap } from '@/components/RouteMap'
import type { RouteMapStop, RouteMapHandle, RouteMapCountry } from '@/components/RouteMap'
import { ParticleCanvas } from '@/components/ParticleCanvas'
import type { ParticleCanvasHandle } from '@/components/ParticleCanvas'
import { COUNTRY_SHAPES } from '@/data/countryShapes'
import { useShapeExitNavigate } from '@/hooks/useShapeExitNavigate'
import { usePageMeta } from '@/hooks/usePageMeta'
import { Placeholder } from './Placeholder'

function formatRub(amount: number | null | undefined, locale: 'ru' | 'en'): string {
  if (amount == null) return locale === 'ru' ? 'уточняется' : 'on request'
  return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US').format(amount) + ' ₽'
}

function companyName(id: string): string {
  const company = companiesData.companies.find((c) => c.id === id)
  return company ? companyNameZh(company) : id
}

function buildRouteStops(tour: (typeof toursData.tours)[number], locale: 'ru' | 'en'): RouteMapStop[] {
  return tour.itinerary.map((day) => ({
    key: `${tour.tour_id}-${day.day}`,
    day: day.day,
    cityId: day.city,
    cityLabel: locale === 'ru' ? day.city_ru : day.city_en,
    companies: day.companies.map(companyName),
    legMode: 'leg_mode' in day ? (day.leg_mode as 'flight' | 'train') : undefined,
  }))
}

function CompanyChip({ companyId, locale }: { companyId: string; locale: 'ru' | 'en' }) {
  const [hovered, setHovered] = useState(false)
  const company = companiesData.companies.find((c) => c.id === companyId)
  if (!company) return <span className="text-sm text-silver-mist">{companyId}</span>

  const sector = getSector(company.sector)
  const city = companiesData.cities.find((c) => c.id === company.city)

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="cursor-default text-sm text-silver-mist underline decoration-dotted decoration-ash-gray/60 underline-offset-4 transition-colors hover:text-electric-iris">
        {companyNameZh(company)}
      </span>
      {hovered && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-xl border border-black/10 bg-void p-3 text-left shadow-[0_20px_40px_rgba(0,0,0,0.15)]">
          <span className="block text-sm font-medium text-bone-white">{companyNameZh(company)}</span>
          <span className="mt-0.5 block text-xs text-ash-gray">
            {sector ? (locale === 'ru' ? sector.label_ru : sector.label_en) : company.sector}
            {city ? ` · ${locale === 'ru' ? city.name_ru : city.name_en}` : ''}
          </span>
          <span className="mt-2 block text-xs text-silver-mist">
            {locale === 'ru' ? company.desc_ru : company.desc_en}
          </span>
        </span>
      )}
    </span>
  )
}

export function ExpeditionDetail() {
  const { locale } = useLanguage()
  const { tourId } = useParams<{ tourId: string }>()
  const canvasHandleRef = useRef<ParticleCanvasHandle>(null)
  const { goTo, isLeaving, durationMs } = useShapeExitNavigate(canvasHandleRef)
  const routeMapRef = useRef<RouteMapHandle>(null)

  const tour = toursData.tours.find((t) => t.tour_id === tourId)

  usePageMeta(
    tour
      ? `${pick(tour, 'title', locale)} — Global Tech Tour`
      : locale === 'ru'
        ? 'Экспедиция — Global Tech Tour'
        : 'Expedition — Global Tech Tour',
    tour ? pick(tour, 'positioning', locale) : undefined,
    { noindex: !tour },
  )

  if (!tour) {
    return (
      <Placeholder
        title_ru="Экспедиция не найдена"
        title_en="Expedition not found"
        note_ru="Вернитесь к списку экспедиций и выберите программу ещё раз."
        note_en="Go back to the expeditions list and pick a program again."
      />
    )
  }

  const hasPricing = tour.pricing.total_excl_flights != null
  // Раньше карта и фон были жёстко "china" для всех туров — для Кореи и
  // будущих стран это рисовало контур Китая с корейскими городами внутри,
  // географически бессмысленно. COUNTRY_SHAPES уже даёт нужное сопоставление
  // (используется для превью стран), тут просто переиспользуем его.
  const mapCountry = (COUNTRY_SHAPES[tour.country]?.shape ?? 'china') as RouteMapCountry

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[820px] lg:h-[720px]">
        <ParticleCanvas ref={canvasHandleRef} shape={mapCountry} />
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
          <Link
            to="/expeditions"
            onClick={(event) => goTo('/expeditions', event)}
            className="pointer-events-auto inline-flex items-center gap-1 text-sm text-ash-gray hover:text-bone-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            {locale === 'ru' ? 'Все экспедиции' : 'All expeditions'}
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">
            {pick(tour, 'eyebrow', locale)}
          </p>
          <h1 className="mt-3 text-[36px] font-normal tracking-[-0.02em] sm:text-[42px]">
            {pick(tour, 'title', locale)}
          </h1>
          <p className="mt-2 text-sm text-electric-iris">{pick(tour, 'tagline', locale)}</p>
          <p className="mt-4 max-w-2xl text-silver-mist">{pick(tour, 'positioning', locale)}</p>
        </div>

        <dl className="mt-9 grid grid-cols-2 gap-6 sm:grid-cols-5">
          <div>
            <dt className="text-xs uppercase text-ash-gray">{locale === 'ru' ? 'Города' : 'Cities'}</dt>
            <dd className="mt-1 text-2xl text-bone-white">{tour.stats.cities}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-ash-gray">{locale === 'ru' ? 'Дней' : 'Days'}</dt>
            <dd className="mt-1 text-2xl text-bone-white">{tour.stats.days}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-ash-gray">{locale === 'ru' ? 'Ночей' : 'Nights'}</dt>
            <dd className="mt-1 text-2xl text-bone-white">{tour.stats.nights}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-ash-gray">{locale === 'ru' ? 'Компаний' : 'Companies'}</dt>
            <dd className="mt-1 text-2xl text-bone-white">{tour.stats.companies}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-ash-gray">{locale === 'ru' ? 'Перелётов' : 'Flights'}</dt>
            <dd className="mt-1 text-2xl text-bone-white">{tour.stats.flights}</dd>
          </div>
        </dl>

        <p className="mt-6 text-sm text-ash-gray">
          {locale === 'ru' ? 'Прилёт' : 'Arrival'}: {pick(tour, 'arrival', locale)} ·{' '}
          {locale === 'ru' ? 'Вылет' : 'Departure'}: {pick(tour, 'departure', locale)}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-stretch">
          <div className="flex h-full flex-col">
            <h3 className="text-lg font-medium">{locale === 'ru' ? 'Маршрут' : 'Route'}</h3>
            <RouteMap
              ref={routeMapRef}
              stops={buildRouteStops(tour, locale)}
              className="mt-4 flex-1"
              country={mapCountry}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium">{locale === 'ru' ? 'Программа по дням' : 'Day-by-day'}</h3>
            <ol className="mt-4 space-y-4">
              {tour.itinerary.map((day) => (
                <li
                  key={day.day}
                  onClick={() => routeMapRef.current?.goToDay(day.day)}
                  className="day-tile cursor-pointer rounded-xl border border-black/10 bg-surface/40 p-4 transition-colors hover:border-electric-iris/50"
                >
                  <p className="text-sm font-medium text-bone-white">
                    {locale === 'ru' ? 'День' : 'Day'} {day.day} ·{' '}
                    {locale === 'ru' ? day.city_ru : day.city_en} · {day.time}
                  </p>
                  <p className="mt-1 text-xs text-ash-gray">{locale === 'ru' ? day.area_ru : day.area_en}</p>
                  <p className="mt-2 flex flex-wrap gap-x-1 gap-y-1 text-sm text-silver-mist">
                    {day.companies.map((companyId, i) => (
                      <span key={companyId}>
                        <CompanyChip companyId={companyId} locale={locale} />
                        {i < day.companies.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </p>
                  {(() => {
                    const d = day as unknown as {
                      transfer_ru?: string
                      transfer_en?: string
                      note_ru?: string
                      note_en?: string
                    }
                    const text = locale === 'ru' ? d.transfer_ru ?? d.note_ru : d.transfer_en ?? d.note_en
                    return text && <p className="mt-2 text-xs text-electric-iris">{text}</p>
                  })()}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-black/10 bg-surface/40 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.025em] text-ash-gray">
              {locale === 'ru' ? 'В программу входит' : "What's included"}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-silver-mist">
              {tour.includes.map((item) => (
                <li key={item.ru} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-electric-iris" />
                  {locale === 'ru' ? item.ru : item.en}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-black/10 bg-surface/40 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.025em] text-ash-gray">
              {pick(tour.pricing, 'total_label', locale)}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-silver-mist">
              {tour.pricing.items.map((item) => (
                <li key={item.n} className="flex items-center justify-between gap-4">
                  <span>{pick(item, 'title', locale)}</span>
                  <span className="shrink-0 text-bone-white">{formatRub(item.amount, locale)}</span>
                </li>
              ))}
            </ul>
            {hasPricing && (
              <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4 text-base">
                <span className="font-medium">{pick(tour.pricing, 'total_label', locale)}</span>
                <span className="font-medium text-bone-white">
                  {formatRub(tour.pricing.total_excl_flights, locale)}
                </span>
              </div>
            )}
            {tour.pricing.extras.map((extra) => (
              <p key={extra.title_ru} className="mt-2 text-xs text-ash-gray">
                + {pick(extra, 'title', locale)}: {formatRub(extra.amount, locale)} ({pick(extra, 'note', locale)})
              </p>
            ))}
            <p className="mt-3 text-xs text-ash-gray">{pick(tour.pricing, 'basis', locale)}</p>
          </div>
        </div>

        <Link
          to="/contacts"
          onClick={(event) => goTo('/contacts', event)}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-electric-iris px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
        >
          {locale === 'ru' ? 'Оставить заявку' : 'Get in touch'}
        </Link>
      </div>
    </section>
  )
}

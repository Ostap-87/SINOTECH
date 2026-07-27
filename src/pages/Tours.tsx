import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage, pick } from '@/i18n/LanguageContext'
import { toursData, companiesData, getSector } from '@/data'
import { RouteMap } from '@/components/RouteMap'
import type { RouteMapStop, RouteMapHandle } from '@/components/RouteMap'
import { ParticleCanvas } from '@/components/ParticleCanvas'
import type { ParticleCanvasHandle } from '@/components/ParticleCanvas'
import { useShapeExitNavigate } from '@/hooks/useShapeExitNavigate'

function formatRub(amount: number, locale: 'ru' | 'en') {
  return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US').format(amount) + ' ₽'
}

function companyName(id: string): string {
  return companiesData.companies.find((c) => c.id === id)?.name_en ?? id
}

function buildRouteStops(tour: (typeof toursData.tours)[number], locale: 'ru' | 'en'): RouteMapStop[] {
  return tour.itinerary.map((day) => ({
    key: `${tour.tour_id}-${day.day}`,
    day: day.day,
    cityId: day.city,
    cityLabel: locale === 'ru' ? day.city_ru : day.city_en,
    companies: day.companies.map(companyName),
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
        {company.name_en}
      </span>
      {hovered && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-xl border border-black/10 bg-void p-3 text-left shadow-[0_20px_40px_rgba(0,0,0,0.15)]">
          <span className="block text-sm font-medium text-bone-white">{company.name_en}</span>
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

function TourArticle({
  tour,
  index,
  locale,
  goTo,
}: {
  tour: (typeof toursData.tours)[number]
  index: number
  locale: 'ru' | 'en'
  goTo: (path: string, event?: { button?: number; metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; preventDefault: () => void }) => void
}) {
  const routeMapRef = useRef<RouteMapHandle>(null)

  return (
    <article
      id={tour.tour_id}
      className={`scroll-mt-24 ${index > 0 ? 'border-t border-black/10 pt-12' : ''}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">
        {pick(tour, 'eyebrow', locale)}
      </p>
      <h2 className="mt-3 text-3xl font-normal tracking-[-0.02em]">{pick(tour, 'title', locale)}</h2>
      <p className="mt-2 text-sm text-electric-iris">{pick(tour, 'tagline', locale)}</p>
      <p className="mt-4 max-w-2xl text-silver-mist">{pick(tour, 'positioning', locale)}</p>

      <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase text-ash-gray">{locale === 'ru' ? 'Города' : 'Cities'}</dt>
          <dd className="mt-1 text-2xl text-bone-white">{tour.stats.cities}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-ash-gray">{locale === 'ru' ? 'Дней' : 'Days'}</dt>
          <dd className="mt-1 text-2xl text-bone-white">{tour.stats.days}</dd>
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
          <RouteMap ref={routeMapRef} stops={buildRouteStops(tour, locale)} className="mt-4 flex-1" />
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
                {(day.transfer_ru || day.note_ru) && (
                  <p className="mt-2 text-xs text-electric-iris">
                    {locale === 'ru' ? day.transfer_ru ?? day.note_ru : day.transfer_en ?? day.note_en}
                  </p>
                )}
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
          <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4 text-base">
            <span className="font-medium">{pick(tour.pricing, 'total_label', locale)}</span>
            <span className="font-medium text-bone-white">{formatRub(tour.pricing.total_excl_flights, locale)}</span>
          </div>
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
    </article>
  )
}

export function Tours() {
  const { locale } = useLanguage()
  const tours = toursData.tours
  const canvasHandleRef = useRef<ParticleCanvasHandle>(null)
  const { goTo, isLeaving, durationMs } = useShapeExitNavigate(canvasHandleRef)

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <ParticleCanvas ref={canvasHandleRef} shape="china" />
        {/*
         * The page is much taller than the hero (many tours stack below it),
         * so — unlike the short Industries grid — the map can't stay visible
         * behind all of it without drowning the pricing tables further down.
         * A plain alpha fade (no blur/mask trick) dissolves it into the page
         * background over the first stretch of scroll instead, so it still
         * reads as one continuous space rather than a hard-edged hero box.
         */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, transparent 14%, var(--color-void) 46%, var(--color-void) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 pb-24 lg:pt-20">
        <div
          className="pointer-events-none"
          style={{ opacity: isLeaving ? 0 : 1, transition: `opacity ${durationMs}ms ease-in-out` }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.025em] text-saffron-spark">
            {locale === 'ru' ? 'Каталог' : 'Catalog'}
          </p>
          <h1 className="mt-6 max-w-2xl text-[36px] font-normal leading-[1.05] tracking-[-0.04em] sm:text-[48px] lg:text-[56px]">
            {locale === 'ru' ? 'Готовые туры' : 'Ready-made tours'}
          </h1>
          <p className="mt-4 max-w-xl text-lg font-normal text-silver-mist">
            {locale === 'ru'
              ? 'Курируемые программы по приоритетным нишам — маршрут, компании и логистика уже собраны.'
              : 'Curated programs for priority niches — route, companies, and logistics already assembled.'}
          </p>
        </div>

        <div className="mt-9 flex flex-col gap-16">
          {tours.map((tour, index) => (
            <TourArticle key={tour.tour_id} tour={tour} index={index} locale={locale} goTo={goTo} />
          ))}
        </div>
      </div>
    </section>
  )
}

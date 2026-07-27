import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage, pick } from '@/i18n/LanguageContext'
import { toursData, companiesData } from '@/data'
import { RouteMap } from '@/components/RouteMap'
import type { RouteMapStop } from '@/components/RouteMap'
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

export function Tours() {
  const { locale } = useLanguage()
  const tours = toursData.tours
  const canvasHandleRef = useRef<ParticleCanvasHandle>(null)
  const { goTo, isLeaving, durationMs } = useShapeExitNavigate(canvasHandleRef)

  return (
    <>
      <section className="relative min-h-[360px] overflow-hidden lg:min-h-[420px]">
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

        <div
          className="pointer-events-none relative z-10 mx-auto max-w-[1280px] px-6 pt-24"
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
      </section>

      <section className="relative z-10 mx-auto max-w-[1280px] px-6 pb-24">
      <div className="flex flex-col gap-16">
        {tours.map((tour, index) => (
          <article
            key={tour.tour_id}
            id={tour.tour_id}
            className={`scroll-mt-24 pt-12 ${index > 0 ? 'border-t border-black/10' : ''}`}
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
                <RouteMap stops={buildRouteStops(tour, locale)} className="mt-4 flex-1" />
              </div>

              <div>
                <h3 className="text-lg font-medium">{locale === 'ru' ? 'Программа по дням' : 'Day-by-day'}</h3>
                <ol className="mt-4 space-y-4">
                  {tour.itinerary.map((day) => (
                    <li key={day.day} className="rounded-xl border border-black/10 bg-surface/40 p-4">
                      <p className="text-sm font-medium text-bone-white">
                        {locale === 'ru' ? 'День' : 'Day'} {day.day} ·{' '}
                        {locale === 'ru' ? day.city_ru : day.city_en} · {day.time}
                      </p>
                      <p className="mt-1 text-xs text-ash-gray">
                        {locale === 'ru' ? day.area_ru : day.area_en}
                      </p>
                      <p className="mt-2 text-sm text-silver-mist">{day.companies.map(companyName).join(', ')}</p>
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
                  <span className="font-medium text-bone-white">
                    {formatRub(tour.pricing.total_excl_flights, locale)}
                  </span>
                </div>
                {tour.pricing.extras.map((extra) => (
                  <p key={extra.title_ru} className="mt-2 text-xs text-ash-gray">
                    + {pick(extra, 'title', locale)}: {formatRub(extra.amount, locale)} (
                    {pick(extra, 'note', locale)})
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
        ))}
        </div>
      </section>
    </>
  )
}

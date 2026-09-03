import { useState } from 'react'
import { useLanguage, pick } from '@/i18n/LanguageContext'
import { toursData, companiesData, companyNameZh, eventTestimonials } from '@/data'
import { ArcGallery } from '@/components/ArcGallery'
import type { ArcGalleryItem } from '@/components/ArcGallery'
import { CircularMediaCarousel } from '@/components/CircularMediaCarousel'
import type { CaseMediaItem } from '@/components/CircularMediaCarousel'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ShimmerText } from '@/components/ShimmerText'
import { RevealText } from '@/components/RevealText'

const GRADIENTS = [
  'linear-gradient(160deg, #60a5fa, #1e3a8a)',
  'linear-gradient(160deg, #38bdf8, #0e3b57)',
  'linear-gradient(160deg, #818cf8, #312e81)',
  'linear-gradient(160deg, #93c5fd, #1d4ed8)',
  'linear-gradient(160deg, #0ea5e9, #0c4a6e)',
  'linear-gradient(160deg, #a5b4fc, #1e1b4b)',
  'linear-gradient(160deg, #7dd3fc, #075985)',
  'linear-gradient(160deg, #60a5fa, #172554)',
]

function companyName(id: string): string {
  const company = companiesData.companies.find((c) => c.id === id)
  return company ? companyNameZh(company) : id
}

export function Cases() {
  const { locale } = useLanguage()
  const [openTourId, setOpenTourId] = useState<string | null>(null)

  usePageMeta(
    locale === 'ru' ? 'Кейсы — Global Tech Tour' : 'Cases — Global Tech Tour',
    locale === 'ru'
      ? 'Кейсы прошедших и готовых экспедиций в Китай — маршруты, компании и программы по дням.'
      : "Case studies from past and ready-made China expeditions — routes, companies and day-by-day programmes.",
  )

  const items: ArcGalleryItem[] = toursData.tours.map((tour, i) => ({
    id: tour.tour_id,
    title: pick(tour, 'title', locale),
    subtitle: pick(tour, 'tagline', locale),
    gradient: GRADIENTS[i % GRADIENTS.length],
  }))

  const openTour = toursData.tours.find((t) => t.tour_id === openTourId)

  const media: CaseMediaItem[] = openTour
    ? openTour.itinerary.map((day, i) => ({
        id: `${openTour.tour_id}-${day.day}`,
        kind: (i + 1) % 3 === 0 ? 'video' : 'photo',
        gradient: GRADIENTS[(i + 1) % GRADIENTS.length],
        caption: `${locale === 'ru' ? 'День' : 'Day'} ${day.day} · ${
          locale === 'ru' ? day.city_ru : day.city_en
        } · ${day.companies.map(companyName).join(', ')}`,
      }))
    : []

  return (
    <section className="mx-auto w-full max-w-[1280px] px-6 py-16 lg:py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.025em]">
        <ShimmerText variant="saffron" text={locale === 'ru' ? 'Каталог' : 'Catalog'} />
      </p>
      <h1 className="mt-6 max-w-2xl text-[36px] font-normal leading-[1.1] tracking-[-0.03em] sm:text-[48px] lg:text-[56px]">
        <RevealText text={locale === 'ru' ? 'Кейсы' : 'Cases'} />
      </h1>
      <p className="mt-4 max-w-xl text-lg font-normal text-silver-mist">
        {locale === 'ru'
          ? 'Прошедшие экспедиции и визиты — наведите на карточку, чтобы выделить её, нажмите, чтобы открыть галерею.'
          : 'Past expeditions and visits — hover a card to bring it forward, click to open its gallery.'}
      </p>

      {eventTestimonials.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-medium tracking-[-0.02em] text-bone-white">
            {locale === 'ru' ? 'Фото с прошедших мероприятий' : 'Photos from past events'}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {eventTestimonials.map((item) => {
              const photo = item.media.find((m) => m.kind === 'photo' && !m.url.includes('REPLACE'))
              const testimonial =
                locale === 'ru' ? item.testimonial_ru || item.testimonial_en : item.testimonial_en || item.testimonial_ru
              const author = locale === 'ru' ? item.author_ru || item.author_en : item.author_en || item.author_ru

              return (
                <div
                  key={item.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-surface/70 backdrop-blur-sm"
                >
                  {photo && (
                    <img
                      src={photo.url}
                      alt={locale === 'ru' ? photo.caption_ru : photo.caption_en}
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">
                      {pick(item, 'title', locale)}
                    </p>
                    <p className="mt-3 flex-1 text-sm text-silver-mist">«{testimonial}»</p>
                    {author && (
                      <p className="mt-4 text-xs font-medium text-electric-iris">{author}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-16">
        <ArcGallery items={items} onSelect={(item) => setOpenTourId(item.id)} />
      </div>

      {openTour && (
        <CircularMediaCarousel
          items={media}
          title={pick(openTour, 'title', locale)}
          onClose={() => setOpenTourId(null)}
        />
      )}
    </section>
  )
}

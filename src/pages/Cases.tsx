import { useState } from 'react'
import { useLanguage, pick } from '@/i18n/LanguageContext'
import { toursData, companiesData, companyNameZh } from '@/data'
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

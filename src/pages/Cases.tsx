import { useLanguage, pick } from '@/i18n/LanguageContext'
import { toursData } from '@/data'
import { ArcGallery } from '@/components/ArcGallery'
import type { ArcGalleryItem } from '@/components/ArcGallery'

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

export function Cases() {
  const { locale } = useLanguage()

  const items: ArcGalleryItem[] = toursData.tours.map((tour, i) => ({
    id: tour.tour_id,
    title: pick(tour, 'title', locale),
    subtitle: pick(tour, 'tagline', locale),
    gradient: GRADIENTS[i % GRADIENTS.length],
  }))

  return (
    <section className="mx-auto w-full max-w-[1280px] px-6 py-16 lg:py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.025em] text-saffron-spark">
        {locale === 'ru' ? 'Каталог' : 'Catalog'}
      </p>
      <h1 className="mt-6 max-w-2xl text-[36px] font-normal leading-[1.1] tracking-[-0.03em] sm:text-[48px] lg:text-[56px]">
        {locale === 'ru' ? 'Кейсы' : 'Cases'}
      </h1>
      <p className="mt-4 max-w-xl text-lg font-normal text-silver-mist">
        {locale === 'ru'
          ? 'Прошедшие экспедиции и визиты — наведите на карточку, чтобы выделить её.'
          : 'Past expeditions and visits — hover a card to bring it forward.'}
      </p>

      <div className="mt-16">
        <ArcGallery items={items} />
      </div>
    </section>
  )
}

import { useLanguage } from '@/i18n/LanguageContext'
import { StaticImage } from './StaticImage'

/** Gallery of past-cohort photos on a programme page — each tile degrades to
 * a neutral placeholder until the real file lands at its predictable path
 * (see src/data/corporateTrainingImages.ts). */
export function ProgramGallery({ paths, programLabel }: { paths: string[]; programLabel: string }) {
  const { locale } = useLanguage()
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {paths.map((src, i) => (
        <StaticImage
          key={src}
          src={src}
          alt={
            locale === 'ru'
              ? `Фото с прошлого заезда — ${programLabel}, ${i + 1}`
              : `Photo from a past cohort — ${programLabel}, ${i + 1}`
          }
          placeholderLabel={locale === 'ru' ? 'Фото скоро появится' : 'Photo coming soon'}
          className="aspect-[4/3] w-full rounded-2xl object-cover"
        />
      ))}
    </div>
  )
}

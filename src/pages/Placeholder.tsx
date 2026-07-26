import { useLanguage } from '@/i18n/LanguageContext'

export function Placeholder({
  title_ru,
  title_en,
  note_ru,
  note_en,
}: {
  title_ru: string
  title_en: string
  note_ru?: string
  note_en?: string
}) {
  const { locale } = useLanguage()

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-[1280px] flex-col justify-center px-6 py-24">
      <p className="text-sm font-semibold uppercase tracking-[0.025em] text-saffron-spark">
        {locale === 'ru' ? 'Скоро' : 'Coming soon'}
      </p>
      <h1 className="mt-4 text-[42px] font-normal leading-[1.05] tracking-[-0.04em] sm:text-[56px]">
        {locale === 'ru' ? title_ru : title_en}
      </h1>
      {(note_ru || note_en) && (
        <p className="mt-4 max-w-xl text-lg font-normal text-silver-mist">
          {locale === 'ru' ? note_ru : note_en}
        </p>
      )}
    </section>
  )
}

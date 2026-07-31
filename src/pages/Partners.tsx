import { useLanguage } from '@/i18n/LanguageContext'
import { usePageMeta } from '@/hooks/usePageMeta'
import { Placeholder } from './Placeholder'

export function Partners() {
  const { locale } = useLanguage()

  usePageMeta(locale === 'ru' ? 'Партнёры — Sinotech Voyage' : 'Partners — Sinotech Voyage', undefined, {
    noindex: true,
  })

  return (
    <Placeholder
      title_ru="Партнеры"
      title_en="Partners"
      note_ru="Список партнеров и площадок появится здесь позже."
      note_en="Our partners and venues land here later."
    />
  )
}

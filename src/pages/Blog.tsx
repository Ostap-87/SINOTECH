import { useLanguage } from '@/i18n/LanguageContext'
import { usePageMeta } from '@/hooks/usePageMeta'
import { Placeholder } from './Placeholder'

export function Blog() {
  const { locale } = useLanguage()

  usePageMeta(locale === 'ru' ? 'Блог — Sinotech Voyage' : 'Blog — Sinotech Voyage', undefined, { noindex: true })

  return (
    <Placeholder
      title_ru="Блог"
      title_en="Blog"
      note_ru="Статьи появятся на Шаге 10."
      note_en="Articles land in Step 10."
    />
  )
}

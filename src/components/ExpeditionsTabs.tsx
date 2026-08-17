import { useLanguage } from '@/i18n/LanguageContext'
import { LocaleNavLink } from '@/i18n/LocaleLink'

interface ExpeditionsTabsProps {
  /** "Build your own" doesn't have its own page — it hands off to the standard Industries flow. */
  onCustom: (event: { button?: number; metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; preventDefault: () => void }) => void
}

function tabClass({ isActive }: { isActive: boolean }) {
  return `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
    isActive ? 'bg-electric-iris text-white' : 'text-ash-gray hover:text-bone-white'
  }`
}

export function ExpeditionsTabs({ onCustom }: ExpeditionsTabsProps) {
  const { locale } = useLanguage()

  return (
    <nav className="pointer-events-auto flex flex-wrap gap-2 rounded-full border border-black/10 bg-surface/70 p-1.5 backdrop-blur-sm">
      <LocaleNavLink to="/expeditions" end className={tabClass}>
        {locale === 'ru' ? 'Готовые экспедиции' : 'Ready expeditions'}
      </LocaleNavLink>
      <LocaleNavLink to="/expeditions/recommended" className={tabClass}>
        {locale === 'ru' ? 'Рекомендуемые' : 'Recommended'}
      </LocaleNavLink>
      <a
        href={locale === 'en' ? '/en/industries' : '/industries'}
        onClick={onCustom}
        className="rounded-full px-4 py-2 text-sm font-semibold text-ash-gray transition-colors hover:text-bone-white"
      >
        {locale === 'ru' ? 'Собрать свою программу' : 'Build your own program'}
      </a>
    </nav>
  )
}

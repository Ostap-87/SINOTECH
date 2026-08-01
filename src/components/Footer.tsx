import { Link } from 'react-router-dom'
import { useLanguage } from '@/i18n/LanguageContext'
import { siteContent } from '@/data'
import { Logo } from './Logo'

const FOOTER_LINKS = [
  { to: '/industries', label_ru: 'Индустрии', label_en: 'Industries' },
  { to: '/companies', label_ru: 'Компании', label_en: 'Companies' },
  { to: '/expeditions', label_ru: 'Экспедиции', label_en: 'Expeditions' },
  { to: '/consulting', label_ru: 'Консалтинг', label_en: 'Consulting' },
  { to: '/blog', label_ru: 'Блог', label_en: 'Blog' },
  { to: '/cases', label_ru: 'Кейсы', label_en: 'Cases' },
  { to: '/faq', label_ru: 'FAQ', label_en: 'FAQ' },
  { to: '/contacts', label_ru: 'Контакты', label_en: 'Contacts' },
]

export function Footer() {
  const { locale } = useLanguage()
  const { telegram, email } = siteContent.contacts

  return (
    <footer className="border-t border-black/10">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <Logo compact />

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-bone-white">
              {locale === 'ru' ? link.label_ru : link.label_en}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-4 text-xs text-ash-gray">
          <a href={`mailto:${email}`} className="hover:text-bone-white">
            {email}
          </a>
          <a
            href={`https://t.me/${telegram.replace('@', '')}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-bone-white"
          >
            {telegram}
          </a>
        </div>
      </div>
    </footer>
  )
}

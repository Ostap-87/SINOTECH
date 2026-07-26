import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import { Logo } from './Logo'
import { CountrySelector } from './CountrySelector'

const NAV_LINKS = [
  { to: '/industries', label_ru: 'Индустрии', label_en: 'Industries' },
  { to: '/tours', label_ru: 'Готовые туры', label_en: 'Ready-made tours' },
  { to: '/blog', label_ru: 'Блог', label_en: 'Blog' },
  { to: '/cases', label_ru: 'Кейсы', label_en: 'Cases' },
  { to: '/contacts', label_ru: 'Контакты', label_en: 'Contacts' },
]

function LocaleToggle() {
  const { locale, toggleLocale } = useLanguage()
  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray transition-colors hover:text-bone-white"
    >
      {locale === 'ru' ? 'EN' : 'RU'}
    </button>
  )
}

export function Navbar() {
  const { locale } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-void/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-6">
        <Link to="/" onClick={() => setMobileOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-[14px] font-semibold uppercase tracking-[0.025em] transition-colors ${
                  isActive ? 'text-bone-white' : 'text-ash-gray hover:text-bone-white'
                }`
              }
            >
              {locale === 'ru' ? link.label_ru : link.label_en}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 sm:flex">
            <CountrySelector />
            <LocaleToggle />
          </div>
          <Link
            to="/contacts"
            onClick={() => setMobileOpen(false)}
            className="hidden rounded-[24px] bg-electric-iris px-5 py-2 text-sm font-medium text-bone-white transition-opacity hover:opacity-90 sm:inline-block"
          >
            {locale === 'ru' ? 'Оставить заявку' : 'Get in touch'}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-bone-white lg:hidden"
            aria-expanded={mobileOpen}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 px-6 pb-8 pt-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-2 py-2.5 text-sm font-semibold uppercase tracking-[0.025em] ${
                    isActive ? 'text-bone-white' : 'text-ash-gray'
                  }`
                }
              >
                {locale === 'ru' ? link.label_ru : link.label_en}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-3">
            <CountrySelector />
            <LocaleToggle />
          </div>
          <Link
            to="/contacts"
            onClick={() => setMobileOpen(false)}
            className="mt-4 inline-block rounded-[24px] bg-electric-iris px-5 py-2 text-sm font-medium text-bone-white"
          >
            {locale === 'ru' ? 'Оставить заявку' : 'Get in touch'}
          </Link>
        </div>
      )}
    </header>
  )
}

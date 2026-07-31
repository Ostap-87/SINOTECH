import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import { Logo } from './Logo'
import { CountrySelector } from './CountrySelector'

// Primary items stay inline; less time-critical ones (info/content pages)
// live in the Resources dropdown so adding more sections doesn't widen the
// bar — this is what keeps the nav compact as it grows.
const PRIMARY_LINKS = [
  { to: '/expeditions', label_ru: 'Экспедиции', label_en: 'Expeditions' },
  { to: '/consulting', label_ru: 'Консалтинг', label_en: 'Consulting' },
  { to: '/contacts', label_ru: 'Контакты', label_en: 'Contacts' },
]

const RESOURCE_LINKS = [
  { to: '/companies', label_ru: 'Компании', label_en: 'Companies' },
  { to: '/blog', label_ru: 'Блог', label_en: 'Blog' },
  { to: '/cases', label_ru: 'Кейсы', label_en: 'Cases' },
  { to: '/faq', label_ru: 'FAQ', label_en: 'FAQ' },
  { to: '/partners', label_ru: 'Партнеры', label_en: 'Partners' },
]

const EXPEDITIONS_LINKS = [
  { to: '/expeditions', label_ru: 'Готовые экспедиции', label_en: 'Ready expeditions' },
  { to: '/expeditions/recommended', label_ru: 'Рекомендуемые', label_en: 'Recommended' },
  { to: '/industries', label_ru: 'Собрать свою программу', label_en: 'Build your own program' },
]

const ALL_LINKS = [...PRIMARY_LINKS, ...RESOURCE_LINKS]

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `text-[13px] font-semibold uppercase tracking-[0.02em] transition-colors ${
    isActive ? 'text-bone-white' : 'text-ash-gray hover:text-bone-white'
  }`
}

function ResourcesDropdown() {
  const { locale } = useLanguage()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isActive = RESOURCE_LINKS.some((link) => link.to === location.pathname)

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 text-[13px] font-semibold uppercase tracking-[0.02em] transition-colors ${
          isActive ? 'text-bone-white' : 'text-ash-gray hover:text-bone-white'
        }`}
        aria-expanded={open}
      >
        {locale === 'ru' ? 'Ресурсы' : 'Resources'}
        <ChevronDown size={13} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>

      {open && (
        <ul className="absolute left-0 top-[calc(100%+12px)] w-40 rounded-[16px] border border-black/10 bg-void py-2 shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
          {RESOURCE_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive: linkActive }) =>
                  `block px-4 py-2 text-sm font-medium ${
                    linkActive ? 'text-electric-iris' : 'text-bone-white hover:text-electric-iris'
                  }`
                }
              >
                {locale === 'ru' ? link.label_ru : link.label_en}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ExpeditionsDropdown() {
  const { locale } = useLanguage()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isActive = location.pathname.startsWith('/expeditions')

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 text-[13px] font-semibold uppercase tracking-[0.02em] transition-colors ${
          isActive ? 'text-bone-white' : 'text-ash-gray hover:text-bone-white'
        }`}
        aria-expanded={open}
      >
        {locale === 'ru' ? 'Экспедиции' : 'Expeditions'}
        <ChevronDown size={13} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>

      {open && (
        <ul className="absolute left-0 top-[calc(100%+12px)] w-56 rounded-[16px] border border-black/10 bg-void py-2 shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
          {EXPEDITIONS_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/expeditions'}
                onClick={() => setOpen(false)}
                className={({ isActive: linkActive }) =>
                  `block px-4 py-2 text-sm font-medium ${
                    linkActive ? 'text-electric-iris' : 'text-bone-white hover:text-electric-iris'
                  }`
                }
              >
                {locale === 'ru' ? link.label_ru : link.label_en}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function LocaleToggle() {
  const { locale, toggleLocale } = useLanguage()
  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="rounded-full border border-black/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray transition-colors hover:text-bone-white"
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
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5">
        <Link to="/" onClick={() => setMobileOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {PRIMARY_LINKS.map((link) =>
            link.to === '/expeditions' ? (
              <ExpeditionsDropdown key={link.to} />
            ) : (
              <NavLink key={link.to} to={link.to} className={navLinkClass}>
                {locale === 'ru' ? link.label_ru : link.label_en}
              </NavLink>
            ),
          )}
          <ResourcesDropdown />
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 sm:flex">
            <CountrySelector />
            <LocaleToggle />
          </div>
          <Link
            to="/contacts"
            onClick={() => setMobileOpen(false)}
            className="hidden rounded-[24px] bg-electric-iris px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:inline-block"
          >
            {locale === 'ru' ? 'Оставить заявку' : 'Get in touch'}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-bone-white lg:hidden"
            aria-expanded={mobileOpen}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-black/10 px-6 pb-8 pt-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {ALL_LINKS.map((link) => (
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
            className="mt-4 inline-block rounded-[24px] bg-electric-iris px-5 py-2 text-sm font-medium text-white"
          >
            {locale === 'ru' ? 'Оставить заявку' : 'Get in touch'}
          </Link>
        </div>
      )}
    </header>
  )
}

import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export type Locale = 'ru' | 'en'

type LanguageContextValue = {
  locale: Locale
  /** Navigates to the locale-equivalent of the current URL. */
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = 'global-tech-tour-locale'

// Страны, где английский — основной или уверенно доминирующий деловой язык.
// Список намеренно консервативный: только там, где показывать EN "по умолчанию"
// почти наверняка правильно. Для остальных стран (Германия, Франция, ОАЭ и т.п.)
// геолокация не даёт своего мнения — решает язык браузера, как и раньше.
const ENGLISH_SPEAKING_COUNTRY_CODES = new Set([
  'US', 'GB', 'CA', 'AU', 'NZ', 'IE', 'SG', 'HK', 'ZA',
])

/** Strip a leading /en (optionally followed by /) from a pathname, leaving the rest untouched. */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === '/en') return '/'
  if (pathname.startsWith('/en/')) return pathname.slice(3)
  return pathname
}

/** Locale is derived from the URL itself — /en/... is English, everything else is Russian
 *  (Russian is the un-prefixed default). This is what gives Google two real, distinct,
 *  crawlable URLs per page instead of one URL whose content silently swaps client-side —
 *  the previous localStorage-only approach meant hreflang had nothing real to point at. */
function localeFromPathname(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'ru'
}

function getStoredPreference(): Locale | null {
  if (typeof window === 'undefined') return null
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'ru' || stored === 'en' ? stored : null
}

/** Геолокация по IP через бесплатный сервис без ключа — определяет страну
 *  точнее, чем язык браузера (эмигранты, VPN с другой раскладкой и т.п.).
 *  Возвращает null, если сервис недоступен/не ответил вовремя или страна
 *  не даёт однозначного сигнала — тогда решение остаётся за языком браузера. */
async function detectLocaleByCountry(): Promise<Locale | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2500)
    const res = await fetch('https://get.geojs.io/v1/ip/country.json', {
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const data = (await res.json()) as { country_code?: string }
    const code = data.country_code?.toUpperCase()
    if (!code) return null
    if (code === 'RU') return 'ru'
    if (ENGLISH_SPEAKING_COUNTRY_CODES.has(code)) return 'en'
    return null
  } catch {
    return null // сеть недоступна/таймаут/CORS — молча уступаем языку браузера
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const locale = localeFromPathname(location.pathname)

  // Автовыбор языка (сохранённое предпочтение / геолокация / язык браузера)
  // срабатывает ТОЛЬКО один раз за визит, и только если в URL ещё нет явного
  // языкового префикса — иначе прямая ссылка на /en/... или /blog/... всегда
  // должна показывать ровно то, что в адресе, без неожиданных редиректов.
  const autoDetectRanRef = useRef(false)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    if (autoDetectRanRef.current) return
    if (locale === 'en') {
      // Уже на /en/... — явный языковой сигнал в самом URL, автоопределение не нужно.
      autoDetectRanRef.current = true
      return
    }

    const stored = getStoredPreference()
    if (stored) {
      autoDetectRanRef.current = true
      if (stored === 'en') navigate(`/en${location.pathname}${location.search}`, { replace: true })
      return
    }

    let cancelled = false
    detectLocaleByCountry().then((detected) => {
      if (cancelled || autoDetectRanRef.current) return
      autoDetectRanRef.current = true
      if (detected === 'en') navigate(`/en${location.pathname}${location.search}`, { replace: true })
    })
    return () => {
      cancelled = true
    }
    // Запускается один раз при монтировании — сознательно не завязан на смену route,
    // чтобы не пытаться переопределить язык при обычной навигации внутри сайта.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale: (next) => {
        autoDetectRanRef.current = true
        const bare = stripLocalePrefix(location.pathname)
        navigate(next === 'en' ? `/en${bare}${location.search}` : `${bare}${location.search}`)
      },
      toggleLocale: () => {
        autoDetectRanRef.current = true
        const bare = stripLocalePrefix(location.pathname)
        navigate(locale === 'ru' ? `/en${bare}${location.search}` : `${bare}${location.search}`)
      },
    }),
    [locale, location.pathname, location.search, navigate],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

/** Pick the localized field from an object carrying `${key}_en` / `${key}_ru` pairs. */
export function pick<T extends object>(obj: T, key: string, locale: Locale): string {
  const record = obj as Record<string, unknown>
  return (record[`${key}_${locale}`] as string) ?? (record[`${key}_en`] as string) ?? ''
}

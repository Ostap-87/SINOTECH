import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export type Locale = 'ru' | 'en'

type LanguageContextValue = {
  locale: Locale
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

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'ru' || stored === 'en') return stored
  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en'
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
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)
  // Геолокация может переопределить язык только пока пользователь ни разу
  // не выбирал его сам вручную — фиксируем это один раз при монтировании,
  // до того как эффект сохранения ниже успеет что-то записать в localStorage.
  const hasExplicitPreference = useRef(
    typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY) !== null,
  )

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    if (hasExplicitPreference.current) return
    let cancelled = false
    detectLocaleByCountry().then((detected) => {
      if (!cancelled && detected && !hasExplicitPreference.current) {
        setLocaleState(detected)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale: (next) => {
        hasExplicitPreference.current = true
        setLocaleState(next)
      },
      toggleLocale: () => {
        hasExplicitPreference.current = true
        setLocaleState((prev) => (prev === 'ru' ? 'en' : 'ru'))
      },
    }),
    [locale],
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

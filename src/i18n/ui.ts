import type { Locale } from './LanguageContext'

export const ui = {
  brand: { ru: 'Sinotech Voyage', en: 'Sinotech Voyage' },
  comingSoon: { ru: 'Скоро', en: 'Coming soon' },
} satisfies Record<string, Record<Locale, string>>

export function t(key: keyof typeof ui, locale: Locale): string {
  return ui[key][locale]
}

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useLanguage, pick } from '@/i18n/LanguageContext'
import { companiesData } from '@/data'

// Countries with their own 3D map preview (assembles like the China hero) —
// browsable even before there's a real catalogue behind them. Every other
// inactive country stays a plain disabled "Soon" row.
const COUNTRIES_WITH_PREVIEW = new Set(['jp', 'kr'])

export function CountrySelector() {
  const { locale } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const countries = companiesData.countries
  const active = countries.find((c) => c.active) ?? countries[0]

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
        className="flex items-center gap-1.5 rounded-full border border-black/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray transition-colors hover:text-bone-white"
        aria-expanded={open}
      >
        {pick(active, 'name', locale)}
        <ChevronDown size={12} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>

      {open && (
        <ul className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-[16px] border border-black/10 bg-void py-2 shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
          {countries.map((country) => {
            const hasPreview = !country.active && COUNTRIES_WITH_PREVIEW.has(country.code)

            if (hasPreview) {
              return (
                <li key={country.code}>
                  <Link
                    to={`/countries/${country.code}`}
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-bone-white hover:bg-black/5"
                  >
                    {pick(country, 'name', locale)}
                    <span className="text-[10px] font-semibold uppercase tracking-[0.025em] text-saffron-spark/70">
                      {locale === 'ru' ? 'Скоро' : 'Soon'}
                    </span>
                  </Link>
                </li>
              )
            }

            return (
              <li key={country.code}>
                <button
                  type="button"
                  disabled={!country.active}
                  onClick={() => setOpen(false)}
                  className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                    country.active
                      ? 'text-bone-white hover:bg-black/5'
                      : 'cursor-not-allowed text-ash-gray/50'
                  }`}
                >
                  {pick(country, 'name', locale)}
                  {!country.active && (
                    <span className="text-[10px] font-semibold uppercase tracking-[0.025em] text-saffron-spark/70">
                      {locale === 'ru' ? 'Скоро' : 'Soon'}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

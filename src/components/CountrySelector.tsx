import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useLanguage, pick } from '@/i18n/LanguageContext'
import { useSelectedCountry } from '@/context/SelectedCountryContext'
import { companiesData } from '@/data'
import { ShimmerText } from './ShimmerText'

// Countries with their own 3D map preview (assembles like the China hero) —
// browsable even before there's a real catalogue behind them. Every other
// inactive country stays a plain disabled "Soon" row.
const COUNTRIES_WITH_PREVIEW = new Set(['jp', 'kr', 'in', 'th', 'my', 'id', 'vn'])

export function CountrySelector() {
  const { locale } = useLanguage()
  const { countryCode, setCountryCode } = useSelectedCountry()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const countries = companiesData.countries
  const selected = countries.find((c) => c.code === countryCode) ?? countries[0]

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
        {pick(selected, 'name', locale)}
        <ChevronDown size={12} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>

      {open && (
        <ul className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-[16px] border border-black/10 bg-void py-2 shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
          {countries.map((country) => {
            const hasPreview = !country.active && COUNTRIES_WITH_PREVIEW.has(country.code)
            const isSelected = country.code === countryCode

            // On the home page the hero itself can show any previewable
            // country's map — picking one here just swaps the shape in
            // place instead of navigating away, which is what makes it feel
            // like part of the page rather than a disconnected stub.
            if (hasPreview && isHome) {
              return (
                <li key={country.code}>
                  <button
                    type="button"
                    onClick={() => {
                      setCountryCode(country.code)
                      setOpen(false)
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-black/5 ${
                      isSelected ? 'text-electric-iris' : 'text-bone-white'
                    }`}
                  >
                    {pick(country, 'name', locale)}
                    <span className="text-[10px] font-semibold uppercase tracking-[0.025em] opacity-70">
                      <ShimmerText variant="saffron" text={locale === 'ru' ? 'Скоро' : 'Soon'} />
                    </span>
                  </button>
                </li>
              )
            }

            if (hasPreview) {
              return (
                <li key={country.code}>
                  <Link
                    to={`/countries/${country.code}`}
                    onClick={() => {
                      setCountryCode(country.code)
                      setOpen(false)
                    }}
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-bone-white hover:bg-black/5"
                  >
                    {pick(country, 'name', locale)}
                    <span className="text-[10px] font-semibold uppercase tracking-[0.025em] opacity-70">
                      <ShimmerText variant="saffron" text={locale === 'ru' ? 'Скоро' : 'Soon'} />
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
                  onClick={() => {
                    if (country.active) setCountryCode(country.code)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                    country.active
                      ? isSelected
                        ? 'text-electric-iris'
                        : 'text-bone-white hover:bg-black/5'
                      : 'cursor-not-allowed text-ash-gray/50'
                  }`}
                >
                  {pick(country, 'name', locale)}
                  {!country.active && (
                    <span className="text-[10px] font-semibold uppercase tracking-[0.025em] opacity-70">
                      <ShimmerText variant="saffron" text={locale === 'ru' ? 'Скоро' : 'Soon'} />
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

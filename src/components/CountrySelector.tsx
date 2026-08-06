import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useLanguage, pick } from '@/i18n/LanguageContext'
import { useSelectedCountry } from '@/context/SelectedCountryContext'
import { companiesData } from '@/data'
import { ShimmerText } from './ShimmerText'

// Countries with their own 3D map preview (assembles like the China hero) —
// browsable even before there's a real catalogue behind them. Every other
// inactive country stays a plain disabled "Soon" chip.
const COUNTRIES_WITH_PREVIEW = new Set(['jp', 'kr', 'in', 'th', 'my', 'id', 'vn'])

export function CountrySelector({
  variant = 'nav',
  className = '',
}: {
  variant?: 'nav' | 'hero'
  className?: string
}) {
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

  // Shared chip styling for every entry in the horizontal country row —
  // kept as one function so the three branches below (previewable+home,
  // previewable elsewhere, plain/disabled) stay visually identical.
  function chipClass(isSelected: boolean, disabled: boolean) {
    if (disabled) {
      return 'inline-flex cursor-not-allowed items-center gap-1.5 whitespace-nowrap rounded-full border border-black/10 px-3.5 py-2 text-sm text-ash-gray/50'
    }
    return `inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm transition-colors ${
      isSelected
        ? 'border-electric-iris/50 bg-electric-iris/10 text-electric-iris'
        : 'border-black/10 text-bone-white hover:bg-black/5'
    }`
  }

  const soonBadge = (
    <span className="text-[9px] font-semibold uppercase tracking-[0.025em] opacity-70">
      <ShimmerText variant="saffron" text={locale === 'ru' ? 'Скоро' : 'Soon'} />
    </span>
  )

  return (
    <div ref={ref} className={`relative flex min-w-0 ${className}`}>
      {variant === 'hero' ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="pill-shimmer relative flex h-full w-full items-center justify-center gap-1.5 rounded-[24px] border border-electric-iris/40 bg-surface/70 px-6 py-3 text-center text-sm font-medium text-bone-white transition-colors hover:bg-surface"
          aria-expanded={open}
        >
          <span className="relative z-10 flex items-center gap-1.5">
            {pick(selected, 'name', locale)}
            <ChevronDown size={14} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-full border border-black/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray transition-colors hover:text-bone-white"
          aria-expanded={open}
        >
          {pick(selected, 'name', locale)}
          <ChevronDown size={12} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
      )}

      {/* Countries laid out in a single flowing row (wraps onto a second
          line if it runs out of width) instead of a vertical list — with
          only 8 countries this reads as one horizontal picker, not a menu. */}
      {open && (
        <div
          className={`absolute top-[calc(100%+8px)] z-20 flex w-max max-w-[min(90vw,480px)] flex-wrap gap-2 rounded-[16px] border border-black/10 bg-void p-3 shadow-[0_20px_40px_rgba(0,0,0,0.12)] ${
            variant === 'hero' ? 'left-0' : 'right-0'
          }`}
        >
          {countries.map((country) => {
            const hasPreview = !country.active && COUNTRIES_WITH_PREVIEW.has(country.code)
            const isSelected = country.code === countryCode

            // On the home page the hero itself can show any previewable
            // country's map — picking one here just swaps the shape in
            // place instead of navigating away, which is what makes it feel
            // like part of the page rather than a disconnected stub.
            if (hasPreview && isHome) {
              return (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    setCountryCode(country.code)
                    setOpen(false)
                  }}
                  className={chipClass(isSelected, false)}
                >
                  {pick(country, 'name', locale)}
                  {soonBadge}
                </button>
              )
            }

            if (hasPreview) {
              return (
                <Link
                  key={country.code}
                  to={`/countries/${country.code}`}
                  onClick={() => {
                    setCountryCode(country.code)
                    setOpen(false)
                  }}
                  className={chipClass(isSelected, false)}
                >
                  {pick(country, 'name', locale)}
                  {soonBadge}
                </Link>
              )
            }

            return (
              <button
                key={country.code}
                type="button"
                disabled={!country.active}
                onClick={() => {
                  if (country.active) setCountryCode(country.code)
                  setOpen(false)
                }}
                className={chipClass(isSelected, !country.active)}
              >
                {pick(country, 'name', locale)}
                {!country.active && soonBadge}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

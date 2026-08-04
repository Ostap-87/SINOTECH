import { useMemo } from 'react'
import { useSelectedCountry } from '@/context/SelectedCountryContext'
import { companiesData } from '@/data'

const CHINA_BRANDS = [
  'BYD', 'XIAOMI', 'ALIBABA', 'BAIDU', 'TENCENT', 'XPENG', 'ZEEKR', 'CHAGEE', 'HEYTEA',
  'LUCKYN COFFEE', 'SIEMENS', 'UBTECH', 'AGIBOT', 'UNITREE', 'GAC', 'KEPLER', 'JD',
  'TESLA', 'ALIPAY', 'WECHAT', 'IFLYTEK',
]

const MAX_BRANDS = 22

/** Drops a trailing "(Parent Co / clarification)" so the marquee reads as clean short names. */
function cleanBrandName(name: string) {
  return name.replace(/\s*\([^)]*\)\s*$/, '').trim().toUpperCase()
}

/** Spreads picks evenly across the ordered list instead of clumping on whichever sector was entered first. */
function spread<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items
  const step = items.length / max
  return Array.from({ length: max }, (_, i) => items[Math.floor(i * step)])
}

function getMarqueeBrands(countryCode: string): string[] {
  if (countryCode === 'cn') return CHINA_BRANDS

  const names = companiesData.companies
    .filter((company) => company.country === countryCode)
    .map((company) => cleanBrandName(company.name_en))

  const unique = Array.from(new Set(names))
  return spread(unique, MAX_BRANDS)
}

function MarqueeItems({ brands }: { brands: string[] }) {
  return (
    <>
      {brands.map((brand, index) => (
        <span
          key={index}
          className="mx-8 inline-block text-3xl font-semibold tracking-[-0.02em] text-bone-white/25 sm:text-4xl"
        >
          {brand}
        </span>
      ))}
    </>
  )
}

export function BrandMarquee() {
  const { countryCode } = useSelectedCountry()
  const brands = useMemo(() => getMarqueeBrands(countryCode), [countryCode])

  if (brands.length === 0) return null

  return (
    <div className="pointer-events-none w-full overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
      <div key={countryCode} className="brand-marquee-track flex w-max whitespace-nowrap">
        <MarqueeItems brands={brands} />
        <MarqueeItems brands={brands} />
      </div>
    </div>
  )
}

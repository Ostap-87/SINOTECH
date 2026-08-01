import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage, pick } from '@/i18n/LanguageContext'
import { companiesData, getCity, companyNameZh } from '@/data'
import { usePageMeta } from '@/hooks/usePageMeta'
import { CompanyMark } from '@/components/CompanyMark'
import { ParticleCanvas } from '@/components/ParticleCanvas'
import { ShimmerText } from '@/components/ShimmerText'

export function Companies() {
  const { locale } = useLanguage()
  const [searchParams] = useSearchParams()
  const initialSector = searchParams.get('sector')
  const [search, setSearch] = useState('')
  const [sectorFilter, setSectorFilter] = useState<Set<string>>(
    () => new Set(initialSector ? [initialSector] : []),
  )

  usePageMeta(
    locale === 'ru' ? 'Все компании — Global Tech Tour' : 'All companies — Global Tech Tour',
    locale === 'ru'
      ? `Каталог из ${companiesData.companies.length}+ китайских компаний по ${companiesData.sectors.length} отраслям — название, сфера деятельности и краткое описание каждой.`
      : `A catalogue of ${companiesData.companies.length}+ Chinese companies across ${companiesData.sectors.length} sectors — name, business focus and a short description for each.`,
  )

  function toggleSector(code: string) {
    setSectorFilter((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return companiesData.companies.filter((company) => {
      if (sectorFilter.size > 0 && !sectorFilter.has(company.sector)) return false
      if (!q) return true
      return (
        company.name_en.toLowerCase().includes(q) ||
        company.name_zh.includes(q) ||
        (company.category_ru ?? '').toLowerCase().includes(q) ||
        (company.category_en ?? '').toLowerCase().includes(q)
      )
    })
  }, [search, sectorFilter])

  const bySector = useMemo(() => {
    const groups = new Map<string, typeof companiesData.companies>()
    for (const company of filtered) {
      const list = groups.get(company.sector) ?? []
      list.push(company)
      groups.set(company.sector, list)
    }
    return companiesData.sectors
      .map((sector) => ({ sector, companies: groups.get(sector.code) ?? [] }))
      .filter((group) => group.companies.length > 0)
  }, [filtered])

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[820px] lg:h-[720px]">
        <ParticleCanvas shape="china" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, transparent 35%, var(--color-void) 92%, var(--color-void) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 py-16 lg:py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.025em]">
        <ShimmerText variant="saffron" text={locale === 'ru' ? 'Каталог' : 'Catalog'} />
      </p>
      <h1 className="mt-6 max-w-2xl text-[36px] font-normal leading-[1.1] tracking-[-0.03em] sm:text-[48px] lg:text-[56px]">
        {locale === 'ru' ? 'Компании' : 'Companies'}
      </h1>
      <p className="mt-6 max-w-2xl text-lg font-normal text-silver-mist">
        {locale === 'ru'
          ? `${companiesData.companies.length}+ компаний по ${companiesData.sectors.length} отраслям — выберите индустрию или найдите компанию по названию.`
          : `${companiesData.companies.length}+ companies across ${companiesData.sectors.length} sectors — filter by industry or search by name.`}
      </p>

      <div className="mt-10 flex flex-col gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={locale === 'ru' ? 'Поиск по названию' : 'Search by name'}
          className="w-full max-w-md rounded-xl border border-black/10 bg-surface/40 px-4 py-2.5 text-sm text-bone-white placeholder:text-ash-gray focus:border-electric-iris/60 focus:outline-none"
        />

        <div className="flex flex-wrap gap-2">
          {companiesData.sectors.map((sector) => {
            const active = sectorFilter.has(sector.code)
            return (
              <button
                key={sector.code}
                type="button"
                onClick={() => toggleSector(sector.code)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
                  active
                    ? 'border-electric-iris bg-electric-iris/15 text-bone-white'
                    : 'border-black/10 text-ash-gray hover:border-black/25'
                }`}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: sector.color }} aria-hidden="true" />
                {pick(sector, 'label', locale)}
              </button>
            )
          })}
        </div>
      </div>

      {bySector.length === 0 && (
        <p className="mt-16 text-sm text-ash-gray">{locale === 'ru' ? 'Ничего не найдено.' : 'Nothing found.'}</p>
      )}

      {bySector.map(({ sector, companies }) => (
        <div key={sector.code} className="mt-14">
          <h2 className="flex items-center gap-2 text-xl font-medium tracking-[-0.01em] text-bone-white">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: sector.color }} aria-hidden="true" />
            {pick(sector, 'label', locale)}
            <span className="text-sm font-normal text-ash-gray">{companies.length}</span>
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => {
              const city = getCity(company.city)
              return (
                <Link
                  key={company.id}
                  to={`/companies/${company.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-black/10 bg-surface/60 p-4 transition-colors hover:border-electric-iris/60"
                >
                  <CompanyMark company={company} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-bone-white">{companyNameZh(company)}</p>
                    <p className="mt-0.5 truncate text-xs text-ash-gray">
                      {city ? pick(city, 'name', locale) : company.city}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
      </div>
    </section>
  )
}

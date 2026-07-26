import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, Plus, X } from 'lucide-react'
import { useLanguage, pick } from '@/i18n/LanguageContext'
import { companiesData, getCity, getSector } from '@/data'
import type { Company } from '@/types/data'

type FormatKey = '2' | '5'

const FORMAT_CONFIG: Record<FormatKey, { days: number; min: number; max: number }> = {
  '2': { days: 2, min: 3, max: 6 },
  '5': { days: 5, min: 8, max: 14 },
}

interface CityCluster {
  cityId: string
  companies: Company[]
}

interface DayPlan {
  day: number
  clusters: CityCluster[]
}

function buildItinerary(companies: Company[], days: number): DayPlan[] {
  const byCity = new Map<string, Company[]>()
  for (const company of companies) {
    const list = byCity.get(company.city) ?? []
    list.push(company)
    byCity.set(company.city, list)
  }

  const clusters: CityCluster[] = [...byCity.entries()]
    .map(([cityId, list]) => ({ cityId, companies: list }))
    .sort((a, b) => (getCity(b.cityId)?.lat ?? 0) - (getCity(a.cityId)?.lat ?? 0))

  const target = Math.max(1, Math.ceil(companies.length / days))
  const plan: DayPlan[] = Array.from({ length: days }, (_, i) => ({ day: i + 1, clusters: [] }))

  let dayIndex = 0
  let countInDay = 0
  for (const cluster of clusters) {
    if (countInDay > 0 && countInDay + cluster.companies.length > target && dayIndex < days - 1) {
      dayIndex++
      countInDay = 0
    }
    plan[dayIndex].clusters.push(cluster)
    countInDay += cluster.companies.length
  }

  return plan
}

export function Constructor() {
  const { locale } = useLanguage()
  const [searchParams] = useSearchParams()
  const initialSector = searchParams.get('sector')

  const [format, setFormat] = useState<FormatKey | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sectorFilter, setSectorFilter] = useState<Set<string>>(
    () => new Set(initialSector ? [initialSector] : []),
  )
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const config = format ? FORMAT_CONFIG[format] : null

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const selectedCompanies = useMemo(
    () => selectedIds.map((id) => companiesData.companies.find((c) => c.id === id)).filter(Boolean) as Company[],
    [selectedIds],
  )

  const filteredCompanies = useMemo(() => {
    const q = search.trim().toLowerCase()
    return companiesData.companies.filter((company) => {
      if (sectorFilter.size > 0 && !sectorFilter.has(company.sector)) return false
      if (regionFilter !== 'all' && getCity(company.city)?.region !== regionFilter) return false
      if (q && !company.name_en.toLowerCase().includes(q)) return false
      return true
    })
  }, [sectorFilter, regionFilter, search])

  function toggleSector(code: string) {
    setSectorFilter((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  function toggleCompany(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (config && prev.length >= config.max) return prev
      return [...prev, id]
    })
  }

  function chooseFormat(key: FormatKey) {
    setFormat(key)
    const max = FORMAT_CONFIG[key].max
    setSelectedIds((prev) => (prev.length > max ? prev.slice(0, max) : prev))
    setSubmitted(false)
  }

  const canSubmit = !!config && selectedCompanies.length >= config.min
  const itinerary = config ? buildItinerary(selectedCompanies, config.days) : []

  return (
    <section className="mx-auto max-w-[1280px] px-6 py-24">
      <p className="text-sm font-semibold uppercase tracking-[0.025em] text-saffron-spark">
        {locale === 'ru' ? 'Конструктор' : 'Constructor'}
      </p>
      <h1 className="mt-6 max-w-2xl text-[36px] font-normal leading-[1.05] tracking-[-0.04em] sm:text-[48px] lg:text-[56px]">
        {locale === 'ru' ? 'Соберите свою программу' : 'Build your own program'}
      </h1>
      <p className="mt-4 max-w-xl text-lg font-extralight text-silver-mist">
        {locale === 'ru'
          ? 'Выберите формат, отметьте компании — мы возьмём список за основу и соберём маршрут вручную.'
          : 'Pick a format, mark the companies you want — we take that list and assemble the route by hand.'}
      </p>

      <div className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-[0.025em] text-ash-gray">
          {locale === 'ru' ? '1. Формат тура' : '1. Tour format'}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:max-w-lg">
          {(Object.keys(FORMAT_CONFIG) as FormatKey[]).map((key) => {
            const cfg = FORMAT_CONFIG[key]
            const active = format === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => chooseFormat(key)}
                className={`rounded-2xl border p-5 text-left transition-colors ${
                  active
                    ? 'border-electric-iris bg-electric-iris/10'
                    : 'border-white/10 bg-surface/40 hover:border-white/25'
                }`}
              >
                <p className="text-lg font-medium text-bone-white">
                  {cfg.days} {locale === 'ru' ? 'дней' : 'days'}
                </p>
                <p className="mt-1 text-sm text-ash-gray">
                  {cfg.min}–{cfg.max} {locale === 'ru' ? 'компаний' : 'companies'}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {config && (
        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.025em] text-ash-gray">
              {locale === 'ru' ? '2. Выберите компании' : '2. Choose companies'}
            </h2>

            <div className="mt-4 flex flex-col gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={locale === 'ru' ? 'Поиск по названию' : 'Search by name'}
                className="rounded-xl border border-white/10 bg-surface/40 px-4 py-2 text-sm text-bone-white placeholder:text-ash-gray focus:border-electric-iris/60 focus:outline-none"
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
                          : 'border-white/10 text-ash-gray hover:border-white/25'
                      }`}
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: sector.color }}
                        aria-hidden="true"
                      />
                      {pick(sector, 'label', locale)}
                    </button>
                  )
                })}
              </div>

              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-fit rounded-xl border border-white/10 bg-surface/40 px-4 py-2 text-sm text-bone-white focus:border-electric-iris/60 focus:outline-none"
              >
                <option value="all">{locale === 'ru' ? 'Все регионы' : 'All regions'}</option>
                {companiesData.regions.map((region) => (
                  <option key={region.code} value={region.code}>
                    {locale === 'ru' ? region.ru : region.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 max-h-[640px] overflow-y-auto rounded-2xl border border-white/10">
              {filteredCompanies.length === 0 && (
                <p className="p-6 text-sm text-ash-gray">
                  {locale === 'ru' ? 'Ничего не найдено.' : 'Nothing found.'}
                </p>
              )}
              {filteredCompanies.map((company) => {
                const city = getCity(company.city)
                const sector = getSector(company.sector)
                const isSelected = selectedSet.has(company.id)
                const atMax = !isSelected && selectedCompanies.length >= config.max
                return (
                  <div
                    key={company.id}
                    className="flex items-center justify-between gap-4 border-b border-white/5 px-5 py-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-bone-white">{company.name_en}</p>
                      <p className="mt-0.5 truncate text-xs text-ash-gray">
                        {sector ? pick(sector, 'label', locale) : company.sector} ·{' '}
                        {city ? pick(city, 'name', locale) : company.city}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleCompany(company.id)}
                      disabled={atMax}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        isSelected
                          ? 'border-electric-iris bg-electric-iris text-bone-white'
                          : atMax
                            ? 'cursor-not-allowed border-white/10 text-ash-gray/40'
                            : 'border-white/15 text-ash-gray hover:border-electric-iris/60 hover:text-bone-white'
                      }`}
                      aria-label={isSelected ? 'Remove' : 'Add'}
                    >
                      {isSelected ? <Check size={14} /> : <Plus size={14} />}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.025em] text-ash-gray">
              {locale === 'ru' ? '3. Ваш список' : '3. Your list'}
            </h2>
            <div className="mt-4 rounded-2xl border border-white/10 bg-surface/40 p-5">
              <p className="text-sm text-silver-mist">
                {selectedCompanies.length} / {config.max}{' '}
                {locale === 'ru' ? 'компаний' : 'companies'}
                {selectedCompanies.length < config.min && (
                  <span className="text-ash-gray">
                    {' '}
                    ({locale === 'ru' ? `минимум ${config.min}` : `minimum ${config.min}`})
                  </span>
                )}
              </p>

              {selectedCompanies.length === 0 ? (
                <p className="mt-4 text-sm text-ash-gray">
                  {locale === 'ru' ? 'Пока пусто — добавьте компании слева.' : 'Empty so far — add companies on the left.'}
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {selectedCompanies.map((company) => (
                    <li key={company.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-bone-white">{company.name_en}</span>
                      <button
                        type="button"
                        onClick={() => toggleCompany(company.id)}
                        className="shrink-0 text-ash-gray hover:text-bone-white"
                        aria-label="Remove"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => setSubmitted(true)}
                className={`mt-6 w-full rounded-full px-6 py-3 text-sm font-medium transition-opacity ${
                  canSubmit
                    ? 'bg-electric-iris text-bone-white hover:opacity-90'
                    : 'cursor-not-allowed bg-white/10 text-ash-gray'
                }`}
              >
                {locale === 'ru' ? 'Отправить заявку' : 'Submit request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {submitted && config && (
        <div className="mt-16 border-t border-white/10 pt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.025em] text-saffron-spark">
            {locale === 'ru' ? 'Предпросмотр' : 'Preview'}
          </p>
          <h2 className="mt-3 text-2xl font-normal tracking-[-0.02em]">
            {locale === 'ru' ? 'Черновой план по дням' : 'Draft day-by-day plan'}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-silver-mist">
            {locale === 'ru'
              ? 'Это предварительная группировка по городам — реальный маршрут и логистику соберёт команда Aura Robotics.'
              : "This is a preliminary city grouping — the Aura Robotics team will assemble the real route and logistics."}
          </p>

          <ol className="mt-8 space-y-4">
            {itinerary.map((day) => (
              <li key={day.day} className="rounded-xl border border-white/10 bg-surface/40 p-4">
                <p className="text-sm font-medium text-bone-white">
                  {locale === 'ru' ? 'День' : 'Day'} {day.day}
                </p>
                {day.clusters.length === 0 ? (
                  <p className="mt-1 text-xs text-ash-gray">
                    {locale === 'ru' ? '—' : '—'}
                  </p>
                ) : (
                  day.clusters.map((cluster) => {
                    const city = getCity(cluster.cityId)
                    return (
                      <div key={cluster.cityId} className="mt-2">
                        <p className="text-xs text-electric-iris">
                          {city ? pick(city, 'name', locale) : cluster.cityId}
                        </p>
                        <p className="mt-1 text-sm text-silver-mist">
                          {cluster.companies.map((c) => c.name_en).join(', ')}
                        </p>
                      </div>
                    )
                  })
                )}
              </li>
            ))}
          </ol>

          <div className="mt-8 rounded-2xl border border-electric-iris/40 bg-electric-iris/10 p-6">
            <p className="text-sm font-medium text-bone-white">
              {locale === 'ru' ? 'Заявка получена (демо)' : 'Request received (demo)'}
            </p>
            <p className="mt-2 text-sm text-silver-mist">
              {locale === 'ru'
                ? 'Форма с реальной отправкой на email и в Telegram появится позже. Пока оставьте контакт напрямую.'
                : 'The form with real email/Telegram delivery lands later. For now, reach out directly.'}
            </p>
            <Link
              to="/contacts"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-electric-iris px-6 py-3 text-sm font-medium text-bone-white transition-opacity hover:opacity-90"
            >
              {locale === 'ru' ? 'Перейти в контакты' : 'Go to contacts'}
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}

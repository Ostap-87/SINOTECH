import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, Download, Plus, X } from 'lucide-react'
import { useLanguage, pick } from '@/i18n/LanguageContext'
import { companiesData, getCity, getSector, companyNameZh } from '@/data'
import type { Company } from '@/types/data'
import { RouteMap } from '@/components/RouteMap'
import type { RouteMapStop } from '@/components/RouteMap'
import { ParticleCanvas } from '@/components/ParticleCanvas'
import type { ParticleCanvasHandle } from '@/components/ParticleCanvas'
import { useShapeExitNavigate } from '@/hooks/useShapeExitNavigate'
import { DatePicker } from '@/components/DatePicker'
import { generateRequestPdf } from '@/lib/generateRequestPdf'
import type { PdfDay } from '@/lib/generateRequestPdf'

type FormatKey = '2' | '5'

// 2-day trips stay inside one region — the distances between regions make a
// 2-day multi-region itinerary impractical (too much travel time relative to
// meeting time), so 4 meetings within a single region is the realistic ceiling.
const FORMAT_CONFIG: Record<FormatKey, { days: number; min: number; max: number; regionLocked: boolean }> = {
  '2': { days: 2, min: 4, max: 4, regionLocked: true },
  '5': { days: 5, min: 8, max: 14, regionLocked: false },
}

interface CityCluster {
  cityId: string
  companies: Company[]
}

interface DayPlan {
  day: number
  clusters: CityCluster[]
}

// Some companies (JD.com, Xiaomi, Baidu, Huawei, Alibaba, Tencent) keep
// branches in every major hub rather than one fixed office — the catalogue
// only lists one physical row per real company, so this expands each into a
// per-branch entry for the constructor (e.g. "Baidu · Shenzhen"), letting a
// region filter surface the branch that's actually in that region instead
// of hiding the company entirely because its single listed city sits
// elsewhere.
const MULTI_BRANCH_HUBS = ['beijing', 'shanghai', 'hangzhou', 'guangzhou', 'shenzhen']
const MULTI_BRANCH_COMPANY_IDS = ['baidu', 'alibaba', 'tencent', 'xiaomi', 'jd-com', 'huawei']

function buildBranchCompanies(): Company[] {
  const out: Company[] = []
  for (const company of companiesData.companies) {
    if (!MULTI_BRANCH_COMPANY_IDS.includes(company.id)) {
      out.push(company)
      continue
    }
    for (const cityId of MULTI_BRANCH_HUBS) {
      out.push({ ...company, id: `${company.id}__${cityId}`, city: cityId })
    }
  }
  return out
}

const BRANCH_COMPANIES = buildBranchCompanies()

/** "Baidu (百度)" stays as-is for a regular company; a branch entry becomes "Baidu (百度) — Shenzhen". */
function companyDisplayName(company: Company, locale: 'ru' | 'en'): string {
  const separatorIndex = company.id.indexOf('__')
  if (separatorIndex === -1) return companyNameZh(company)
  const city = getCity(company.city)
  return `${companyNameZh(company)} — ${city ? pick(city, 'name', locale) : company.city}`
}

// The generated PDF is set in a Latin/Cyrillic font (jsPDF has no CJK glyphs
// embedded — that font would be several more megabytes), so PDF text uses
// the English name only instead of leaving stray empty parentheses where
// the Chinese name silently failed to render.
function companyDisplayNamePlain(company: Company, locale: 'ru' | 'en'): string {
  const separatorIndex = company.id.indexOf('__')
  if (separatorIndex === -1) return company.name_en
  const city = getCity(company.city)
  return `${company.name_en} — ${city ? pick(city, 'name', locale) : company.city}`
}

// Distributes companies across days as evenly as possible (e.g. exactly 2+2
// for the 2-day format's 4 meetings) instead of dumping everything into day
// one whenever several selected companies share a city — sorting by city
// latitude first keeps same-city companies adjacent, so a cluster only
// splits across days when it has to in order to fill every day.
function buildItinerary(companies: Company[], days: number): DayPlan[] {
  const sorted = [...companies].sort((a, b) => (getCity(b.city)?.lat ?? 0) - (getCity(a.city)?.lat ?? 0))
  const target = Math.max(1, Math.ceil(sorted.length / days))
  const plan: DayPlan[] = Array.from({ length: days }, (_, i) => ({ day: i + 1, clusters: [] }))

  sorted.forEach((company, i) => {
    const dayIndex = Math.min(Math.floor(i / target), days - 1)
    const clusters = plan[dayIndex].clusters
    const existing = clusters.find((c) => c.cityId === company.city)
    if (existing) existing.companies.push(company)
    else clusters.push({ cityId: company.city, companies: [company] })
  })

  return plan
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDate(date: Date, locale: 'ru' | 'en'): string {
  return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateRange(start: Date, end: Date, locale: 'ru' | 'en'): string {
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  const startLabel = start.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: sameMonth ? undefined : 'long',
  })
  return `${startLabel} – ${formatDate(end, locale)}`
}

interface ContactForm {
  companyName: string
  name: string
  phone: string
  email: string
  telegram: string
}

const EMPTY_CONTACT: ContactForm = { companyName: '', name: '', phone: '', email: '', telegram: '' }

type WizardStage = 'select' | 'details' | 'done'

/** Fades + slides a freshly-mounted step into place instead of having it pop in abruptly. */
const RevealSection = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  function RevealSection({ children, className = '' }, ref) {
    const [visible, setVisible] = useState(false)
    useEffect(() => {
      const id = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(id)
    }, [])
    return (
      <div
        ref={ref}
        className={className}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(18px)',
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        }}
      >
        {children}
      </div>
    )
  },
)

export function Constructor() {
  const { locale } = useLanguage()
  const [searchParams] = useSearchParams()
  const initialSector = searchParams.get('sector')
  const canvasHandleRef = useRef<ParticleCanvasHandle>(null)
  const { goTo, isLeaving, durationMs } = useShapeExitNavigate(canvasHandleRef)

  const step2Ref = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const [format, setFormat] = useState<FormatKey | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sectorFilter, setSectorFilter] = useState<Set<string>>(
    () => new Set(initialSector ? [initialSector] : []),
  )
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const [stage, setStage] = useState<WizardStage>('select')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [peopleCount, setPeopleCount] = useState(2)
  const [contact, setContact] = useState<ContactForm>(EMPTY_CONTACT)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const config = format ? FORMAT_CONFIG[format] : null

  // Each step reveals below the last rather than replacing it, so scroll the
  // newly-mounted section into view instead of leaving the user looking at
  // an unchanged viewport — a short delay lets the section actually mount
  // (and, for the format step, the reveal transition start) before scrolling.
  useEffect(() => {
    if (!format) return
    const id = window.setTimeout(() => {
      step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
    return () => window.clearTimeout(id)
  }, [format])

  useEffect(() => {
    if (stage === 'select') return
    const id = window.setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
    return () => window.clearTimeout(id)
  }, [stage])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const selectedCompanies = useMemo(
    () => selectedIds.map((id) => BRANCH_COMPANIES.find((c) => c.id === id)).filter(Boolean) as Company[],
    [selectedIds],
  )

  const filteredCompanies = useMemo(() => {
    const q = search.trim().toLowerCase()
    return BRANCH_COMPANIES.filter((company) => {
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
    setStage('select')
    if (FORMAT_CONFIG[key].regionLocked) {
      // A fresh region choice is required for a locked format — any prior
      // selection may span regions that are no longer valid together.
      setRegionFilter('all')
      setSelectedIds([])
    } else {
      const max = FORMAT_CONFIG[key].max
      setSelectedIds((prev) => (prev.length > max ? prev.slice(0, max) : prev))
    }
  }

  function chooseRegion(code: string) {
    setRegionFilter(code)
    if (config?.regionLocked) setSelectedIds([])
  }

  const canSubmit = !!config && selectedCompanies.length >= config.min
  const itinerary = config ? buildItinerary(selectedCompanies, config.days) : []

  const routeStops: RouteMapStop[] = itinerary
    .filter((day) => day.clusters.length > 0)
    .map((day) => {
      const primary = day.clusters[0]
      const city = getCity(primary.cityId)
      return {
        key: `day-${day.day}`,
        day: day.day,
        cityId: primary.cityId,
        cityLabel: city ? pick(city, 'name', locale) : primary.cityId,
        companies: day.clusters.flatMap((cluster) => cluster.companies.map((c) => companyDisplayName(c, locale))),
      }
    })

  const endDate = startDate && config ? addDays(startDate, config.days - 1) : null
  const contactValid =
    contact.companyName.trim().length > 0 &&
    contact.name.trim().length > 0 &&
    contact.phone.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(contact.email.trim())
  const canFinalize = !!startDate && peopleCount >= 1 && contactValid

  async function handleFinalSubmit() {
    if (!config || !startDate || !canFinalize || generating) return
    setGenerating(true)
    try {
      const pdfDays: PdfDay[] = itinerary.map((day) => ({
        dayNumber: day.day,
        date: formatDate(addDays(startDate, day.day - 1), locale),
        clusters: day.clusters.map((cluster) => {
          const city = getCity(cluster.cityId)
          return {
            cityLabel: city ? pick(city, 'name', locale) : cluster.cityId,
            companyLines: cluster.companies.map((c) => companyDisplayNamePlain(c, locale)),
          }
        }),
      }))

      const blob = await generateRequestPdf({
        locale,
        tourTitle: locale === 'ru' ? 'Индивидуальная программа' : 'Custom program',
        tripDays: config.days,
        dateRangeLabel: formatDateRange(startDate, endDate!, locale),
        peopleCount,
        companyLines: selectedCompanies.map((c) => companyDisplayNamePlain(c, locale)),
        itinerary: pdfDays,
        contact,
      })
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      setStage('done')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 min-h-[560px] lg:min-h-[640px]">
          <ParticleCanvas ref={canvasHandleRef} shape="china" layout="centered" />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-64"
            style={{
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              maskImage: 'linear-gradient(to bottom, transparent, black)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)',
            }}
          />
        </div>

        <div
          className="pointer-events-none relative z-10 mx-auto min-h-[560px] max-w-2xl px-6 pt-24 pb-16 text-center lg:min-h-[640px]"
          style={{ opacity: isLeaving ? 0 : 1, transition: `opacity ${durationMs}ms ease-in-out` }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.025em] text-saffron-spark">
            {locale === 'ru' ? 'Конструктор' : 'Constructor'}
          </p>
          <h1 className="mt-6 text-[36px] font-normal leading-[1.05] tracking-[-0.04em] sm:text-[48px] lg:text-[56px]">
            {locale === 'ru' ? 'Соберите свою программу' : 'Build your own program'}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg font-normal text-silver-mist">
            {locale === 'ru'
              ? 'Выберите формат, отметьте компании — мы возьмём список за основу и соберём маршрут вручную.'
              : 'Pick a format, mark the companies you want — we take that list and assemble the route by hand.'}
          </p>

          <div className="pointer-events-auto mt-[38px]">
            <h2 className="inline-block rounded-full bg-void/70 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.025em] text-bone-white backdrop-blur-sm">
              {locale === 'ru' ? '1. Формат тура' : '1. Tour format'}
            </h2>
            <div className="mx-auto mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {(Object.keys(FORMAT_CONFIG) as FormatKey[]).map((key) => {
                const cfg = FORMAT_CONFIG[key]
                const active = format === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => chooseFormat(key)}
                    className={`rounded-2xl border p-8 text-center backdrop-blur-sm transition-colors ${
                      active
                        ? 'border-electric-iris bg-void/70 ring-1 ring-electric-iris'
                        : 'border-black/10 bg-void/60 hover:border-black/25'
                    }`}
                  >
                    <p className="text-2xl font-medium text-bone-white">
                      {cfg.days} {locale === 'ru' ? 'дней' : 'days'}
                    </p>
                    <p className="mt-2 text-base text-bone-white">
                      {cfg.min === cfg.max
                        ? `${cfg.min} ${locale === 'ru' ? 'компании' : 'companies'}`
                        : `${cfg.min}–${cfg.max} ${locale === 'ru' ? 'компаний' : 'companies'}`}
                    </p>
                    {cfg.regionLocked && (
                      <p className="mt-1 text-sm text-ash-gray">
                        {locale === 'ru' ? 'в рамках одного региона' : 'within a single region'}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1280px] px-6 pb-24">
      {config && (
        <RevealSection ref={step2Ref} className="mx-auto mt-16 max-w-4xl scroll-mt-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.025em] text-ash-gray">
              {locale === 'ru' ? '2. Выберите компании' : '2. Choose companies'}
            </h2>

            <div className="mt-4 flex flex-col gap-3">
              {config.regionLocked && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">
                    {locale === 'ru' ? 'Регион (обязательно)' : 'Region (required)'}
                  </label>
                  <select
                    value={regionFilter}
                    onChange={(e) => chooseRegion(e.target.value)}
                    className="w-fit rounded-xl border border-electric-iris/50 bg-surface/40 px-4 py-2 text-sm text-bone-white focus:border-electric-iris/60 focus:outline-none"
                  >
                    <option value="all" disabled>
                      {locale === 'ru' ? 'Выберите регион…' : 'Choose a region…'}
                    </option>
                    {companiesData.regions.map((region) => (
                      <option key={region.code} value={region.code}>
                        {locale === 'ru' ? region.ru : region.en}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 max-w-sm text-xs text-ash-gray">
                    {locale === 'ru'
                      ? 'Формат 2 дня работает в рамках одного региона — большие расстояния между регионами съедают время встреч.'
                      : "The 2-day format stays within one region — long distances between regions eat into meeting time."}
                  </p>
                </div>
              )}

              {(!config.regionLocked || regionFilter !== 'all') && (
                <>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={locale === 'ru' ? 'Поиск по названию' : 'Search by name'}
                    className="rounded-xl border border-black/10 bg-surface/40 px-4 py-2 text-sm text-bone-white placeholder:text-ash-gray focus:border-electric-iris/60 focus:outline-none"
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

                  {!config.regionLocked && (
                    <select
                      value={regionFilter}
                      onChange={(e) => setRegionFilter(e.target.value)}
                      className="w-fit rounded-xl border border-black/10 bg-surface/40 px-4 py-2 text-sm text-bone-white focus:border-electric-iris/60 focus:outline-none"
                    >
                      <option value="all">{locale === 'ru' ? 'Все регионы' : 'All regions'}</option>
                      {companiesData.regions.map((region) => (
                        <option key={region.code} value={region.code}>
                          {locale === 'ru' ? region.ru : region.en}
                        </option>
                      ))}
                    </select>
                  )}
                </>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.025em] text-ash-gray">
              {locale === 'ru' ? 'Список компаний' : 'Company list'}
            </h2>

            {config.regionLocked && regionFilter === 'all' ? (
              <p className="mt-4 text-sm text-ash-gray">
                {locale === 'ru'
                  ? 'Сначала выберите регион, чтобы увидеть компании.'
                  : 'Choose a region first to see companies.'}
              </p>
            ) : (
              <div className="mt-4 max-h-[640px] overflow-y-auto rounded-2xl border border-black/10">
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
                      className="flex items-center justify-between gap-4 border-b border-black/5 px-5 py-3 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-bone-white">
                          {companyDisplayName(company, locale)}
                        </p>
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
                          ? 'border-electric-iris bg-electric-iris text-white'
                          : atMax
                            ? 'cursor-not-allowed border-black/10 text-ash-gray/40'
                            : 'border-black/15 text-ash-gray hover:border-electric-iris/60 hover:text-bone-white'
                      }`}
                      aria-label={isSelected ? 'Remove' : 'Add'}
                    >
                      {isSelected ? <Check size={14} /> : <Plus size={14} />}
                    </button>
                  </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.025em] text-ash-gray">
            {locale === 'ru' ? '3. Ваш список' : '3. Your list'}
          </h2>
          <div className="mt-4 rounded-2xl border border-black/10 bg-surface/40 p-5">
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
                  {locale === 'ru' ? 'Пока пусто — добавьте компании из списка выше.' : 'Empty so far — add companies from the list above.'}
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {selectedCompanies.map((company) => (
                    <li key={company.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-bone-white">{companyDisplayName(company, locale)}</span>
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
                onClick={() => setStage('details')}
                className={`mt-6 w-full rounded-full px-6 py-3 text-sm font-medium transition-opacity ${
                  canSubmit
                    ? 'bg-electric-iris text-white hover:opacity-90'
                    : 'cursor-not-allowed bg-black/10 text-ash-gray'
                }`}
              >
                {locale === 'ru' ? 'Далее' : 'Next'}
              </button>
          </div>
        </div>
        </RevealSection>
      )}

      {(stage === 'details' || stage === 'done') && config && (
        <RevealSection ref={previewRef} className="mx-auto mt-16 max-w-3xl scroll-mt-24 border-t border-black/10 pt-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.025em] text-saffron-spark">
            {locale === 'ru' ? 'Предпросмотр' : 'Preview'}
          </p>
          <h2 className="mt-3 text-2xl font-normal tracking-[-0.02em]">
            {locale === 'ru' ? 'Черновой план по дням' : 'Draft day-by-day plan'}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-silver-mist">
            {locale === 'ru'
              ? 'Это предварительная группировка по городам — реальный маршрут и логистику соберёт команда Aura Robotics.'
              : "This is a preliminary city grouping — the Aura Robotics team will assemble the real route and logistics."}
          </p>

          {routeStops.length > 0 && (
            <RouteMap
              stops={routeStops}
              className="mx-auto mt-8 max-w-xl"
              regionCode={config?.regionLocked && regionFilter !== 'all' ? regionFilter : undefined}
            />
          )}

          <ol className="mt-8 space-y-4 text-left">
            {itinerary.map((day) => (
              <li key={day.day} className="rounded-xl border border-black/10 bg-surface/40 p-4">
                <p className="text-sm font-medium text-bone-white">
                  {locale === 'ru' ? 'День' : 'Day'} {day.day}
                  {startDate && ` · ${formatDate(addDays(startDate, day.day - 1), locale)}`}
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
                          {cluster.companies.map((c) => companyDisplayName(c, locale)).join(', ')}
                        </p>
                      </div>
                    )
                  })
                )}
              </li>
            ))}
          </ol>

          {stage === 'details' && (
            <div className="mt-12 grid grid-cols-1 gap-10 text-left lg:grid-cols-2">
              <div className="flex flex-col items-center text-center">
                <h2 className="text-sm font-semibold uppercase tracking-[0.025em] text-ash-gray">
                  {locale === 'ru' ? '3. Выберите дату начала' : '3. Choose a start date'}
                </h2>
                <p className="mt-2 max-w-sm text-xs text-ash-gray">
                  {locale === 'ru'
                    ? `Программа длится ${config.days} ${config.days === 2 ? 'дня' : 'дней'} — конечная дата рассчитается автоматически.`
                    : `The program runs ${config.days} days — the end date is calculated automatically.`}
                </p>
                <div className="mt-4">
                  <DatePicker value={startDate} onChange={setStartDate} tripDays={config.days} />
                </div>
                {startDate && endDate && (
                  <p className="mt-3 text-sm text-bone-white">{formatDateRange(startDate, endDate, locale)}</p>
                )}

                <h2 className="mt-10 text-sm font-semibold uppercase tracking-[0.025em] text-ash-gray">
                  {locale === 'ru' ? '4. Количество человек' : '4. Number of people'}
                </h2>
                <div className="mt-4 flex w-fit items-center gap-4 rounded-2xl border border-black/10 bg-surface/40 px-5 py-3">
                  <button
                    type="button"
                    onClick={() => setPeopleCount((n) => Math.max(1, n - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-black/15 text-bone-white transition-colors hover:border-electric-iris/60"
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-lg font-medium text-bone-white">{peopleCount}</span>
                  <button
                    type="button"
                    onClick={() => setPeopleCount((n) => Math.min(50, n + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-black/15 text-bone-white transition-colors hover:border-electric-iris/60"
                    aria-label="Increase"
                  >
                    +
                  </button>
                  <span className="text-sm text-ash-gray">{locale === 'ru' ? 'участников' : 'participants'}</span>
                </div>
              </div>

              <div className="mx-auto w-full max-w-sm">
                <h2 className="text-sm font-semibold uppercase tracking-[0.025em] text-ash-gray">
                  {locale === 'ru' ? '5. Контактные данные' : '5. Contact details'}
                </h2>
                <div className="mt-4 flex flex-col gap-3">
                  <input
                    type="text"
                    value={contact.companyName}
                    onChange={(e) => setContact((c) => ({ ...c, companyName: e.target.value }))}
                    placeholder={locale === 'ru' ? 'Название компании' : 'Company name'}
                    className="rounded-xl border border-black/10 bg-surface/40 px-4 py-2.5 text-sm text-bone-white placeholder:text-ash-gray focus:border-electric-iris/60 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                    placeholder={locale === 'ru' ? 'Имя' : 'Name'}
                    className="rounded-xl border border-black/10 bg-surface/40 px-4 py-2.5 text-sm text-bone-white placeholder:text-ash-gray focus:border-electric-iris/60 focus:outline-none"
                  />
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                    placeholder={locale === 'ru' ? 'Телефон' : 'Phone'}
                    className="rounded-xl border border-black/10 bg-surface/40 px-4 py-2.5 text-sm text-bone-white placeholder:text-ash-gray focus:border-electric-iris/60 focus:outline-none"
                  />
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                    placeholder={locale === 'ru' ? 'Email' : 'Email'}
                    className="rounded-xl border border-black/10 bg-surface/40 px-4 py-2.5 text-sm text-bone-white placeholder:text-ash-gray focus:border-electric-iris/60 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={contact.telegram}
                    onChange={(e) => setContact((c) => ({ ...c, telegram: e.target.value }))}
                    placeholder="Telegram (@username)"
                    className="rounded-xl border border-black/10 bg-surface/40 px-4 py-2.5 text-sm text-bone-white placeholder:text-ash-gray focus:border-electric-iris/60 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={!canFinalize || generating}
                  onClick={handleFinalSubmit}
                  className={`mt-6 w-full rounded-full px-6 py-3 text-sm font-medium transition-opacity ${
                    canFinalize && !generating
                      ? 'bg-electric-iris text-white hover:opacity-90'
                      : 'cursor-not-allowed bg-black/10 text-ash-gray'
                  }`}
                >
                  {generating
                    ? locale === 'ru'
                      ? 'Формируем PDF…'
                      : 'Generating PDF…'
                    : locale === 'ru'
                      ? 'Отправить заявку'
                      : 'Submit request'}
                </button>
              </div>
            </div>
          )}

          {stage === 'done' && (
            <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-electric-iris/40 bg-electric-iris/10 p-6">
              <p className="text-lg font-medium text-bone-white">
                {locale === 'ru' ? 'Спасибо за заявку!' : 'Thank you for your request!'}
              </p>
              <p className="mt-2 text-sm text-silver-mist">
                {locale === 'ru'
                  ? 'PDF с программой и вашими данными сформирован — скачайте его ниже.'
                  : "The program PDF with your details is ready — download it below."}
              </p>
              <p className="mt-2 text-xs text-ash-gray">
                {locale === 'ru'
                  ? 'Сайт пока статический: автоматическая отправка PDF на почту и сохранение заявки в CRM появятся, когда будет подключён email-сервис — свяжитесь с нами напрямую, чтобы мы получили заявку прямо сейчас.'
                  : "The site is static for now: automatic emailing of the PDF and saving the request to a CRM will land once an email service is connected — reach out directly so we get your request right away."}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    download={`sinotech-voyage-request-${startDate ? toIsoDate(startDate) : 'draft'}.pdf`}
                    className="inline-flex items-center gap-2 rounded-full bg-electric-iris px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  >
                    <Download size={16} />
                    {locale === 'ru' ? 'Скачать PDF' : 'Download PDF'}
                  </a>
                )}
                <Link
                  to="/contacts"
                  onClick={(event) => goTo('/contacts', event)}
                  className="inline-flex items-center justify-center rounded-full border border-black/15 px-6 py-3 text-sm font-medium text-bone-white transition-colors hover:bg-surface"
                >
                  {locale === 'ru' ? 'Перейти в контакты' : 'Go to contacts'}
                </Link>
              </div>
            </div>
          )}
        </RevealSection>
      )}
      </section>
    </>
  )
}

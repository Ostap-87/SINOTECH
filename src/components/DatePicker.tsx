import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'

const WEEKDAY_LABELS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const WEEKDAY_LABELS_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const MONTH_LABELS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]
const MONTH_LABELS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/**
 * A single-month calendar grid for picking a trip start date — the trip
 * length is fixed by the chosen format, so this only needs to collect one
 * date; the resulting range (start → start + tripDays - 1) is highlighted
 * as soon as a day is picked.
 */
export function DatePicker({
  value,
  onChange,
  tripDays,
}: {
  value: Date | null
  onChange: (date: Date) => void
  tripDays: number
}) {
  const { locale } = useLanguage()
  const today = startOfDay(new Date())
  const [viewMonth, setViewMonth] = useState(() => {
    const base = value ?? today
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const weekdayLabels = locale === 'ru' ? WEEKDAY_LABELS_RU : WEEKDAY_LABELS_EN
  const monthLabels = locale === 'ru' ? MONTH_LABELS_RU : MONTH_LABELS_EN

  const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()
  // Monday-first offset: JS getDay() is 0=Sunday..6=Saturday.
  const leadingBlank = (firstOfMonth.getDay() + 6) % 7

  const rangeStart = value ? startOfDay(value) : null
  const rangeEnd = rangeStart ? addDays(rangeStart, tripDays - 1) : null

  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlank }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1)),
  ]

  return (
    <div className="w-fit rounded-2xl border border-black/10 bg-surface/40 p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-ash-gray transition-colors hover:bg-black/5 hover:text-bone-white"
          aria-label="Previous month"
        >
          <ChevronLeft size={14} />
        </button>
        <p className="text-sm font-medium text-bone-white">
          {monthLabels[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </p>
        <button
          type="button"
          onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-ash-gray transition-colors hover:bg-black/5 hover:text-bone-white"
          aria-label="Next month"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-ash-gray">
        {weekdayLabels.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />
          const disabled = date < today
          const isStart = rangeStart && toDateKey(date) === toDateKey(rangeStart)
          const isInRange = rangeStart && rangeEnd && date >= rangeStart && date <= rangeEnd
          return (
            <button
              key={toDateKey(date)}
              type="button"
              data-date={toDateKey(date)}
              disabled={disabled}
              onClick={() => onChange(date)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${
                disabled
                  ? 'cursor-not-allowed text-ash-gray/30'
                  : isStart
                    ? 'bg-electric-iris font-medium text-white'
                    : isInRange
                      ? 'bg-electric-iris/15 text-bone-white'
                      : 'text-bone-white hover:bg-black/5'
              }`}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

import { getSector } from '@/data'
import type { Company } from '@/types/data'

/**
 * No real company logos are on file (350+ companies, third-party brand
 * marks) — this renders an honest placeholder instead: a monogram from the
 * company's own Chinese initial, tinted with its sector color, rather than
 * a fake or generic icon.
 */
export function CompanyMark({ company, size = 48 }: { company: Company; size?: number }) {
  const sector = getSector(company.sector)
  const color = sector?.color ?? '#2563eb'
  const glyph = company.name_zh?.[0] ?? company.name_en[0]

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-2xl font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {glyph}
    </div>
  )
}

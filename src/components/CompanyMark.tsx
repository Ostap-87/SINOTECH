import { useState } from 'react'
import { getSector } from '@/data'
import type { Company } from '@/types/data'

/**
 * Real brand logos are only on file for a subset of companies — where
 * company.logo is set, render that (on a plain white tile, since most
 * source marks assume a light background). Everywhere else, fall back to
 * an honest placeholder: a monogram from the company's own Chinese
 * initial, tinted with its sector color, rather than a fake or generic
 * icon.
 */
export function CompanyMark({ company, size = 48 }: { company: Company; size?: number }) {
  const sector = getSector(company.sector)
  const color = sector?.color ?? '#2563eb'
  const glyph = company.name_zh?.[0] ?? company.name_en[0]
  const [logoFailed, setLogoFailed] = useState(false)

  if (company.logo && !logoFailed) {
    const pad = Math.round(size * 0.15)
    return (
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white"
        style={{ width: size, height: size, padding: pad }}
      >
        <img
          src={company.logo}
          alt={`${company.name_en} logo`}
          className="max-h-full max-w-full object-contain"
          onError={() => setLogoFailed(true)}
        />
      </div>
    )
  }

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

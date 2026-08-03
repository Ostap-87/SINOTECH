export type CountryCode = 'cn' | 'in' | 'th' | 'my' | 'jp' | 'kr' | 'id' | 'vn'
export type CompanyStatus = 'gov' | 'catalog' | 'plan'

export interface Country {
  code: CountryCode
  name_en: string
  name_ru: string
  active: boolean
  status?: string
}

export interface Region {
  code: string
  en: string
  ru: string
}

export interface Sector {
  code: string
  label_en: string
  label_ru: string
  color: string
}

export interface City {
  id: string
  name_en: string
  name_ru: string
  province_en: string
  province_ru: string
  region: string
  lat: number
  lng: number
  country: CountryCode
}

/** A company as stored in companies.json — location/coords are looked up via `city` → City. */
export interface Company {
  id: string
  name_en: string
  name_zh: string
  sector: string
  city: string
  status: CompanyStatus
  own_supplier: boolean
  category_en: string | null
  category_ru: string | null
  desc_en: string
  desc_ru: string
  country: CountryCode
}

/**
 * A published blog article, as stored in site_content.example.json → blog[].
 * Automation writing new posts should append objects of this shape to that
 * array — see the comment on `blogPosts` in src/data/index.ts.
 */
export interface BlogPost {
  id: string
  slug: string
  title_en: string
  title_ru: string
  cover: string | null
  date: string
  excerpt_en: string
  excerpt_ru: string
  body_en: string
  body_ru: string
  tags: string[]
  author: string
}

export interface CompaniesData {
  meta: {
    project: string
    version: string
    languages: string[]
    counts: {
      companies: number
      sectors: number
      cities: number
      own_supplier: number
      countries: number
      countries_active: number
    }
    status_legend: Record<CompanyStatus, string>
    notes: string
  }
  countries: Country[]
  regions: Region[]
  sectors: Sector[]
  cities: City[]
  companies: Company[]
}

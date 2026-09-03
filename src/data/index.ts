import companiesRaw from './companies.json'
import toursRaw from './tours.json'
import siteContentRaw from './site_content.example.json'
import type { CompaniesData, Company, BlogPost, CaseStudy } from '@/types/data'

export const companiesData = companiesRaw as CompaniesData
export const toursData = toursRaw
export const siteContent = siteContentRaw

/**
 * Published blog posts, newest first. Despite the "example" filename,
 * site_content.example.json is the live content source imported at build
 * time — a future automation should append new BlogPost objects to its
 * `blog` array (unique `slug`, `id`, ISO `date`) to publish an article; no
 * other wiring is needed, generate-sitemap.mjs and the /blog routes both
 * read from the same array.
 */
export const blogPosts: BlogPost[] = [...(siteContentRaw.blog as BlogPost[])].sort((a, b) =>
  b.date.localeCompare(a.date),
)

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}

/**
 * Case studies with a real participant testimonial and real (non-placeholder)
 * photo — powers the "Фото с прошедших мероприятий" section on /cases.
 * `cases` in site_content.example.json ships with REPLACE-prefixed example
 * URLs and empty testimonials for entries not yet filled in; those are
 * filtered out here so the section never shows a broken image or an empty
 * quote — add real photo URLs + testimonial_ru/en to publish one.
 */
export const eventTestimonials: CaseStudy[] = (siteContentRaw.cases as CaseStudy[])
  .filter(
    (c) =>
      (c.testimonial_ru || c.testimonial_en) &&
      c.media.some((m) => m.kind === 'photo' && !m.url.includes('REPLACE')),
  )
  .sort((a, b) => b.date.localeCompare(a.date))

const cityById = new Map(companiesData.cities.map((city) => [city.id, city]))
const sectorByCode = new Map(companiesData.sectors.map((sector) => [sector.code, sector]))

export function getCity(id: string) {
  return cityById.get(id)
}

export function getSector(code: string) {
  return sectorByCode.get(code)
}

export function companiesBySector(code: string) {
  return companiesData.companies.filter((company) => company.sector === code)
}

/** English name with the Chinese name alongside it, e.g. "Chagee (霸王茶姬)". */
export function companyNameZh(company: Pick<Company, 'name_en' | 'name_zh'>): string {
  return company.name_zh ? `${company.name_en} (${company.name_zh})` : company.name_en
}

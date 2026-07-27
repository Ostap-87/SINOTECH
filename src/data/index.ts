import companiesRaw from './companies.json'
import toursRaw from './tours.json'
import siteContentRaw from './site_content.example.json'
import type { CompaniesData, Company } from '@/types/data'

export const companiesData = companiesRaw as CompaniesData
export const toursData = toursRaw
export const siteContent = siteContentRaw

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

import companiesRaw from './companies.json'
import toursRaw from './tours.json'
import siteContentRaw from './site_content.example.json'
import type { CompaniesData } from '@/types/data'

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

import indonesiaOutline from '@/data/indonesia-outline.json'
import { createCountryOutlineGenerator } from './countryOutline'

type Ring = [number, number][]
type Polygon = Ring[]

export const generateIndonesiaPoints = createCountryOutlineGenerator(indonesiaOutline as unknown as Polygon[])

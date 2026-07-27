import japanOutline from '@/data/japan-outline.json'
import { createCountryOutlineGenerator } from './countryOutline'

type Ring = [number, number][]
type Polygon = Ring[]

export const generateJapanPoints = createCountryOutlineGenerator(japanOutline as unknown as Polygon[])

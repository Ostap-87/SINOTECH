import indiaOutline from '@/data/india-outline.json'
import { createCountryOutlineGenerator } from './countryOutline'

type Ring = [number, number][]
type Polygon = Ring[]

export const generateIndiaPoints = createCountryOutlineGenerator(indiaOutline as unknown as Polygon[])

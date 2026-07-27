import thailandOutline from '@/data/thailand-outline.json'
import { createCountryOutlineGenerator } from './countryOutline'

type Ring = [number, number][]
type Polygon = Ring[]

export const generateThailandPoints = createCountryOutlineGenerator(thailandOutline as unknown as Polygon[], -28)

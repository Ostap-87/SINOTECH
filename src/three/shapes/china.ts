import chinaOutline from '@/data/china-outline.json'
import { createCountryOutlineGenerator } from './countryOutline'

type Ring = [number, number][]
type Polygon = Ring[]

export const generateChinaPoints = createCountryOutlineGenerator(chinaOutline as unknown as Polygon[])

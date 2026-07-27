import vietnamOutline from '@/data/vietnam-outline.json'
import { createCountryOutlineGenerator } from './countryOutline'

type Ring = [number, number][]
type Polygon = Ring[]

export const generateVietnamPoints = createCountryOutlineGenerator(vietnamOutline as unknown as Polygon[], -32)

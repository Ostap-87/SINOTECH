import uaeOutline from '@/data/uae-outline.json'
import { createCountryOutlineGenerator } from './countryOutline'

type Ring = [number, number][]
type Polygon = Ring[]

export const generateUaePoints = createCountryOutlineGenerator(uaeOutline as unknown as Polygon[])

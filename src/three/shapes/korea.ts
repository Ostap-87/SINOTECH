import koreaOutline from '@/data/korea-outline.json'
import { createCountryOutlineGenerator } from './countryOutline'

type Ring = [number, number][]
type Polygon = Ring[]

export const generateKoreaPoints = createCountryOutlineGenerator(koreaOutline as unknown as Polygon[])

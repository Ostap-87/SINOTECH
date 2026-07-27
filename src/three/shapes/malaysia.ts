import malaysiaOutline from '@/data/malaysia-outline.json'
import { createCountryOutlineGenerator } from './countryOutline'

type Ring = [number, number][]
type Polygon = Ring[]

export const generateMalaysiaPoints = createCountryOutlineGenerator(malaysiaOutline as unknown as Polygon[])

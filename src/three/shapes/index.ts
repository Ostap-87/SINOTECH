import { generateChinaPoints } from './china'
import { generateBrainPoints } from './brain'
import type { ShapeGenerator } from './types'

export const SHAPE_GENERATORS = {
  china: generateChinaPoints,
  brain: generateBrainPoints,
} satisfies Record<string, ShapeGenerator>

export type ShapeKey = keyof typeof SHAPE_GENERATORS

export function generateShape(key: ShapeKey, count: number) {
  return SHAPE_GENERATORS[key](count)
}

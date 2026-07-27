import { generateChinaPoints } from './china'
import { generateJapanPoints } from './japan'
import { generateKoreaPoints } from './korea'
import { generateIndiaPoints } from './india'
import { generateThailandPoints } from './thailand'
import { generateMalaysiaPoints } from './malaysia'
import { generateBrainPoints } from './brain'
import { generateRobotPoints } from './robot'
import { generateWheelPoints } from './wheel'
import { generateEnergyPoints } from './energy'
import { generateMedtechPoints } from './medtech'
import { generateAerospacePoints } from './aerospace'
import { generateGenericPoints } from './generic'
import type { ShapeGenerator } from './types'

export const SHAPE_GENERATORS = {
  china: generateChinaPoints,
  japan: generateJapanPoints,
  korea: generateKoreaPoints,
  india: generateIndiaPoints,
  thailand: generateThailandPoints,
  malaysia: generateMalaysiaPoints,
  ai: generateBrainPoints,
  robotics: generateRobotPoints,
  auto: generateWheelPoints,
  energy: generateEnergyPoints,
  medtech: generateMedtechPoints,
  aerospace: generateAerospacePoints,
  generic: generateGenericPoints,
} satisfies Record<string, ShapeGenerator>

export type ShapeKey = keyof typeof SHAPE_GENERATORS

/** Sectors without a bespoke icon yet fall back to the neutral gem shape. */
const SECTORS_WITH_SHAPE = new Set<ShapeKey>(['ai', 'robotics', 'auto', 'energy', 'medtech', 'aerospace'])

export function shapeKeyForSector(sectorCode: string): ShapeKey {
  return SECTORS_WITH_SHAPE.has(sectorCode as ShapeKey) ? (sectorCode as ShapeKey) : 'generic'
}

export function generateShape(key: ShapeKey, count: number) {
  return SHAPE_GENERATORS[key](count)
}

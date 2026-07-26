import * as THREE from 'three'

const SILVER = new THREE.Color('#f5f5f7')

/**
 * Distinct particle colors with selection weight — mostly silver/white
 * wireframe with color accents, matching the reference (a flat even split
 * per hue looked too "confetti"). Index 0 is always silver.
 */
export const GROUP_PALETTE: { color: THREE.Color; weight: number }[] = [
  { color: SILVER, weight: 10 },
  { color: new THREE.Color('#8052ff'), weight: 1 }, // electric iris
  { color: new THREE.Color('#ffb829'), weight: 1 }, // saffron spark
  { color: new THREE.Color('#15846e'), weight: 1 }, // deep verdant / teal
  { color: new THREE.Color('#e845b8'), weight: 1 }, // magenta
  { color: new THREE.Color('#3b82f6'), weight: 1 }, // blue
]

const TOTAL_WEIGHT = GROUP_PALETTE.reduce((sum, entry) => sum + entry.weight, 0)

/** Pick a palette group index, weighted per GROUP_PALETTE. */
export function randomGroupIndex(rng: () => number = Math.random): number {
  let target = rng() * TOTAL_WEIGHT
  for (let i = 0; i < GROUP_PALETTE.length; i++) {
    target -= GROUP_PALETTE[i].weight
    if (target <= 0) return i
  }
  return GROUP_PALETTE.length - 1
}

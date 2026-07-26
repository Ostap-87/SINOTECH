import * as THREE from 'three'

/**
 * Light-theme palette: gray, light blue, blue — matching the site's new
 * accent scheme instead of the old dark-bg multi-hue confetti mix. Gray
 * carries most of the weight so the field reads as one coherent shape with
 * blue accents, not a rainbow.
 */
export const GROUP_PALETTE: { color: THREE.Color; weight: number }[] = [
  { color: new THREE.Color('#64748b'), weight: 5 }, // slate gray
  { color: new THREE.Color('#0ea5e9'), weight: 2 }, // light blue (sky)
  { color: new THREE.Color('#2563eb'), weight: 2 }, // blue
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

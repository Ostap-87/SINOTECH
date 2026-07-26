import * as THREE from 'three'
import { createNoise3D } from 'simplex-noise'
import type { PointCloud } from './types'

/**
 * A neutral faceted-gem placeholder for sectors that don't have a bespoke
 * icon yet — a noise-displaced sphere, distinct from the brain/robot/etc.
 * so it doesn't read as "broken," just "generic."
 */

const noise3D = createNoise3D()
const RADIUS = 1.5
const NOISE_SCALE = 1.6
const NOISE_AMOUNT = 0.22
const FACETS = 10 // low facet count so it reads as a gem, not a smooth ball

export function generateGenericPoints(count: number): PointCloud {
  const positions = new Float32Array(count * 3)
  const tmp = new THREE.Vector3()

  for (let i = 0; i < count; i++) {
    const u = Math.random()
    const v = Math.random()
    const theta = Math.acos(2 * u - 1)
    const phi = 2 * Math.PI * v

    // Snap direction to a coarse facet grid before noise, for a gem-like look.
    const facetTheta = Math.round((theta / Math.PI) * FACETS) / FACETS * Math.PI
    const facetPhi = Math.round((phi / (Math.PI * 2)) * FACETS) / FACETS * (Math.PI * 2)

    const dx = Math.sin(facetTheta) * Math.cos(facetPhi)
    const dy = Math.sin(facetTheta) * Math.sin(facetPhi)
    const dz = Math.cos(facetTheta)

    const fold = noise3D(dx * NOISE_SCALE, dy * NOISE_SCALE, dz * NOISE_SCALE)
    const radius = RADIUS * (1 + fold * NOISE_AMOUNT)

    tmp.set(dx * radius, dy * radius, dz * radius)
    positions[i * 3] = tmp.x
    positions[i * 3 + 1] = tmp.y
    positions[i * 3 + 2] = tmp.z
  }

  return { positions }
}

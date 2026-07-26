import * as THREE from 'three'
import type { PointCloud } from './types'

/** A DNA double helix — two intertwined strands with periodic connecting rungs. */

const TURNS = 3
const HEIGHT = 3.6
const RADIUS = 0.55
const RUNG_COUNT = 14
const STRAND_WEIGHT = 0.42 // fraction of particles per strand; remainder go to rungs

function strandPoint(t: number, phaseOffset: number, tmp: THREE.Vector3) {
  const angle = t * TURNS * Math.PI * 2 + phaseOffset
  tmp.set(RADIUS * Math.cos(angle), HEIGHT * (t - 0.5), RADIUS * Math.sin(angle))
}

export function generateMedtechPoints(count: number): PointCloud {
  const positions = new Float32Array(count * 3)
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()

  for (let i = 0; i < count; i++) {
    const roll = Math.random()
    let x: number, y: number, z: number

    if (roll < STRAND_WEIGHT) {
      const t = Math.random()
      strandPoint(t, 0, a)
      x = a.x
      y = a.y
      z = a.z
    } else if (roll < STRAND_WEIGHT * 2) {
      const t = Math.random()
      strandPoint(t, Math.PI, a)
      x = a.x
      y = a.y
      z = a.z
    } else {
      const rungIndex = Math.floor(Math.random() * RUNG_COUNT)
      const t = rungIndex / (RUNG_COUNT - 1)
      strandPoint(t, 0, a)
      strandPoint(t, Math.PI, b)
      const f = Math.random()
      x = a.x + (b.x - a.x) * f
      y = a.y + (b.y - a.y) * f
      z = a.z + (b.z - a.z) * f
    }

    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z
  }

  return { positions }
}

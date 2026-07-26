import * as THREE from 'three'
import type { PointCloud } from './types'

/** A simplified car — body + cabin (rounded boxes) + four wheels (tori). */

interface Part {
  sample: (tmp: THREE.Vector3) => void
  weight: number
}

// Filling the box volume (not just its surface) keeps the body/cabin visually
// as dense as the wheel tori at low particle counts — a surface-only sample
// spreads too thin over a flat panel and gets lost next to the wheels' bloom.
function sampleBoxVolume(center: THREE.Vector3, hx: number, hy: number, hz: number, tmp: THREE.Vector3) {
  tmp.set(
    center.x + (Math.random() * 2 - 1) * hx,
    center.y + (Math.random() * 2 - 1) * hy,
    center.z + (Math.random() * 2 - 1) * hz,
  )
}

function sampleTorus(center: THREE.Vector3, majorR: number, minorR: number, tmp: THREE.Vector3) {
  const theta = Math.random() * Math.PI * 2
  const phi = Math.random() * Math.PI * 2
  const ringR = majorR + minorR * Math.cos(phi)
  tmp.set(center.x + ringR * Math.cos(theta), center.y + ringR * Math.sin(theta), center.z + minorR * Math.sin(phi))
}

const BODY_CENTER = new THREE.Vector3(0, 0.15, 0)
const BODY_H = { x: 1.2, y: 0.32, z: 0.52 }

const CABIN_CENTER = new THREE.Vector3(-0.05, 0.68, 0)
const CABIN_H = { x: 0.55, y: 0.225, z: 0.44 }

const WHEEL_R = 0.26
const WHEEL_TUBE = 0.09
const WHEEL_Y = -0.32
const WHEEL_CENTERS = [
  new THREE.Vector3(-0.78, WHEEL_Y, 0.52),
  new THREE.Vector3(-0.78, WHEEL_Y, -0.52),
  new THREE.Vector3(0.78, WHEEL_Y, 0.52),
  new THREE.Vector3(0.78, WHEEL_Y, -0.52),
]

// Weighted by hand rather than raw surface area — a literal area weighting lets
// the four wheel tori (visually blobby at low particle counts) outnumber and
// swamp the flat body panels, so the silhouette reads as wheel clusters
// instead of a car. Body + cabin must dominate the particle budget.
const BODY_WEIGHT = 0.52
const CABIN_WEIGHT = 0.22
const WHEEL_WEIGHT_EACH = 0.065

function buildParts(): Part[] {
  const parts: Part[] = [
    { sample: (tmp) => sampleBoxVolume(BODY_CENTER, BODY_H.x, BODY_H.y, BODY_H.z, tmp), weight: BODY_WEIGHT },
    { sample: (tmp) => sampleBoxVolume(CABIN_CENTER, CABIN_H.x, CABIN_H.y, CABIN_H.z, tmp), weight: CABIN_WEIGHT },
  ]
  for (const center of WHEEL_CENTERS) {
    parts.push({ sample: (tmp) => sampleTorus(center, WHEEL_R, WHEEL_TUBE, tmp), weight: WHEEL_WEIGHT_EACH })
  }
  return parts
}

let cachedParts: Part[] | null = null
let cachedTotalWeight = 0

export function generateCarPoints(count: number): PointCloud {
  cachedParts ??= buildParts()
  if (!cachedTotalWeight) cachedTotalWeight = cachedParts.reduce((sum, p) => sum + p.weight, 0)

  const positions = new Float32Array(count * 3)
  const tmp = new THREE.Vector3()

  for (let i = 0; i < count; i++) {
    let target = Math.random() * cachedTotalWeight
    let part = cachedParts[cachedParts.length - 1]
    for (const candidate of cachedParts) {
      target -= candidate.weight
      if (target <= 0) {
        part = candidate
        break
      }
    }
    part.sample(tmp)
    positions[i * 3] = tmp.x
    positions[i * 3 + 1] = tmp.y
    positions[i * 3 + 2] = tmp.z
  }

  return { positions }
}

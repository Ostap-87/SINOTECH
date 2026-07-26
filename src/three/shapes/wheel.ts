import * as THREE from 'three'
import type { PointCloud } from './types'

/**
 * A wheel — tire, rim ring, hub, and spokes, facing the camera (axle along Z).
 * The engine auto-rotates the whole field around the vertical Y axis, so a
 * wheel lying flat (axle along Y) would only ever be seen edge-on. Facing the
 * axle at the camera instead means the default view is face-on (circle +
 * spokes fully visible), and continuous rotation gives it a natural
 * coin-spinning look rather than staying stuck in a flat silhouette.
 */

interface Part {
  sample: (tmp: THREE.Vector3) => void
  weight: number
}

const TIRE_MAJOR_R = 1.0
const TIRE_MINOR_R = 0.22

const RIM_MAJOR_R = 0.62
const RIM_MINOR_R = 0.07

const HUB_R = 0.16

const SPOKE_COUNT = 5
const SPOKE_INNER_R = HUB_R
const SPOKE_OUTER_R = RIM_MAJOR_R
const SPOKE_HALF_WIDTH = 0.07
const SPOKE_HALF_THICK = 0.05

function sampleTorus(majorR: number, minorR: number, tmp: THREE.Vector3) {
  const theta = Math.random() * Math.PI * 2
  const phi = Math.random() * Math.PI * 2
  const ringR = majorR + minorR * Math.cos(phi)
  const z = minorR * Math.sin(phi)
  tmp.set(Math.cos(theta) * ringR, Math.sin(theta) * ringR, z)
}

function sampleHub(tmp: THREE.Vector3) {
  // Uniform-ish fill of a small ball at the axle.
  const u = Math.random()
  const r = HUB_R * Math.cbrt(u)
  const theta = Math.random() * Math.PI * 2
  const cosPhi = Math.random() * 2 - 1
  const sinPhi = Math.sqrt(1 - cosPhi * cosPhi)
  tmp.set(r * sinPhi * Math.cos(theta), r * sinPhi * Math.sin(theta), r * cosPhi)
}

function sampleSpoke(angle: number, tmp: THREE.Vector3) {
  const r = SPOKE_INNER_R + Math.random() * (SPOKE_OUTER_R - SPOKE_INNER_R)
  const tangJitter = (Math.random() * 2 - 1) * SPOKE_HALF_WIDTH
  const zJitter = (Math.random() * 2 - 1) * SPOKE_HALF_THICK
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)
  const x = cosA * r - sinA * tangJitter
  const y = sinA * r + cosA * tangJitter
  tmp.set(x, y, zJitter)
}

function buildParts(): Part[] {
  const parts: Part[] = [
    { sample: (tmp) => sampleTorus(TIRE_MAJOR_R, TIRE_MINOR_R, tmp), weight: 0.42 },
    { sample: (tmp) => sampleTorus(RIM_MAJOR_R, RIM_MINOR_R, tmp), weight: 0.16 },
    { sample: sampleHub, weight: 0.1 },
  ]
  const spokeWeightEach = 0.32 / SPOKE_COUNT
  for (let i = 0; i < SPOKE_COUNT; i++) {
    const angle = (i / SPOKE_COUNT) * Math.PI * 2
    parts.push({ sample: (tmp) => sampleSpoke(angle, tmp), weight: spokeWeightEach })
  }
  return parts
}

let cachedParts: Part[] | null = null
let cachedTotalWeight = 0

export function generateWheelPoints(count: number): PointCloud {
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

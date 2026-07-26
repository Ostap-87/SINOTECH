import * as THREE from 'three'
import type { PointCloud } from './types'

/** A rocket — cylindrical body, conical nose, and three tail fins. */

const BODY_R = 0.32
const BODY_LEN = 2.4
const BODY_CENTER_Y = -0.2

const NOSE_BASE_Y = BODY_CENTER_Y + BODY_LEN / 2
const NOSE_HEIGHT = 0.85

const FIN_ATTACH_Y = BODY_CENTER_Y - BODY_LEN / 2 + 0.15
// Radial distance, vertical offset (from FIN_ATTACH_Y) — a right-triangle fin profile.
const FIN_TRIANGLE: [number, number][] = [
  [BODY_R, 0],
  [BODY_R + 0.5, -0.15],
  [BODY_R + 0.1, -0.65],
]
const FIN_ANGLES = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3]

function sampleBody(tmp: THREE.Vector3) {
  const theta = Math.random() * Math.PI * 2
  const y = BODY_CENTER_Y + (Math.random() - 0.5) * BODY_LEN
  tmp.set(Math.cos(theta) * BODY_R, y, Math.sin(theta) * BODY_R)
}

function sampleNose(tmp: THREE.Vector3) {
  const t = Math.random()
  const radius = BODY_R * (1 - t)
  const theta = Math.random() * Math.PI * 2
  const y = NOSE_BASE_Y + t * NOSE_HEIGHT
  tmp.set(Math.cos(theta) * radius, y, Math.sin(theta) * radius)
}

function sampleFin(angle: number, tmp: THREE.Vector3) {
  // Uniform barycentric sample within the fin's triangular profile.
  let u = Math.random()
  let v = Math.random()
  if (u + v > 1) {
    u = 1 - u
    v = 1 - v
  }
  const [x0, y0] = FIN_TRIANGLE[0]
  const [x1, y1] = FIN_TRIANGLE[1]
  const [x2, y2] = FIN_TRIANGLE[2]
  const radial = x0 + u * (x1 - x0) + v * (x2 - x0)
  const vOffset = y0 + u * (y1 - y0) + v * (y2 - y0)
  tmp.set(Math.cos(angle) * radial, FIN_ATTACH_Y + vOffset, Math.sin(angle) * radial)
}

export function generateAerospacePoints(count: number): PointCloud {
  const positions = new Float32Array(count * 3)
  const tmp = new THREE.Vector3()

  for (let i = 0; i < count; i++) {
    const roll = Math.random()
    if (roll < 0.45) {
      sampleBody(tmp)
    } else if (roll < 0.65) {
      sampleNose(tmp)
    } else {
      const finIndex = Math.floor(Math.random() * FIN_ANGLES.length)
      sampleFin(FIN_ANGLES[finIndex], tmp)
    }

    positions[i * 3] = tmp.x
    positions[i * 3 + 1] = tmp.y
    positions[i * 3 + 2] = tmp.z
  }

  return { positions }
}

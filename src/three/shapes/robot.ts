import * as THREE from 'three'
import type { PointCloud } from './types'

/** A humanoid robot built from weighted primitive volumes (head/torso/arms/legs). */

interface Part {
  sample: (tmp: THREE.Vector3) => void
  weight: number
}

function sampleSphere(center: THREE.Vector3, radius: number, tmp: THREE.Vector3) {
  const u = Math.random()
  const v = Math.random()
  const theta = Math.acos(2 * u - 1)
  const phi = 2 * Math.PI * v
  tmp.set(
    center.x + radius * Math.sin(theta) * Math.cos(phi),
    center.y + radius * Math.sin(theta) * Math.sin(phi),
    center.z + radius * Math.cos(theta),
  )
}

function sampleCylinder(center: THREE.Vector3, radius: number, length: number, tmp: THREE.Vector3) {
  const theta = Math.random() * Math.PI * 2
  const y = (Math.random() - 0.5) * length
  tmp.set(center.x + Math.cos(theta) * radius, center.y + y, center.z + Math.sin(theta) * radius)
}

const HEAD_CENTER = new THREE.Vector3(0, 1.55, 0)
const HEAD_R = 0.42

const TORSO_CENTER = new THREE.Vector3(0, 0.62, 0)
const TORSO_R = 0.52
const TORSO_LEN = 1.15

const ARM_R = 0.15
const ARM_LEN = 1.05
const ARM_CENTER_L = new THREE.Vector3(-0.78, 0.55, 0)
const ARM_CENTER_R = new THREE.Vector3(0.78, 0.55, 0)

const LEG_R = 0.2
const LEG_LEN = 1.2
const LEG_CENTER_L = new THREE.Vector3(-0.27, -0.7, 0)
const LEG_CENTER_R = new THREE.Vector3(0.27, -0.7, 0)

function buildParts(): Part[] {
  return [
    { sample: (tmp) => sampleSphere(HEAD_CENTER, HEAD_R, tmp), weight: 4 * Math.PI * HEAD_R ** 2 },
    { sample: (tmp) => sampleCylinder(TORSO_CENTER, TORSO_R, TORSO_LEN, tmp), weight: 2 * Math.PI * TORSO_R * TORSO_LEN },
    { sample: (tmp) => sampleCylinder(ARM_CENTER_L, ARM_R, ARM_LEN, tmp), weight: 2 * Math.PI * ARM_R * ARM_LEN },
    { sample: (tmp) => sampleCylinder(ARM_CENTER_R, ARM_R, ARM_LEN, tmp), weight: 2 * Math.PI * ARM_R * ARM_LEN },
    { sample: (tmp) => sampleCylinder(LEG_CENTER_L, LEG_R, LEG_LEN, tmp), weight: 2 * Math.PI * LEG_R * LEG_LEN },
    { sample: (tmp) => sampleCylinder(LEG_CENTER_R, LEG_R, LEG_LEN, tmp), weight: 2 * Math.PI * LEG_R * LEG_LEN },
  ]
}

let cachedParts: Part[] | null = null
let cachedTotalWeight = 0

export function generateRobotPoints(count: number): PointCloud {
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

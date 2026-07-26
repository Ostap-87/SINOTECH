import * as THREE from 'three'
import { createNoise3D } from 'simplex-noise'
import { randomParticleColor } from '../palette'
import type { PointCloud } from './types'

const noise3D = createNoise3D()

/** Layered (fractal) noise — sum of a few octaves for finer gyri/sulci detail. */
function fbm(x: number, y: number, z: number, octaves = 4) {
  let sum = 0
  let amp = 1
  let freq = 1
  let max = 0
  for (let i = 0; i < octaves; i++) {
    sum += noise3D(x * freq, y * freq, z * freq) * amp
    max += amp
    amp *= 0.5
    freq *= 2.1
  }
  return sum / max
}

const SEMI_AXES = new THREE.Vector3(1.55, 1.1, 1.7) // width, height, depth
const LOBE_OFFSET = 0.42
const NOISE_SCALE = 2.4
const NOISE_AMOUNT = 0.16

function samplePoint(side: 1 | -1, tmp: THREE.Vector3) {
  // Uniform direction on the unit sphere.
  const u = Math.random()
  const v = Math.random()
  const theta = Math.acos(2 * u - 1)
  const phi = 2 * Math.PI * v
  let dx = Math.sin(theta) * Math.cos(phi)
  const dy = Math.sin(theta) * Math.sin(phi)
  const dz = Math.cos(theta)

  // Flatten the medial face (the side touching the longitudinal fissure).
  const medial = side > 0 ? -dx : dx
  if (medial > 0) dx *= 0.32 + 0.4 * (1 - medial)

  const fold = fbm(dx * NOISE_SCALE, dy * NOISE_SCALE, dz * NOISE_SCALE)
  const radius = 1 + fold * NOISE_AMOUNT

  tmp.set(
    side * LOBE_OFFSET + dx * SEMI_AXES.x * radius,
    dy * SEMI_AXES.y * radius,
    dz * SEMI_AXES.z * radius,
  )
}

export function generateBrainPoints(count: number): PointCloud {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const tmp = new THREE.Vector3()

  for (let i = 0; i < count; i++) {
    const side: 1 | -1 = i % 2 === 0 ? 1 : -1
    samplePoint(side, tmp)

    positions[i * 3] = tmp.x
    positions[i * 3 + 1] = tmp.y
    positions[i * 3 + 2] = tmp.z

    const color = randomParticleColor()
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }

  return { positions, colors }
}

import * as THREE from 'three'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import type { PointCloud } from './types'

/** A lightning bolt — 2D silhouette extruded to a real 3D volume, like the China shape. */

const BOLT_OUTLINE: [number, number][] = [
  [0.5, 2.0],
  [-0.15, 0.35],
  [0.55, 0.35],
  [-0.55, -2.0],
  [0.05, -0.25],
  [-0.55, -0.25],
]

const TARGET_HEIGHT = 3.6
const DEPTH_RATIO = 0.22

function buildGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape(BOLT_OUTLINE.map(([x, y]) => new THREE.Vector2(x, y)))

  const box = new THREE.Box2()
  for (const [x, y] of BOLT_OUTLINE) box.expandByPoint(new THREE.Vector2(x, y))
  const size = box.getSize(new THREE.Vector2())
  const scale = TARGET_HEIGHT / size.y
  const rawDepth = (TARGET_HEIGHT * DEPTH_RATIO) / scale

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: rawDepth,
    bevelEnabled: false,
    curveSegments: 1,
  })
  geometry.computeBoundingBox()
  const center = geometry.boundingBox!.getCenter(new THREE.Vector3())
  geometry.translate(-center.x, -center.y, -center.z)
  geometry.scale(scale, scale, scale)
  return geometry
}

let cachedGeometry: THREE.BufferGeometry | null = null

export function generateEnergyPoints(count: number): PointCloud {
  cachedGeometry ??= buildGeometry()

  const mesh = new THREE.Mesh(cachedGeometry)
  const sampler = new MeshSurfaceSampler(mesh).build()

  const positions = new Float32Array(count * 3)
  const tmp = new THREE.Vector3()

  for (let i = 0; i < count; i++) {
    sampler.sample(tmp)
    positions[i * 3] = tmp.x
    positions[i * 3 + 1] = tmp.y
    positions[i * 3 + 2] = tmp.z
  }

  return { positions }
}

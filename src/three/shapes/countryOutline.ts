import * as THREE from 'three'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { PointCloud } from './types'

type Ring = [number, number][]
type Polygon = Ring[]

const TARGET_SIZE = 6.4
// Fraction of the final silhouette's footprint used as its extruded thickness —
// a flat depth (in raw lng/lat degrees) reads as a paper-thin card once rotating in 3D.
const DEPTH_RATIO = 0.16

function buildMergedGeometry(rings: Polygon[]): THREE.BufferGeometry {
  const shapes: THREE.Shape[] = []
  const flatBox = new THREE.Box2()

  for (const polygon of rings) {
    const [outer, ...holes] = polygon
    const shape = new THREE.Shape(outer.map(([lng, lat]) => new THREE.Vector2(lng, lat)))
    for (const hole of holes) {
      shape.holes.push(new THREE.Path(hole.map(([lng, lat]) => new THREE.Vector2(lng, lat))))
    }
    shapes.push(shape)
    for (const [lng, lat] of outer) flatBox.expandByPoint(new THREE.Vector2(lng, lat))
  }

  const flatSize = flatBox.getSize(new THREE.Vector2())
  const scale = TARGET_SIZE / Math.max(flatSize.x, flatSize.y)
  const rawDepth = (TARGET_SIZE * DEPTH_RATIO) / scale

  const geometries = shapes.map(
    (shape) =>
      new THREE.ExtrudeGeometry(shape, {
        depth: rawDepth,
        bevelEnabled: false,
        curveSegments: 2,
      }),
  )

  const merged = mergeGeometries(geometries, false) ?? geometries[0]
  merged.computeBoundingBox()

  const box = merged.boundingBox!
  const center = box.getCenter(new THREE.Vector3())

  merged.translate(-center.x, -center.y, -center.z)
  merged.scale(scale, scale, scale)

  return merged
}

/**
 * Turns a simplified country outline (array of polygons, each a ring of
 * [lng, lat] pairs) into a `ShapeGenerator` — extrudes it into a flat 3D
 * card and samples its surface for particle positions. Shared by every
 * country map (China, Japan, Korea, …) so each one only needs its own
 * outline data file, not its own extrusion/sampling logic.
 */
export function createCountryOutlineGenerator(rings: Polygon[]) {
  let cachedGeometry: THREE.BufferGeometry | null = null

  return function generatePoints(count: number): PointCloud {
    cachedGeometry ??= buildMergedGeometry(rings)

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
}

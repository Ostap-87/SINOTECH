import * as THREE from 'three'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { PointCloud } from './types'

type Ring = [number, number][]
type Polygon = Ring[]

// China's own silhouette is wide (~1.8:1) and was tuned to fill the hero's
// width without ever testing the vertical limit. A tall/narrow country
// (Japan, Korea) naively scaled to the same single TARGET_SIZE on its
// longer axis pushed its *height* past what the camera's vertical FOV
// actually shows — the top of the shape rendered behind the sticky navbar,
// reading as "cut off and blurred" (the navbar's own backdrop-blur smears
// whatever's behind it). A "contain" fit against separate width/height caps
// — scaling by whichever is more restrictive — guarantees neither axis
// overflows, regardless of aspect ratio; MAX_HEIGHT is deliberately well
// under the ~5.9 world-unit vertical frustum at the desktop camera distance.
const MAX_WIDTH = 6.4
const MAX_HEIGHT = 5.0
// Fraction of the final silhouette's footprint used as its extruded thickness —
// a flat depth (in raw lng/lat degrees) reads as a paper-thin card once rotating in 3D.
const DEPTH_RATIO = 0.16

function rotatePoint([x, y]: [number, number], angleRad: number): [number, number] {
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)
  return [x * cos - y * sin, x * sin + y * cos]
}

function buildMergedGeometry(rings: Polygon[], rotationDeg: number): THREE.BufferGeometry {
  const angleRad = (rotationDeg * Math.PI) / 180
  const shapes: THREE.Shape[] = []
  const flatBox = new THREE.Box2()

  for (const polygon of rings) {
    const [outer, ...holes] = polygon
    const rotatedOuter = angleRad ? outer.map((p) => rotatePoint(p, angleRad)) : outer
    const shape = new THREE.Shape(rotatedOuter.map(([x, y]) => new THREE.Vector2(x, y)))
    for (const hole of holes) {
      const rotatedHole = angleRad ? hole.map((p) => rotatePoint(p, angleRad)) : hole
      shape.holes.push(new THREE.Path(rotatedHole.map(([x, y]) => new THREE.Vector2(x, y))))
    }
    shapes.push(shape)
    for (const [x, y] of rotatedOuter) flatBox.expandByPoint(new THREE.Vector2(x, y))
  }

  const flatSize = flatBox.getSize(new THREE.Vector2())
  const scale = Math.min(MAX_WIDTH / flatSize.x, MAX_HEIGHT / flatSize.y)
  const footprint = Math.max(flatSize.x, flatSize.y) * scale
  const rawDepth = (footprint * DEPTH_RATIO) / scale

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
 *
 * `rotationDeg` tilts the flat shape in its own plane *before* the
 * width/height contain-fit is computed — for a country that's much taller
 * than it is wide (Vietnam's north-south sliver, Thailand's peninsula,
 * Japan's arc), fitting it upright wastes most of the available frame and
 * packs the fixed particle count into a narrow column that reads as a
 * blurred-together smudge. A diagonal tilt spreads that same silhouette
 * across more of the frame and reads as a deliberate, dynamic composition
 * rather than a shape that just doesn't fit.
 */
export function createCountryOutlineGenerator(rings: Polygon[], rotationDeg = 0) {
  let cachedGeometry: THREE.BufferGeometry | null = null

  return function generatePoints(count: number): PointCloud {
    cachedGeometry ??= buildMergedGeometry(rings, rotationDeg)

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

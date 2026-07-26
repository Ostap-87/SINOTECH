import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { GROUP_PALETTE, randomGroupIndex } from './palette'
import type { PointCloud } from './shapes/types'

const MORPH_DURATION_MS = 3800
const SCATTER_RADIUS = 15
const STAGGER_SPREAD = 0.65
const REPEL_RADIUS = 0.95
const REPEL_STRENGTH = 0.35
const DRIFT_AMPLITUDE = 0.025
const DRIFT_SPEED = 0.45
const AUTO_ROTATE_SPEED = 0.035 // rad/s — paused while the user drags or coasts
const PARALLAX_MAX = 0.16
const TETRA_RADIUS = 0.1 // world-space size of one particle's polyhedron
const SIZE_JITTER_MIN = 0.55
const SIZE_JITTER_MAX = 1.7
const HOVER_SIZE_BOOST = 1.5
const TWINKLE_AMOUNT = 0.1 // subtle per-particle scale pulse — reads as shimmer/detail
const TWINKLE_SPEED = 0.8
const SPIN_SPEED_MIN = 0.12 // rad/s — each polyhedron tumbles gently on its own axis
const SPIN_SPEED_MAX = 0.45
// The shape is large enough to graze the hero copy on purpose (per design
// direction) — a bigger, bolder silhouette reads as more detailed and more
// "alive" than a small one floating in empty space. Camera distance is
// adapted per layout so the same world-space shape still fits a narrow
// mobile frustum instead of being cropped.
const STACKED_LAYOUT_BREAKPOINT = 1024
const CAMERA_DISTANCE_DESKTOP = 7.4
const CAMERA_DISTANCE_STACKED = 12.5
const FRAME_OFFSET_DESKTOP = new THREE.Vector2(1.15, 0.1)
const FRAME_OFFSET_STACKED = new THREE.Vector2(0, -3.1)
// A short, wide hero (compact page headers on Tours/Constructor/etc.) has a
// much wider aspect ratio than the tall Home/Industries hero. Camera FOV is
// fixed vertically, so the same distance/offset tuned for a ~1.9 aspect
// leaves large empty margins on a ~3+ aspect frame — zoom in and recenter
// instead of letting the shape shrink relative to the available width.
const WIDE_ASPECT_THRESHOLD = 2.9
const CAMERA_DISTANCE_WIDE = 4.3
const FRAME_OFFSET_WIDE = new THREE.Vector2(0.9, 0)
// Drag-to-rotate feel: pixels-to-radians sensitivity and per-frame coast decay.
const DRAG_SENSITIVITY = 0.0038
const DRAG_DECAY = 0.94
const DRAG_PITCH_LIMIT = 1.1 // radians — keeps the shape from flipping upside down

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function scatterCloud(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = radius * (0.6 + 0.4 * Math.random())
    const theta = Math.acos(2 * Math.random() - 1)
    const phi = 2 * Math.PI * Math.random()
    positions[i * 3] = r * Math.sin(theta) * Math.cos(phi)
    positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi)
    positions[i * 3 + 2] = r * Math.cos(theta)
  }
  return positions
}

export interface ParticleFieldOptions {
  reducedMotion: boolean
}

/** One InstancedMesh per palette color group — see class doc for why. */
interface ColorGroup {
  mesh: THREE.InstancedMesh
  material: THREE.MeshBasicMaterial
  /** Global particle index for each local instance slot in this group. */
  memberIndices: number[]
}

export class ParticleFieldEngine {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private composer: EffectComposer
  private geometry: THREE.TetrahedronGeometry
  private root = new THREE.Group()
  private groups: ColorGroup[]
  /** Global particle index -> {group, localSlot}, for writing matrices per frame. */
  private groupOfParticle: Uint8Array
  private localSlotOfParticle: Uint32Array

  private count: number
  private reducedMotion: boolean

  private prevPositions: Float32Array
  private targetPositions: Float32Array
  private currentPositions: Float32Array
  private delays: Float32Array
  private driftSeeds: Float32Array
  private baseSizes: Float32Array
  private spinAxes: Float32Array
  private spinSpeeds: Float32Array
  private spinPhases: Float32Array

  private morphStart = performance.now()
  private morphDuration = MORPH_DURATION_MS
  private clock = new THREE.Clock()

  private raycaster = new THREE.Raycaster()
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  private pointerNDC = new THREE.Vector2(10, 10) // off-screen until first move
  private mouseWorld = new THREE.Vector3()
  private mouseLocal = new THREE.Vector3()
  private hasPointer = false

  private parallaxTarget = new THREE.Vector2(0, 0)
  private parallaxCurrent = new THREE.Vector2(0, 0)
  private autoRotation = 0

  private isDragging = false
  private dragLast = new THREE.Vector2()
  private dragVelocity = new THREE.Vector2()
  private dragRotation = new THREE.Vector2()
  private activePointerId: number | null = null

  // Scratch objects reused every frame to avoid per-instance allocation.
  private scratchPosition = new THREE.Vector3()
  private scratchQuaternion = new THREE.Quaternion()
  private scratchAxis = new THREE.Vector3()
  private scratchScale = new THREE.Vector3()
  private scratchMatrix = new THREE.Matrix4()

  private frameId: number | null = null
  private disposed = false

  constructor(canvas: HTMLCanvasElement, initial: PointCloud, options: ParticleFieldOptions) {
    this.count = initial.positions.length / 3
    this.reducedMotion = options.reducedMotion

    const width = canvas.clientWidth || 1
    const height = canvas.clientHeight || 1

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(width, height, false)

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    this.camera.position.set(0, 0, CAMERA_DISTANCE_DESKTOP)
    this.camera.lookAt(0, 0, 0)

    this.prevPositions = scatterCloud(this.count, SCATTER_RADIUS)
    this.currentPositions = this.prevPositions.slice()
    this.targetPositions = initial.positions

    this.driftSeeds = new Float32Array(this.count)
    this.delays = new Float32Array(this.count)
    this.baseSizes = new Float32Array(this.count)
    this.spinAxes = new Float32Array(this.count * 3)
    this.spinSpeeds = new Float32Array(this.count)
    this.spinPhases = new Float32Array(this.count)
    this.groupOfParticle = new Uint8Array(this.count)
    this.localSlotOfParticle = new Uint32Array(this.count)

    const memberIndicesByGroup: number[][] = GROUP_PALETTE.map(() => [])

    for (let i = 0; i < this.count; i++) {
      this.driftSeeds[i] = Math.random() * Math.PI * 2
      this.delays[i] = Math.random() * STAGGER_SPREAD
      this.baseSizes[i] =
        TETRA_RADIUS * (SIZE_JITTER_MIN + Math.random() * (SIZE_JITTER_MAX - SIZE_JITTER_MIN))

      const theta = Math.acos(2 * Math.random() - 1)
      const phi = 2 * Math.PI * Math.random()
      this.spinAxes[i * 3] = Math.sin(theta) * Math.cos(phi)
      this.spinAxes[i * 3 + 1] = Math.sin(theta) * Math.sin(phi)
      this.spinAxes[i * 3 + 2] = Math.cos(theta)
      this.spinSpeeds[i] =
        (SPIN_SPEED_MIN + Math.random() * (SPIN_SPEED_MAX - SPIN_SPEED_MIN)) * (Math.random() < 0.5 ? -1 : 1)
      this.spinPhases[i] = Math.random() * Math.PI * 2

      const groupIndex = randomGroupIndex()
      this.groupOfParticle[i] = groupIndex
      this.localSlotOfParticle[i] = memberIndicesByGroup[groupIndex].length
      memberIndicesByGroup[groupIndex].push(i)
    }

    // A real 3D wireframe polyhedron per particle — rendered and lit like any
    // other mesh, not a camera-facing sprite — so it looks right from every
    // angle as the whole field rotates. Grouped into one InstancedMesh per
    // palette color (fixed material.color) rather than per-instance vertex
    // colors, which sidesteps a color-attribute compatibility issue.
    this.geometry = new THREE.TetrahedronGeometry(1, 0)
    this.groups = GROUP_PALETTE.map((entry, groupIndex) => {
      const members = memberIndicesByGroup[groupIndex]
      const material = new THREE.MeshBasicMaterial({
        color: entry.color,
        wireframe: true,
        transparent: true,
        opacity: 0.82,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.InstancedMesh(this.geometry, material, Math.max(members.length, 1))
      mesh.count = members.length
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      mesh.frustumCulled = false
      this.root.add(mesh)
      return { mesh, material, memberIndices: members }
    })

    this.applyLayout(width, height)
    this.scene.add(this.root)

    // No bloom pass on the light theme — it was tuned to glow against a
    // black background and doesn't translate to a white one.
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.composer.addPass(new OutputPass())

    if (!this.reducedMotion) {
      canvas.style.cursor = 'grab'
      canvas.style.touchAction = 'none'
      canvas.addEventListener('pointermove', this.onPointerMove)
      canvas.addEventListener('pointerleave', this.onPointerLeave)
      canvas.addEventListener('pointerdown', this.onPointerDown)
      canvas.addEventListener('pointerup', this.onPointerUp)
      canvas.addEventListener('pointercancel', this.onPointerUp)
    }

    this.tick = this.tick.bind(this)
    this.frameId = requestAnimationFrame(this.tick)
  }

  private updatePointerNDC(event: PointerEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    this.pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.pointerNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    this.hasPointer = true
  }

  private onPointerDown = (event: PointerEvent) => {
    this.isDragging = true
    this.activePointerId = event.pointerId
    this.dragLast.set(event.clientX, event.clientY)
    this.dragVelocity.set(0, 0)
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    ;(event.currentTarget as HTMLElement).style.cursor = 'grabbing'
    this.updatePointerNDC(event)
    this.parallaxTarget.set(this.pointerNDC.x, this.pointerNDC.y)
  }

  private onPointerMove = (event: PointerEvent) => {
    this.updatePointerNDC(event)
    this.parallaxTarget.set(this.pointerNDC.x, this.pointerNDC.y)

    if (this.isDragging && event.pointerId === this.activePointerId) {
      const dx = event.clientX - this.dragLast.x
      const dy = event.clientY - this.dragLast.y
      this.dragLast.set(event.clientX, event.clientY)
      const yaw = dx * DRAG_SENSITIVITY
      const pitch = dy * DRAG_SENSITIVITY
      this.dragRotation.x += yaw
      this.dragRotation.y = Math.min(
        Math.max(this.dragRotation.y + pitch, -DRAG_PITCH_LIMIT),
        DRAG_PITCH_LIMIT,
      )
      this.dragVelocity.set(yaw, pitch)
    }
  }

  private onPointerUp = (event: PointerEvent) => {
    if (event.pointerId === this.activePointerId) {
      this.isDragging = false
      this.activePointerId = null
      ;(event.currentTarget as HTMLElement).style.cursor = 'grab'
    }
  }

  private onPointerLeave = () => {
    if (!this.isDragging) {
      this.hasPointer = false
      this.parallaxTarget.set(0, 0)
    }
  }

  setTarget(shape: PointCloud, durationMs = MORPH_DURATION_MS) {
    // Snapshot wherever particles actually are right now (not just the old
    // target) so switching shapes mid-morph doesn't jump.
    this.prevPositions = this.currentPositions.slice()
    this.targetPositions = shape.positions
    this.morphStart = performance.now()
    this.morphDuration = durationMs
  }

  /**
   * Reverse of the assembly effect — blows the current shape back apart into
   * a scattered cloud, quickly, for use as an exit transition (e.g. right
   * before navigating away from a page that shows this shape).
   */
  disperse(durationMs = 900) {
    this.setTarget({ positions: scatterCloud(this.count, SCATTER_RADIUS * 1.6) }, durationMs)
  }

  private applyLayout(width: number, height: number) {
    const stacked = width < STACKED_LAYOUT_BREAKPOINT
    const wide = !stacked && width / height > WIDE_ASPECT_THRESHOLD

    const offset = wide ? FRAME_OFFSET_WIDE : stacked ? FRAME_OFFSET_STACKED : FRAME_OFFSET_DESKTOP
    const distance = wide ? CAMERA_DISTANCE_WIDE : stacked ? CAMERA_DISTANCE_STACKED : CAMERA_DISTANCE_DESKTOP

    this.root.position.set(offset.x, offset.y, 0)
    this.camera.position.z = distance
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
    this.composer.setSize(width, height)
    this.applyLayout(width, height)
  }

  private tick() {
    if (this.disposed) return
    const delta = Math.min(this.clock.getDelta(), 0.05)
    const now = performance.now()
    const globalT = this.reducedMotion
      ? 1
      : Math.min((now - this.morphStart) / this.morphDuration, 1)
    const time = this.clock.elapsedTime

    if (!this.reducedMotion) {
      this.raycaster.setFromCamera(this.pointerNDC, this.camera)
      this.raycaster.ray.intersectPlane(this.groundPlane, this.mouseWorld)
      // Repel math below runs in the root group's local space, which is
      // offset from world space by the frame offset — translate the cursor in.
      this.mouseLocal.copy(this.mouseWorld).sub(this.root.position)
    }

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3
      const localT = this.reducedMotion
        ? 1
        : Math.min(Math.max((globalT - this.delays[i]) / (1 - this.delays[i]), 0), 1)
      const eased = easeOutCubic(localT)

      let x = this.prevPositions[i3] + (this.targetPositions[i3] - this.prevPositions[i3]) * eased
      let y = this.prevPositions[i3 + 1] + (this.targetPositions[i3 + 1] - this.prevPositions[i3 + 1]) * eased
      let z = this.prevPositions[i3 + 2] + (this.targetPositions[i3 + 2] - this.prevPositions[i3 + 2]) * eased
      this.currentPositions[i3] = x
      this.currentPositions[i3 + 1] = y
      this.currentPositions[i3 + 2] = z

      const baseSize = this.baseSizes[i]
      let size = baseSize

      if (!this.reducedMotion) {
        const seed = this.driftSeeds[i]
        x += Math.sin(time * DRIFT_SPEED + seed) * DRIFT_AMPLITUDE
        y += Math.cos(time * DRIFT_SPEED * 0.9 + seed) * DRIFT_AMPLITUDE
        z += Math.sin(time * DRIFT_SPEED * 0.7 + seed * 1.3) * DRIFT_AMPLITUDE

        const twinkle = 1 + TWINKLE_AMOUNT * Math.sin(time * TWINKLE_SPEED + seed)
        size *= twinkle

        if (this.hasPointer) {
          const dx = x - this.mouseLocal.x
          const dy = y - this.mouseLocal.y
          const dz = z - this.mouseLocal.z
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
          if (dist < REPEL_RADIUS && dist > 0.0001) {
            const falloff = 1 - dist / REPEL_RADIUS
            const push = falloff * falloff * REPEL_STRENGTH
            x += (dx / dist) * push
            y += (dy / dist) * push
            z += (dz / dist) * push
            size *= 1 + (HOVER_SIZE_BOOST - 1) * falloff
          }
        }
      }

      this.scratchPosition.set(x, y, z)
      this.scratchScale.setScalar(size)

      if (this.reducedMotion) {
        this.scratchQuaternion.identity()
      } else {
        this.scratchAxis.set(this.spinAxes[i3], this.spinAxes[i3 + 1], this.spinAxes[i3 + 2])
        const angle = time * this.spinSpeeds[i] + this.spinPhases[i]
        this.scratchQuaternion.setFromAxisAngle(this.scratchAxis, angle)
      }

      this.scratchMatrix.compose(this.scratchPosition, this.scratchQuaternion, this.scratchScale)
      const group = this.groups[this.groupOfParticle[i]]
      group.mesh.setMatrixAt(this.localSlotOfParticle[i], this.scratchMatrix)
    }

    for (const group of this.groups) {
      group.mesh.instanceMatrix.needsUpdate = true
    }

    if (!this.reducedMotion) {
      if (!this.isDragging) {
        const coasting = Math.abs(this.dragVelocity.x) > 0.00005 || Math.abs(this.dragVelocity.y) > 0.00005
        if (coasting) {
          this.dragRotation.x += this.dragVelocity.x
          this.dragRotation.y = Math.min(
            Math.max(this.dragRotation.y + this.dragVelocity.y, -DRAG_PITCH_LIMIT),
            DRAG_PITCH_LIMIT,
          )
          this.dragVelocity.multiplyScalar(DRAG_DECAY)
        } else {
          this.autoRotation += AUTO_ROTATE_SPEED * delta
        }
      }
      this.parallaxCurrent.lerp(this.parallaxTarget, 0.04)
      this.root.rotation.y = this.autoRotation + this.parallaxCurrent.x * PARALLAX_MAX + this.dragRotation.x
      this.root.rotation.x = this.parallaxCurrent.y * PARALLAX_MAX * 0.5 + this.dragRotation.y
    }

    this.composer.render()
    this.frameId = requestAnimationFrame(this.tick)
  }

  dispose() {
    this.disposed = true
    if (this.frameId !== null) cancelAnimationFrame(this.frameId)
    const canvas = this.renderer.domElement
    canvas.removeEventListener('pointermove', this.onPointerMove)
    canvas.removeEventListener('pointerleave', this.onPointerLeave)
    canvas.removeEventListener('pointerdown', this.onPointerDown)
    canvas.removeEventListener('pointerup', this.onPointerUp)
    canvas.removeEventListener('pointercancel', this.onPointerUp)
    this.geometry.dispose()
    for (const group of this.groups) group.material.dispose()
    this.renderer.dispose()
    this.composer.dispose()
  }
}

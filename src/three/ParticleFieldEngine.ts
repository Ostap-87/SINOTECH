import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { createTriangleSprite } from './triangleSprite'
import type { PointCloud } from './shapes/types'

const MORPH_DURATION_MS = 1400
const REPEL_RADIUS = 1.1
const REPEL_STRENGTH = 0.55
const DRIFT_AMPLITUDE = 0.035
const DRIFT_SPEED = 0.6
const AUTO_ROTATE_SPEED = 0.045 // rad/s
const PARALLAX_MAX = 0.22
const BASE_POINT_SIZE = 5
const HOVER_SIZE_BOOST = 2.4
const CAMERA_DISTANCE = 6.4

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

export class ParticleFieldEngine {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private composer: EffectComposer
  private points: THREE.Points
  private geometry: THREE.BufferGeometry
  private material: THREE.ShaderMaterial

  private count: number
  private reducedMotion: boolean

  private prevPositions: Float32Array
  private targetPositions: Float32Array
  private prevColors: Float32Array
  private targetColors: Float32Array
  private delays: Float32Array
  private driftSeeds: Float32Array

  private morphStart = performance.now()
  private clock = new THREE.Clock()

  private raycaster = new THREE.Raycaster()
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  private pointerNDC = new THREE.Vector2(10, 10) // off-screen until first move
  private mouseWorld = new THREE.Vector3()
  private hasPointer = false

  private parallaxTarget = new THREE.Vector2(0, 0)
  private parallaxCurrent = new THREE.Vector2(0, 0)
  private autoRotation = 0

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
    this.camera.position.set(0, 0, CAMERA_DISTANCE)
    this.camera.lookAt(0, 0, 0)

    this.geometry = new THREE.BufferGeometry()
    this.prevPositions = scatterCloud(this.count, 7)
    this.targetPositions = initial.positions
    this.prevColors = initial.colors.slice()
    this.targetColors = initial.colors

    const livePositions = this.prevPositions.slice()
    const liveColors = this.prevColors.slice()
    const sizes = new Float32Array(this.count).fill(BASE_POINT_SIZE)
    this.driftSeeds = new Float32Array(this.count)
    this.delays = new Float32Array(this.count)
    for (let i = 0; i < this.count; i++) {
      this.driftSeeds[i] = Math.random() * Math.PI * 2
      this.delays[i] = Math.random() * 0.4
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(livePositions, 3).setUsage(THREE.DynamicDrawUsage))
    this.geometry.setAttribute('aColor', new THREE.BufferAttribute(liveColors, 3).setUsage(THREE.DynamicDrawUsage))
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage))

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: createTriangleSprite() },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uFocalDistance: { value: CAMERA_DISTANCE },
      },
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute vec3 aColor;
        uniform float uPixelRatio;
        uniform float uFocalDistance;
        varying vec3 vColor;
        void main() {
          vColor = aColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uPixelRatio * (uFocalDistance / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uTexture;
        varying vec3 vColor;
        void main() {
          vec4 tex = texture2D(uTexture, gl_PointCoord);
          if (tex.a < 0.04) discard;
          gl_FragColor = vec4(vColor, tex.a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    this.points = new THREE.Points(this.geometry, this.material)
    this.scene.add(this.points)

    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    if (!new URLSearchParams(window.location.search).has('noBloom')) {
      const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 1.05, 0.55, 0.12)
      this.composer.addPass(bloom)
    }
    this.composer.addPass(new OutputPass())

    if (!this.reducedMotion) {
      canvas.addEventListener('pointermove', this.onPointerMove)
      canvas.addEventListener('pointerleave', this.onPointerLeave)
    }

    this.tick = this.tick.bind(this)
    this.frameId = requestAnimationFrame(this.tick)
  }

  private onPointerMove = (event: PointerEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    this.pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.pointerNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    this.parallaxTarget.set(this.pointerNDC.x, this.pointerNDC.y)
    this.hasPointer = true
  }

  private onPointerLeave = () => {
    this.hasPointer = false
    this.parallaxTarget.set(0, 0)
  }

  setTarget(shape: PointCloud) {
    const posAttr = this.geometry.getAttribute('position') as THREE.BufferAttribute
    this.prevPositions = (posAttr.array as Float32Array).slice()
    this.prevColors = (this.geometry.getAttribute('aColor').array as Float32Array).slice()
    this.targetPositions = shape.positions
    this.targetColors = shape.colors
    this.morphStart = performance.now()
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
    this.composer.setSize(width, height)
  }

  private tick() {
    if (this.disposed) return
    const delta = Math.min(this.clock.getDelta(), 0.05)
    const now = performance.now()
    const globalT = this.reducedMotion
      ? 1
      : Math.min((now - this.morphStart) / MORPH_DURATION_MS, 1)
    const time = this.clock.elapsedTime

    if (!this.reducedMotion) {
      this.raycaster.setFromCamera(this.pointerNDC, this.camera)
      this.raycaster.ray.intersectPlane(this.groundPlane, this.mouseWorld)
    }

    const posAttr = this.geometry.getAttribute('position') as THREE.BufferAttribute
    const colorAttr = this.geometry.getAttribute('aColor') as THREE.BufferAttribute
    const sizeAttr = this.geometry.getAttribute('aSize') as THREE.BufferAttribute
    const positions = posAttr.array as Float32Array
    const colors = colorAttr.array as Float32Array
    const sizes = sizeAttr.array as Float32Array

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3
      const localT = this.reducedMotion
        ? 1
        : Math.min(Math.max((globalT - this.delays[i]) / (1 - this.delays[i]), 0), 1)
      const eased = easeOutCubic(localT)

      let x = this.prevPositions[i3] + (this.targetPositions[i3] - this.prevPositions[i3]) * eased
      let y = this.prevPositions[i3 + 1] + (this.targetPositions[i3 + 1] - this.prevPositions[i3 + 1]) * eased
      let z = this.prevPositions[i3 + 2] + (this.targetPositions[i3 + 2] - this.prevPositions[i3 + 2]) * eased

      colors[i3] = this.prevColors[i3] + (this.targetColors[i3] - this.prevColors[i3]) * eased
      colors[i3 + 1] = this.prevColors[i3 + 1] + (this.targetColors[i3 + 1] - this.prevColors[i3 + 1]) * eased
      colors[i3 + 2] = this.prevColors[i3 + 2] + (this.targetColors[i3 + 2] - this.prevColors[i3 + 2]) * eased

      let size = BASE_POINT_SIZE

      if (!this.reducedMotion) {
        const seed = this.driftSeeds[i]
        x += Math.sin(time * DRIFT_SPEED + seed) * DRIFT_AMPLITUDE
        y += Math.cos(time * DRIFT_SPEED * 0.9 + seed) * DRIFT_AMPLITUDE
        z += Math.sin(time * DRIFT_SPEED * 0.7 + seed * 1.3) * DRIFT_AMPLITUDE

        if (this.hasPointer) {
          const dx = x - this.mouseWorld.x
          const dy = y - this.mouseWorld.y
          const dz = z - this.mouseWorld.z
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
          if (dist < REPEL_RADIUS && dist > 0.0001) {
            const falloff = 1 - dist / REPEL_RADIUS
            const push = falloff * falloff * REPEL_STRENGTH
            x += (dx / dist) * push
            y += (dy / dist) * push
            z += (dz / dist) * push
            size = BASE_POINT_SIZE * (1 + (HOVER_SIZE_BOOST - 1) * falloff)
          }
        }
      }

      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z
      sizes[i] = size
    }

    posAttr.needsUpdate = true
    colorAttr.needsUpdate = true
    sizeAttr.needsUpdate = true

    if (!this.reducedMotion) {
      this.autoRotation += AUTO_ROTATE_SPEED * delta
      this.parallaxCurrent.lerp(this.parallaxTarget, 0.04)
      this.points.rotation.y = this.autoRotation + this.parallaxCurrent.x * PARALLAX_MAX
      this.points.rotation.x = this.parallaxCurrent.y * PARALLAX_MAX * 0.5
    }

    this.composer.render()
    this.frameId = requestAnimationFrame(this.tick)
  }

  dispose() {
    this.disposed = true
    if (this.frameId !== null) cancelAnimationFrame(this.frameId)
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove)
    this.renderer.domElement.removeEventListener('pointerleave', this.onPointerLeave)
    this.geometry.dispose()
    this.material.dispose()
    this.material.uniforms.uTexture.value?.dispose()
    this.renderer.dispose()
    this.composer.dispose()
  }
}

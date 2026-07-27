import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { generateLogoMarkPoints } from '@/three/shapes/logoMark'

// Same wireframe-tetrahedron particle language as the country maps, just a
// tiny standalone scene — the full ParticleFieldEngine (postprocessing,
// drag-to-rotate, morph state machine) is overkill for a 20px navbar icon.
const PARTICLE_COUNT = 90
const BASE_ROTATE_SPEED = 0.9 // rad/s
const HOVER_ROTATE_SPEED = 2.6
const TETRA_RADIUS = 0.16
// Blue only (no gray) — the wordmark's icon reads as solid blue, unlike the
// gray-led multi-hue country maps.
const BLUE_TONES = [0x2563eb, 0x0ea5e9]

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function LogoMark({ size = 20 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hoveredRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reducedMotion = prefersReducedMotion()
    const cloud = generateLogoMarkPoints(PARTICLE_COUNT)
    const positions = cloud.positions

    let radius = 0
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = positions[i * 3]
      const y = positions[i * 3 + 1]
      const z = positions[i * 3 + 2]
      radius = Math.max(radius, Math.sqrt(x * x + y * y + z * z))
    }

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(size, size, false)

    const scene = new THREE.Scene()
    const fovDeg = 42
    const camera = new THREE.PerspectiveCamera(fovDeg, 1, 0.1, 50)
    const distance = (radius / Math.sin((fovDeg * Math.PI) / 360)) * 1.4
    camera.position.set(0, 0, distance)
    camera.lookAt(0, 0, 0)

    const group = new THREE.Group()
    scene.add(group)

    const geometry = new THREE.TetrahedronGeometry(1, 0)
    const material = new THREE.MeshBasicMaterial({
      wireframe: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
    })
    const mesh = new THREE.InstancedMesh(geometry, material, PARTICLE_COUNT)
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
      dummy.scale.setScalar(TETRA_RADIUS * (0.65 + Math.random() * 0.9))
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      color.set(BLUE_TONES[i % BLUE_TONES.length])
      mesh.setColorAt(i, color)
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true

    group.add(mesh)
    renderer.render(scene, camera)

    if (reducedMotion) {
      return () => {
        geometry.dispose()
        material.dispose()
        renderer.dispose()
      }
    }

    const onEnter = () => {
      hoveredRef.current = true
    }
    const onLeave = () => {
      hoveredRef.current = false
    }
    canvas.addEventListener('pointerenter', onEnter)
    canvas.addEventListener('pointerleave', onLeave)

    let disposed = false
    let frameId = 0
    const clock = new THREE.Clock()
    let speed = BASE_ROTATE_SPEED

    function tick() {
      if (disposed) return
      const delta = Math.min(clock.getDelta(), 0.05)
      const targetSpeed = hoveredRef.current ? HOVER_ROTATE_SPEED : BASE_ROTATE_SPEED
      speed += (targetSpeed - speed) * Math.min(delta * 4, 1)
      // Clockwise on screen = decreasing Z rotation.
      group.rotation.z -= speed * delta
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)

    return () => {
      disposed = true
      cancelAnimationFrame(frameId)
      canvas.removeEventListener('pointerenter', onEnter)
      canvas.removeEventListener('pointerleave', onLeave)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size, display: 'block' }}
      aria-hidden="true"
    />
  )
}

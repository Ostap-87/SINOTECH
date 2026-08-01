import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// A solid, semi-transparent square pyramid with a full wireframe overlay
// (including the base's corner-to-corner diagonals) — the "glass pyramid"
// look, spinning continuously as a small standalone three.js scene.
const BASE_RADIUS = 1.05
const HEIGHT = 1.3
const TILT_X = -0.32 // radians — tips the pyramid back so the base plane (and its diagonals) is visible
const ROTATE_SPEED = 0.9 // rad/s
const HOVER_ROTATE_SPEED = 2.4
const FILL_COLOR = 0x38bdf8
const EDGE_COLOR = 0x1e3a8a

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

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(size, size, false)

    const scene = new THREE.Scene()
    const fovDeg = 38
    const camera = new THREE.PerspectiveCamera(fovDeg, 1, 0.1, 50)
    const radius = Math.sqrt(BASE_RADIUS * BASE_RADIUS + (HEIGHT / 2) * (HEIGHT / 2))
    const distance = (radius / Math.sin((fovDeg * Math.PI) / 360)) * 1.55
    camera.position.set(0, 0, distance)
    camera.lookAt(0, 0, 0)

    const tilt = new THREE.Group()
    tilt.rotation.x = TILT_X
    scene.add(tilt)

    const spin = new THREE.Group()
    tilt.add(spin)

    const geometry = new THREE.CylinderGeometry(0, BASE_RADIUS, HEIGHT, 4)

    const fillMaterial = new THREE.MeshBasicMaterial({
      color: FILL_COLOR,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    })
    spin.add(new THREE.Mesh(geometry, fillMaterial))

    const edgeMaterial = new THREE.LineBasicMaterial({ color: EDGE_COLOR })
    spin.add(new THREE.LineSegments(new THREE.WireframeGeometry(geometry), edgeMaterial))

    renderer.render(scene, camera)

    if (reducedMotion) {
      return () => {
        geometry.dispose()
        fillMaterial.dispose()
        edgeMaterial.dispose()
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
    let speed = ROTATE_SPEED

    // Tumbles around a randomly re-picked 3D axis every couple of seconds
    // (eased toward the new axis, not snapped) instead of spinning flatly
    // around one fixed axis — reads as a gem tumbling in space rather than
    // a wheel turning.
    function randomUnitAxis() {
      const z = Math.random() * 2 - 1
      const theta = Math.random() * Math.PI * 2
      const r = Math.sqrt(1 - z * z)
      return new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), z)
    }

    const currentAxis = new THREE.Vector3(0, 1, 0)
    let targetAxis = randomUnitAxis()
    let elapsed = 0
    let nextAxisChangeAt = 1.5 + Math.random() * 1.5
    const rotationDelta = new THREE.Quaternion()

    function tick() {
      if (disposed) return
      const delta = Math.min(clock.getDelta(), 0.05)
      elapsed += delta

      if (elapsed >= nextAxisChangeAt) {
        targetAxis = randomUnitAxis()
        nextAxisChangeAt = elapsed + 2 + Math.random() * 2.5
      }
      currentAxis.lerp(targetAxis, Math.min(delta * 1.5, 1)).normalize()

      const targetSpeed = hoveredRef.current ? HOVER_ROTATE_SPEED : ROTATE_SPEED
      speed += (targetSpeed - speed) * Math.min(delta * 4, 1)

      rotationDelta.setFromAxisAngle(currentAxis, speed * delta)
      spin.quaternion.multiply(rotationDelta)

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
      fillMaterial.dispose()
      edgeMaterial.dispose()
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

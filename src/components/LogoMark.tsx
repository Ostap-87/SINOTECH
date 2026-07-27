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

    function tick() {
      if (disposed) return
      const delta = Math.min(clock.getDelta(), 0.05)
      const targetSpeed = hoveredRef.current ? HOVER_ROTATE_SPEED : ROTATE_SPEED
      speed += (targetSpeed - speed) * Math.min(delta * 4, 1)
      spin.rotation.y += speed * delta
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

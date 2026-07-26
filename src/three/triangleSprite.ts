import * as THREE from 'three'

/** A small soft-edged triangle sprite used as the point texture — the Dala particle shape. */
export function createTriangleSprite(): THREE.Texture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, size, size)
  const cx = size / 2
  ctx.beginPath()
  ctx.moveTo(cx, size * 0.08)
  ctx.lineTo(size * 0.92, size * 0.88)
  ctx.lineTo(size * 0.08, size * 0.88)
  ctx.closePath()

  const gradient = ctx.createRadialGradient(cx, size * 0.55, 0, cx, size * 0.55, size * 0.55)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.6, 'rgba(255,255,255,0.9)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

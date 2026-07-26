import * as THREE from 'three'

/**
 * A crisp, small triangle sprite used as the point texture.
 *
 * Only the edge gets a slight blur for anti-aliasing — the previous version
 * filled the whole sprite with a big soft radial gradient, so every particle
 * was already a blurry blob before bloom even touched it. Bloom now supplies
 * the glow around an otherwise sharp, detailed core.
 */
export function createTriangleSprite(): THREE.Texture {
  const size = 96
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, size, size)
  ctx.filter = 'blur(1px)'
  ctx.fillStyle = 'rgba(255,255,255,0.97)'
  ctx.beginPath()
  ctx.moveTo(size * 0.5, size * 0.1)
  ctx.lineTo(size * 0.88, size * 0.85)
  ctx.lineTo(size * 0.12, size * 0.85)
  ctx.closePath()
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

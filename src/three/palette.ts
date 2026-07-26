import * as THREE from 'three'

/** Dala particle palette — accent hues used for the point cloud, not UI chrome. */
export const PARTICLE_COLORS = [
  new THREE.Color('#8052ff'), // electric iris
  new THREE.Color('#ffb829'), // saffron spark
  new THREE.Color('#15846e'), // deep verdant / teal
  new THREE.Color('#e845b8'), // magenta
  new THREE.Color('#3b82f6'), // blue
]

export function randomParticleColor(rng: () => number = Math.random): THREE.Color {
  const color = PARTICLE_COLORS[Math.floor(rng() * PARTICLE_COLORS.length)]
  return color.clone()
}

import { createCountryOutlineGenerator } from './countryOutline'

// A simple upward-pointing triangle, expressed as a ring in the same format
// as the country outlines — reuses the exact same extrude-and-sample
// pipeline as every country map, so the wordmark's icon is built from the
// same 3D particle system, just with its own tiny silhouette.
const TRIANGLE_RING: [number, number][] = [
  [0, 5],
  [4.25, -5],
  [-4.25, -5],
]

export const generateLogoMarkPoints = createCountryOutlineGenerator([[TRIANGLE_RING]])

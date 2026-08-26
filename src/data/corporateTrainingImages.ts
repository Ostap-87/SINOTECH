/**
 * Predictable static-asset paths for the corporate-training section.
 *
 * Real campus photos/galleries don't exist yet — the site owner will drop
 * files directly into these paths via GitHub later, with no code change.
 * Every path below is served straight from /public (Vite's convention —
 * see public/tg-media for the existing precedent of flat static files
 * under /public), and every component that renders one of these must
 * tolerate a 404 by falling back to a neutral placeholder (see
 * <StaticImage> / <ProgramGallery>) rather than showing a broken image or
 * throwing a console error.
 */

export const GALLERY_PHOTOS_PER_PROGRAM = 6

/** Owner request (26.08.2026): hide the "Фото с прошлых заездов" gallery
 * section entirely until real photos exist — a wall of 6 empty placeholder
 * tiles per programme page looked unfinished. Flip to true once real files
 * have been dropped at galleryImagePaths() for at least one programme. */
export const SHOW_PHOTO_GALLERY = false

export function heroImagePath(slug: string): string {
  return `/corporate-training/${slug}/hero.jpg`
}

export function galleryImagePaths(slug: string, count: number = GALLERY_PHOTOS_PER_PROGRAM): string[] {
  return Array.from({ length: count }, (_, i) => `/corporate-training/${slug}/gallery/${i + 1}.jpg`)
}

export function materialCoverPath(slug: string): string {
  return `/corporate-training/materials/${slug}/cover.jpg`
}

/** Numbered in-body images for a material, referenced from its body text via
 * the `![alt](/corporate-training/materials/<slug>/N.jpg)` convention. */
export function materialBodyImagePath(slug: string, n: number): string {
  return `/corporate-training/materials/${slug}/${n}.jpg`
}

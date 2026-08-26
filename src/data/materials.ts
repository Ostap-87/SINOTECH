/**
 * "Материалы и методология" — an open-ended library, separate from the six
 * fixed corporate-training programmes and unrelated to /blog (own content
 * type, own folder, no shared component or navigation).
 *
 * Each material is one JSON file in ./materials/*.json (this directory).
 * Vite's import.meta.glob discovers every matching file at build time —
 * publishing a new material is "drop a file, commit, push", exactly like
 * how content/pending/*.json publishes a Telegram post (see
 * scripts/webhook-deploy.py) — no code edit, no touching this file.
 *
 * See src/data/materials/_example.md for the exact JSON shape (kept as
 * ".md" so it's never picked up by the glob below).
 */
export interface MaterialBlock {
  type: 'paragraph' | 'heading' | 'list' | 'image'
  /** paragraph/heading text, or image alt text */
  text?: string
  /** list items, only for type: 'list' */
  items?: string[]
  /** image path under /public, only for type: 'image' */
  src?: string
}

export interface Material {
  /** URL slug under /corporate-training/materials/ — must be unique. */
  slug: string
  title: string
  /** Short intro shown on the material page and as the card description on the list page. */
  intro: string
  /** Optional industry tag, e.g. "Пищевая промышленность". */
  industryTag?: string
  /** ISO date, used for sorting (newest first). */
  date: string
  /** Optional cover image path under /public; falls back to materialCoverPath(slug) convention if omitted. */
  cover?: string
  body: MaterialBlock[]
}

// Eagerly import every JSON file directly under ./materials/ (not
// subdirectories) as a Material. New files matching this glob are picked
// up automatically on the next build — nothing here needs editing.
const modules = import.meta.glob('./materials/*.json', { eager: true }) as Record<string, { default: Material }>

export const materials: Material[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => b.date.localeCompare(a.date))

export function getMaterial(slug: string): Material | undefined {
  return materials.find((m) => m.slug === slug)
}

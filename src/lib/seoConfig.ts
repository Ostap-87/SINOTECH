/**
 * Single source of truth for the site's canonical domain. Update this the
 * moment a real domain is attached — it feeds canonical/og:url tags here
 * and scripts/generate-sitemap.mjs (kept as a plain-JS mirror since that
 * script runs under plain Node, outside the Vite/TS build).
 */
export const SITE_URL = 'https://sinotechvoyage.com'

export const SITE_NAME = 'Sinotech Voyage'

export const OG_IMAGE_RU = `${SITE_URL}/og-image-ru.png`
export const OG_IMAGE_EN = `${SITE_URL}/og-image-en.png`

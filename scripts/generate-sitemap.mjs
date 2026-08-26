// Regenerates public/sitemap.xml from the current content — run automatically
// as part of `npm run build` (see package.json) so it's never stale: every
// new sector, tour or static page is picked up the next time the site
// builds, with no manual edits.
//
// SITE_URL is a plain-JS mirror of src/lib/seoConfig.ts (that file is TS,
// this script runs under plain Node outside the Vite/TS build) — keep both
// in sync when the real domain is attached.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const SITE_URL = 'https://globaltechtour.ru'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const companies = JSON.parse(readFileSync(join(root, 'src/data/companies.json'), 'utf8'))
const tours = JSON.parse(readFileSync(join(root, 'src/data/tours.json'), 'utf8'))
const siteContent = JSON.parse(readFileSync(join(root, 'src/data/site_content.example.json'), 'utf8'))

// Corporate-training programmes are a fixed list in code (see
// src/data/corporateTraining.ts) — kept here as a plain-JS mirror of its
// slugs since this script runs outside the TS build. Materials, by
// contrast, are one JSON file per item under src/data/materials/*.json —
// read that directory directly so a new material file needs no edit here.
const CORPORATE_TRAINING_SLUGS = ['huawei', 'alibaba', 'xiaomi', 'haier', 'bytedance', 'ping-an']
const materialsDir = join(root, 'src/data/materials')
const materialSlugs = readdirSync(materialsDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.slice(0, -'.json'.length))

const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/industries', changefreq: 'weekly', priority: '0.9' },
  { path: '/constructor', changefreq: 'monthly', priority: '0.8' },
  { path: '/expeditions', changefreq: 'weekly', priority: '0.9' },
  { path: '/expeditions/recommended', changefreq: 'weekly', priority: '0.7' },
  { path: '/consulting', changefreq: 'monthly', priority: '0.8' },
  { path: '/companies', changefreq: 'weekly', priority: '0.8' },
  { path: '/corporate-training', changefreq: 'weekly', priority: '0.8' },
  { path: '/corporate-training/materials', changefreq: 'weekly', priority: '0.6' },
  { path: '/cases', changefreq: 'weekly', priority: '0.7' },
  { path: '/blog', changefreq: 'weekly', priority: '0.6' },
  { path: '/faq', changefreq: 'monthly', priority: '0.6' },
  { path: '/partners', changefreq: 'monthly', priority: '0.5' },
  { path: '/contacts', changefreq: 'monthly', priority: '0.6' },
]

const sectorRoutes = companies.sectors.map((s) => ({
  path: `/industries/${s.code}`,
  changefreq: 'weekly',
  priority: '0.7',
}))

const tourRoutes = tours.tours.map((t) => ({
  path: `/expeditions/${t.tour_id}`,
  changefreq: 'weekly',
  priority: '0.8',
}))

const companyRoutes = companies.companies.map((c) => ({
  path: `/companies/${c.id}`,
  changefreq: 'monthly',
  priority: '0.5',
}))

const blogRoutes = (siteContent.blog ?? []).map((post) => ({
  path: `/blog/${post.slug}`,
  changefreq: 'monthly',
  priority: '0.65',
  lastmod: post.updatedAt ?? post.date,
}))

const corporateTrainingRoutes = CORPORATE_TRAINING_SLUGS.map((slug) => ({
  path: `/corporate-training/${slug}`,
  changefreq: 'monthly',
  priority: '0.7',
}))

const materialRoutes = materialSlugs.map((slug) => ({
  path: `/corporate-training/materials/${slug}`,
  changefreq: 'monthly',
  priority: '0.5',
}))

const routes = [
  ...STATIC_ROUTES,
  ...sectorRoutes,
  ...tourRoutes,
  ...companyRoutes,
  ...blogRoutes,
  ...corporateTrainingRoutes,
  ...materialRoutes,
]

const today = new Date().toISOString().slice(0, 10)

// Russian is the un-prefixed default (/blog/x), English lives under /en
// (/en/blog/x) — see src/i18n/LanguageContext.tsx. Every URL declares BOTH
// language versions via xhtml:link hreflang, per Google's bidirectional-
// annotation requirement, plus x-default pointing at the Russian version.
function enPath(path) {
  return path === '/' ? '/en' : `/en${path}`
}

function urlEntry(loc, r) {
  const ruUrl = `${SITE_URL}${r.path}`
  const enUrl = `${SITE_URL}${enPath(r.path)}`
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${r.lastmod ?? today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
    <xhtml:link rel="alternate" hreflang="ru" href="${ruUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${ruUrl}" />
  </url>`
}

const body = routes
  .flatMap((r) => [urlEntry(`${SITE_URL}${r.path}`, r), urlEntry(`${SITE_URL}${enPath(r.path)}`, r)])
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`

writeFileSync(join(root, 'public/sitemap.xml'), xml)
console.log(`sitemap.xml written with ${routes.length * 2} URLs (ru + en)`)

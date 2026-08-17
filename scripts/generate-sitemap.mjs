// Regenerates public/sitemap.xml from the current content — run automatically
// as part of `npm run build` (see package.json) so it's never stale: every
// new sector, tour or static page is picked up the next time the site
// builds, with no manual edits.
//
// SITE_URL is a plain-JS mirror of src/lib/seoConfig.ts (that file is TS,
// this script runs under plain Node outside the Vite/TS build) — keep both
// in sync when the real domain is attached.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const SITE_URL = 'https://globaltechtour.ru'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const companies = JSON.parse(readFileSync(join(root, 'src/data/companies.json'), 'utf8'))
const tours = JSON.parse(readFileSync(join(root, 'src/data/tours.json'), 'utf8'))
const siteContent = JSON.parse(readFileSync(join(root, 'src/data/site_content.example.json'), 'utf8'))

const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/industries', changefreq: 'weekly', priority: '0.9' },
  { path: '/constructor', changefreq: 'monthly', priority: '0.8' },
  { path: '/expeditions', changefreq: 'weekly', priority: '0.9' },
  { path: '/expeditions/recommended', changefreq: 'weekly', priority: '0.7' },
  { path: '/consulting', changefreq: 'monthly', priority: '0.8' },
  { path: '/companies', changefreq: 'weekly', priority: '0.8' },
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

const routes = [...STATIC_ROUTES, ...sectorRoutes, ...tourRoutes, ...companyRoutes, ...blogRoutes]

const today = new Date().toISOString().slice(0, 10)

const body = routes
  .map(
    (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${r.lastmod ?? today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

writeFileSync(join(root, 'public/sitemap.xml'), xml)
console.log(`sitemap.xml written with ${routes.length} URLs`)

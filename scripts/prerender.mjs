// Static prerendering pass, run after `vite build` (see package.json).
//
// The site is a pure client-rendered SPA (no SSR framework) — dist/index.html
// ships an empty <div id="root">, and all real content only exists after
// React executes. Googlebot can eventually render JS, but Yandex's crawler
// mostly can't, and a brand-new low-authority domain gets deprioritized for
// JS rendering anyway — in practice this meant only the homepage ever got
// crawled (confirmed via Yandex.Webmaster: 1 page discovered, everything
// else invisible).
//
// This script spins up a static file server over the just-built dist/,
// visits every real route with headless Chromium (same browser already
// bundled in this environment for Playwright), and overwrites dist/<route>/
// index.html with the fully rendered HTML. Nginx then serves that static
// file directly to crawlers (and to real users on first load) — no JS
// execution required to see real content and real <a href> links to the
// rest of the site. The client bundle still loads and takes over for
// in-app navigation exactly as before; this only changes what the very
// first HTML response contains.
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'
import handler from 'serve-handler'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const distDir = join(root, 'dist')
const PORT = 4173
const CONCURRENCY = 5
const PAGE_TIMEOUT_MS = 60000

const companies = JSON.parse(readFileSync(join(root, 'src/data/companies.json'), 'utf8'))
const tours = JSON.parse(readFileSync(join(root, 'src/data/tours.json'), 'utf8'))
const siteContent = JSON.parse(readFileSync(join(root, 'src/data/site_content.example.json'), 'utf8'))

const STATIC_ROUTES = [
  '/', '/industries', '/constructor', '/expeditions', '/expeditions/recommended',
  '/consulting', '/companies', '/cases', '/blog', '/faq', '/partners', '/contacts',
]

const routes = [
  ...STATIC_ROUTES,
  ...companies.sectors.map((s) => `/industries/${s.code}`),
  ...tours.tours.map((t) => `/expeditions/${t.tour_id}`),
  ...companies.companies.map((c) => `/companies/${c.id}`),
  ...(siteContent.blog ?? []).map((post) => `/blog/${post.slug}`),
]

function outputPathFor(routePath) {
  if (routePath === '/') return join(distDir, 'index.html')
  return join(distDir, routePath.replace(/^\//, ''), 'index.html')
}

async function renderRoute(browserContext, routePath) {
  const page = await browserContext.newPage()
  try {
    await page.goto(`http://127.0.0.1:${PORT}${routePath}`, { waitUntil: 'networkidle', timeout: PAGE_TIMEOUT_MS })
    // Give React a moment past networkidle for any deferred client-only work
    // (canvas/particle mounts etc.) — cheap relative to the page load itself.
    await page.waitForTimeout(150)
    const html = await page.content()
    const outPath = outputPathFor(routePath)
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, html)
    return { routePath, ok: true }
  } catch (err) {
    return { routePath, ok: false, error: String(err) }
  } finally {
    await page.close()
  }
}

async function runPool(items, worker, concurrency) {
  const results = []
  let i = 0
  async function next() {
    while (i < items.length) {
      const idx = i++
      results[idx] = await worker(items[idx])
    }
  }
  await Promise.all(Array.from({ length: concurrency }, next))
  return results
}

async function main() {
  const server = createServer((req, res) =>
    handler(req, res, { public: distDir, cleanUrls: false, rewrites: [{ source: '**', destination: '/index.html' }] }),
  )
  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve))

  // Sandboxed CI environments in this project pre-install Chromium at a fixed
  // path instead of letting Playwright download its own pinned revision; use
  // it when present. Elsewhere (e.g. the deploy VPS, which has normal
  // outbound internet) fall back to Playwright's own browser resolution,
  // which downloads the matching revision on first run and caches it for
  // subsequent deploys.
  const sandboxChromium = '/opt/pw-browsers/chromium'
  const launchOptions = existsSync(sandboxChromium) ? { executablePath: sandboxChromium } : {}
  const browser = await chromium.launch(launchOptions)
  const context = await browser.newContext()
  // The app calls out to an IP-geolocation API on mount to guess the visitor's
  // locale. During prerendering that request has nothing to do with the HTML
  // we're capturing, and if the network is slow/unreachable it hangs the page
  // past `networkidle`. Short-circuit it so prerendering never depends on
  // reaching an external service.
  await context.route('https://get.geojs.io/**', (route) => route.abort())

  console.log(`Prerendering ${routes.length} routes (concurrency ${CONCURRENCY})...`)
  const results = await runPool(routes, (r) => renderRoute(context, r), CONCURRENCY)

  // A route can time out simply because it landed while the preview server
  // was busy with the other concurrent requests, not because it's actually
  // broken — retry failures once, serially, once the pool has drained and
  // contention is gone.
  let failedRoutes = results.filter((r) => !r.ok).map((r) => r.routePath)
  if (failedRoutes.length) {
    console.log(`Retrying ${failedRoutes.length} failed routes serially...`)
    const retryResults = await runPool(failedRoutes, (r) => renderRoute(context, r), 1)
    for (const r of retryResults) {
      const idx = results.findIndex((x) => x.routePath === r.routePath)
      results[idx] = r
    }
  }

  await browser.close()
  await new Promise((resolve) => server.close(resolve))

  const failed = results.filter((r) => !r.ok)
  console.log(`Prerendered ${results.length - failed.length}/${results.length} routes.`)
  if (failed.length) {
    console.error(`Failed routes (${failed.length}):`)
    for (const f of failed.slice(0, 20)) console.error(`  ${f.routePath}: ${f.error}`)
    if (failed.length > 20) console.error(`  ...and ${failed.length - 20} more`)
    // A handful of stubborn routes (usually heavy interactive pages under
    // load) shouldn't block the whole deploy — they simply keep the generic
    // client-rendered dist/index.html instead of a prerendered snapshot,
    // same as before this script existed. Only a mass failure (server not
    // actually serving pages) should fail the build and stop the deploy.
    const failureRate = failed.length / results.length
    if (failureRate > 0.3) {
      console.error(`Failure rate ${(failureRate * 100).toFixed(0)}% exceeds threshold — failing build.`)
      process.exitCode = 1
    }
  }
}

main()

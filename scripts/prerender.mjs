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
// This runs on a ~1GB RAM VPS shared with several other long-running
// services (two other Node deploy webhooks, a Next.js server, a poller).
// Higher concurrency was found to push the box into heavy swapping, which
// doesn't fail routes outright but makes each one crawl — a handful of
// timed-out routes at concurrency 10 turned into a serial retry queue that
// took over an hour under swap thrashing. Low concurrency + a hard time
// budget on the retry pass keeps total deploy time bounded even when the
// box is under memory pressure.
const CONCURRENCY = 2
const PAGE_TIMEOUT_MS = 45000
const RETRY_PAGE_TIMEOUT_MS = 20000
const RETRY_BUDGET_MS = 8 * 60 * 1000

// /cases and /consulting run heavier client-side work (canvas particle
// animation, image carousels) than the rest of the site and have been
// observed timing out under memory pressure on this box more often than
// other routes, intermittently dropping out of Yandex's index when a given
// deploy's prerender snapshot for them fails (see comment near the bottom
// of this file on failed-route handling). They get a longer timeout and go
// first in the queue, before pool contention from ~1000 other routes builds
// up — this doesn't fix the underlying resource constraint, but gives these
// two routes the best chance of succeeding on every deploy.
const HEAVY_ROUTES = new Set(['/cases', '/consulting'])
const HEAVY_PAGE_TIMEOUT_MS = 90000

const companies = JSON.parse(readFileSync(join(root, 'src/data/companies.json'), 'utf8'))
const tours = JSON.parse(readFileSync(join(root, 'src/data/tours.json'), 'utf8'))
const siteContent = JSON.parse(readFileSync(join(root, 'src/data/site_content.example.json'), 'utf8'))

const STATIC_ROUTES = [
  '/', '/industries', '/constructor', '/expeditions', '/expeditions/recommended',
  '/consulting', '/companies', '/cases', '/blog', '/faq', '/partners', '/contacts',
]

const ruRoutes = [
  ...STATIC_ROUTES,
  ...companies.sectors.map((s) => `/industries/${s.code}`),
  ...tours.tours.map((t) => `/expeditions/${t.tour_id}`),
  ...companies.companies.map((c) => `/companies/${c.id}`),
  ...(siteContent.blog ?? []).map((post) => `/blog/${post.slug}`),
]

// English mirror under /en — real, separately-crawlable URLs for hreflang
// (see LanguageContext.tsx) instead of one URL whose content silently swaps
// client-side. This doubles the route count and therefore the prerender
// wall-clock at the fixed low concurrency above — accepted tradeoff, since
// hreflang without a real second URL per page is not real hreflang.
const allRoutes = [...ruRoutes, ...ruRoutes.map((r) => (r === '/' ? '/en' : `/en${r}`))]

function isHeavyRoute(routePath) {
  const bare = routePath.startsWith('/en/') ? routePath.slice(3) : routePath
  return HEAVY_ROUTES.has(bare)
}

// Heavy routes go first, ahead of pool contention — see HEAVY_ROUTES above.
const routes = [
  ...allRoutes.filter((r) => isHeavyRoute(r)),
  ...allRoutes.filter((r) => !isHeavyRoute(r)),
]

function outputPathFor(routePath) {
  if (routePath === '/') return join(distDir, 'index.html')
  return join(distDir, routePath.replace(/^\//, ''), 'index.html')
}

async function renderRoute(browserContext, routePath, timeout = PAGE_TIMEOUT_MS) {
  const page = await browserContext.newPage()
  try {
    await page.goto(`http://127.0.0.1:${PORT}${routePath}`, { waitUntil: 'networkidle', timeout })
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
  const results = await runPool(
    routes,
    (r) => renderRoute(context, r, isHeavyRoute(r) ? HEAVY_PAGE_TIMEOUT_MS : PAGE_TIMEOUT_MS),
    CONCURRENCY,
  )

  // A route can time out simply because it landed while the preview server
  // was busy with the other concurrent requests, not because it's actually
  // broken — retry failures once, serially, once the pool has drained and
  // contention is gone. Bounded by a hard time budget: under real memory
  // pressure even serial retries can crawl, and an unbounded retry queue is
  // exactly what turned one bad deploy into an hours-long hang.
  let failedRoutes = results.filter((r) => !r.ok).map((r) => r.routePath)
  if (failedRoutes.length) {
    console.log(`Retrying ${failedRoutes.length} failed routes serially (budget ${RETRY_BUDGET_MS / 1000}s)...`)
    const retryDeadline = Date.now() + RETRY_BUDGET_MS
    let retried = 0
    for (const routePath of failedRoutes) {
      if (Date.now() >= retryDeadline) {
        console.log(`Retry budget exhausted after ${retried}/${failedRoutes.length} routes — moving on.`)
        break
      }
      const retryTimeout = isHeavyRoute(routePath)
        ? Math.max(RETRY_PAGE_TIMEOUT_MS, HEAVY_PAGE_TIMEOUT_MS / 2)
        : RETRY_PAGE_TIMEOUT_MS
      const r = await renderRoute(context, routePath, retryTimeout)
      retried++
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

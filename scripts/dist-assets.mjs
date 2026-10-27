// Keeps dist/ consistent now that `vite build` no longer wipes it
// (vite.config.ts: build.emptyOutDir = false — wiping is what left the live
// site without any JS/CSS on 26.10.2026, when a deploy died halfway: dist/assets
// was deleted while the prerendered pages pointing at it stayed).
//
//   node scripts/dist-assets.mjs repair   — right after `vite build`
//     Any page in dist/ that links an /assets/ file which no longer exists
//     (left over from a broken deploy) is replaced with the fresh SPA shell
//     dist/index.html that vite just wrote, so it works again at once instead
//     of waiting hours for prerender to reach it. Prerender then overwrites it
//     with a full snapshot as usual.
//
//   node scripts/dist-assets.mjs prune    — last step, after prerender
//     Deletes old hashed files from dist/assets, but only those that no page in
//     dist/ uses (directly or via chunks it imports — a route whose prerender
//     failed keeps its older snapshot, and it must keep working) and that are
//     older than KEEP_HOURS (a browser may still have the previous HTML cached).
//
// Neither mode ever fails the build: errors are logged and the deploy goes on.
import { readdirSync, readFileSync, writeFileSync, statSync, unlinkSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const distDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const assetsDir = join(distDir, 'assets')
const shellPath = join(distDir, 'index.html')
const KEEP_HOURS = 48
// Hashed file names as they appear inside HTML (/assets/name-hash.js),
// CSS (url(/assets/...)) and JS chunks ("./name-hash.js").
const NAME_RE = /[A-Za-z0-9_.-]+\.(?:js|mjs|css|woff2?|ttf|otf|eot|png|jpe?g|gif|svg|webp|avif|ico|mp4|webm|json|wasm)/g
// What a page needs to boot: its <script src> / <link href> into /assets/.
const PAGE_ASSET_RE = /\/assets\/([A-Za-z0-9_.-]+\.(?:js|css))/g

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (p !== assetsDir) yield* htmlFiles(p)
    } else if (entry.name.endsWith('.html')) {
      yield p
    }
  }
}

function assetNames() {
  try {
    return readdirSync(assetsDir)
  } catch {
    return null
  }
}

function repair() {
  const names = assetNames()
  if (!names) return console.log('[dist-assets] no dist/assets — nothing to repair')
  const existing = new Set(names)
  const shell = readFileSync(shellPath, 'utf8')
  let pages = 0
  let repaired = 0
  for (const file of htmlFiles(distDir)) {
    if (file === shellPath) continue
    pages++
    const html = readFileSync(file, 'utf8')
    const broken = [...html.matchAll(PAGE_ASSET_RE)].some((m) => !existing.has(m[1]))
    if (broken) {
      writeFileSync(file, shell)
      repaired++
    }
  }
  console.log(`[dist-assets] repair: ${pages} pages checked, ${repaired} pointed at missing assets and now get the fresh SPA shell`)
}

function prune() {
  const names = assetNames()
  if (!names) return console.log('[dist-assets] no dist/assets — nothing to prune')
  const existing = new Set(names)
  const namesIn = (text) => [...text.matchAll(NAME_RE)].map((m) => m[0]).filter((n) => existing.has(n))

  // Everything any page references directly...
  const used = new Set()
  let pages = 0
  for (const file of htmlFiles(distDir)) {
    pages++
    for (const name of namesIn(readFileSync(file, 'utf8'))) used.add(name)
  }
  // ...plus everything those JS/CSS files pull in (lazy route chunks, fonts).
  const queue = [...used]
  while (queue.length) {
    const name = queue.pop()
    if (!['.js', '.mjs', '.css'].includes(extname(name))) continue
    for (const dep of namesIn(readFileSync(join(assetsDir, name), 'utf8'))) {
      if (!used.has(dep)) {
        used.add(dep)
        queue.push(dep)
      }
    }
  }

  const cutoff = Date.now() - KEEP_HOURS * 3600 * 1000
  let removed = 0
  for (const name of names) {
    const p = join(assetsDir, name)
    const st = statSync(p)
    if (!st.isFile() || used.has(name) || st.mtimeMs > cutoff) continue
    unlinkSync(p)
    removed++
  }
  console.log(`[dist-assets] prune: ${pages} pages scanned, ${used.size} assets in use, ${removed} old files removed`)
}

const mode = process.argv[2]
try {
  if (mode === 'repair') repair()
  else if (mode === 'prune') prune()
  else console.error('[dist-assets] usage: node scripts/dist-assets.mjs repair|prune')
} catch (err) {
  console.error(`[dist-assets] ${mode} skipped: ${err.stack || err}`)
}

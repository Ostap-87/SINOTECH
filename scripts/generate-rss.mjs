// Regenerates public/rss.xml from the blog content — run automatically as
// part of `npm run build` (see package.json), same pattern as
// generate-sitemap.mjs. NOTE: this is a plain SEO/syndication feed, not the
// Zen pipeline — Yandex Zen retired RSS import; Zen actually mirrors the
// "Командировка в будущее" Telegram channel via its Telegram cross-posting
// bot (see CLAUDE.md). Keep this feed for other RSS readers / search engines.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const SITE_URL = 'https://globaltechtour.ru'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const siteContent = JSON.parse(readFileSync(join(root, 'src/data/site_content.example.json'), 'utf8'))
const posts = [...(siteContent.blog ?? [])].sort((a, b) => (a.date < b.date ? 1 : -1))

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toHtml(body) {
  return body
    .split('\n\n')
    .map((block) => (block.startsWith('## ') ? `<h2>${escapeXml(block.slice(3))}</h2>` : `<p>${escapeXml(block)}</p>`))
    .join('')
}

const items = posts
  .map((post) => {
    const url = `${SITE_URL}/blog/${post.slug}`
    const pubDate = new Date(post.date).toUTCString()
    return `
    <item>
      <title>${escapeXml(post.title_ru)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.excerpt_ru)}</description>
      <content:encoded><![CDATA[${toHtml(post.body_ru)}]]></content:encoded>
    </item>`
  })
  .join('')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Global Tech Tour — Блог</title>
    <link>${SITE_URL}/blog</link>
    <description>Бенчмаркинг-туры и бизнес с Китаем: статьи Global Tech Tour.</description>
    <language>ru</language>${items}
  </channel>
</rss>
`

writeFileSync(join(root, 'public/rss.xml'), xml)
console.log(`rss.xml written with ${posts.length} posts`)

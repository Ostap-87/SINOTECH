import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage, stripLocalePrefix } from '@/i18n/LanguageContext'
import { SITE_URL, OG_IMAGE_RU, OG_IMAGE_EN } from '@/lib/seoConfig'

function setMeta(selector: string, attr: string, value: string) {
  const el = document.querySelector(selector)
  if (!el) return null
  const previous = el.getAttribute(attr)
  el.setAttribute(attr, value)
  return previous
}

/**
 * Sets document.title, the description meta, canonical link, and the
 * Open Graph / Twitter Card tags for the lifetime of the mounted page.
 *
 * This is a client-rendered SPA with no per-route head management, so each
 * page that cares about its own metadata calls this instead. It's the most
 * we can do without server-side rendering: it's correctly picked up by
 * Google's JS-executing crawler and by anything sharing a link from
 * *within* the running app, but most social-preview bots (Telegram,
 * WhatsApp, Facebook, Slack…) fetch raw HTML and never run this — they
 * only ever see index.html's static defaults. True per-page social
 * previews would need prerendering/SSR.
 */
export function usePageMeta(title: string, description?: string, options?: { noindex?: boolean }) {
  const location = useLocation()
  const { locale } = useLanguage()
  const noindex = options?.noindex ?? false

  useEffect(() => {
    const url = `${SITE_URL}${location.pathname}`
    const image = locale === 'ru' ? OG_IMAGE_RU : OG_IMAGE_EN

    const previousTitle = document.title
    document.title = title

    const restore: Array<() => void> = [() => (document.title = previousTitle)]

    const robotsPrev = setMeta('meta[name="robots"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow')
    if (robotsPrev !== null) restore.push(() => setMeta('meta[name="robots"]', 'content', robotsPrev))

    if (description) {
      const prev = setMeta('meta[name="description"]', 'content', description)
      if (prev !== null) restore.push(() => setMeta('meta[name="description"]', 'content', prev))
    }

    const canonical = document.querySelector('link[rel="canonical"]')
    const prevCanonical = canonical?.getAttribute('href') ?? null
    if (canonical) canonical.setAttribute('href', url)
    if (prevCanonical !== null) restore.push(() => canonical?.setAttribute('href', prevCanonical))

    const barePath = stripLocalePrefix(location.pathname)
    const ruUrl = `${SITE_URL}${barePath}`
    const enUrl = barePath === '/' ? `${SITE_URL}/en` : `${SITE_URL}/en${barePath}`
    const hreflangPairs: [string, string][] = [
      ['link[rel="alternate"][hreflang="ru"]', ruUrl],
      ['link[rel="alternate"][hreflang="en"]', enUrl],
      ['link[rel="alternate"][hreflang="x-default"]', ruUrl],
    ]
    for (const [selector, href] of hreflangPairs) {
      const prev = setMeta(selector, 'href', href)
      if (prev !== null) restore.push(() => setMeta(selector, 'href', prev))
    }

    const ogPairs: [string, string][] = [
      ['meta[property="og:title"]', title],
      ['meta[property="og:url"]', url],
      ['meta[property="og:image"]', image],
      ['meta[property="og:locale"]', locale === 'ru' ? 'ru_RU' : 'en_US'],
      ['meta[name="twitter:title"]', title],
      ['meta[name="twitter:image"]', image],
    ]
    if (description) {
      ogPairs.push(['meta[property="og:description"]', description])
      ogPairs.push(['meta[name="twitter:description"]', description])
    }
    for (const [selector, value] of ogPairs) {
      const prev = setMeta(selector, 'content', value)
      if (prev !== null) restore.push(() => setMeta(selector, 'content', prev))
    }

    return () => {
      for (const undo of restore) undo()
    }
  }, [title, description, location.pathname, locale, noindex])
}

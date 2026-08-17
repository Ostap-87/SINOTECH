import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const METRIKA_ID = 111237217

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void
  }
}

/**
 * Yandex Metrika's snippet in index.html only fires an initial 'hit' on the
 * first real page load. This is a client-rendered SPA (react-router with no
 * full reload between routes), so every subsequent navigation was silently
 * invisible to Metrika — the counter only ever saw one pageview per visit,
 * no matter how many pages the visitor actually browsed. Mounted once at
 * the app root, this sends an explicit 'hit' on every route change so
 * internal navigation is counted like Metrika expects from an SPA.
 */
export function useMetrikaPageview() {
  const location = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    window.ym?.(METRIKA_ID, 'hit', location.pathname + location.search)
  }, [location.pathname, location.search])
}

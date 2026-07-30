import { useEffect } from 'react'

/**
 * Sets document.title and the <meta name="description"> content for the
 * lifetime of the mounted page — this is an SPA with no per-route head
 * management, so each page that cares about its own title/description
 * calls this instead.
 */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    const meta = document.querySelector('meta[name="description"]')
    const previousDescription = meta?.getAttribute('content') ?? undefined
    if (meta && description) meta.setAttribute('content', description)

    return () => {
      document.title = previousTitle
      if (meta && previousDescription !== undefined) meta.setAttribute('content', previousDescription)
    }
  }, [title, description])
}

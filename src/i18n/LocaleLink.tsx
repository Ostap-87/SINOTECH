import { forwardRef } from 'react'
import { Link, NavLink, Navigate, useNavigate } from 'react-router-dom'
import type { LinkProps, NavLinkProps } from 'react-router-dom'
import { useLanguage } from './LanguageContext'

/** Prepends /en to an absolute app path when the current locale is English.
 *  Leaves external URLs, mailto:/tel:, and hashes untouched. */
function localizePath(to: string, locale: 'ru' | 'en'): string {
  if (locale !== 'en') return to
  if (!to.startsWith('/')) return to // external, mailto:, tel:, anchor, etc.
  return to === '/' ? '/en' : `/en${to}`
}

/** Drop-in replacement for react-router's <Link> that keeps navigation inside
 *  the current language — every internal href in the app should use this
 *  instead of <Link> directly, so a visitor on /en/... stays on /en/... when
 *  clicking around rather than falling back to the Russian URL. */
export const LocaleLink = forwardRef<HTMLAnchorElement, LinkProps>(function LocaleLink(
  { to, ...rest },
  ref,
) {
  const { locale } = useLanguage()
  const target = typeof to === 'string' ? localizePath(to, locale) : to
  return <Link ref={ref} to={target} {...rest} />
})

export const LocaleNavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function LocaleNavLink(
  { to, ...rest },
  ref,
) {
  const { locale } = useLanguage()
  const target = typeof to === 'string' ? localizePath(to, locale) : to
  return <NavLink ref={ref} to={target} {...rest} />
})

/** Locale-aware replacement for react-router's <Navigate>, for redirect routes. */
export function LocaleNavigate({ to, replace }: { to: string; replace?: boolean }) {
  const { locale } = useLanguage()
  return <Navigate to={localizePath(to, locale)} replace={replace} />
}

/** Locale-aware replacement for react-router's useNavigate() when navigating
 *  to an absolute in-app path (e.g. after a form submit or a click handler). */
export function useLocaleNavigate() {
  const navigate = useNavigate()
  const { locale } = useLanguage()
  return (to: string, options?: { replace?: boolean }) => navigate(localizePath(to, locale), options)
}

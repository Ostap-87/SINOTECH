"use client";

import { useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { LanguageSwitcher } from "@/components/language-switcher";

export function SiteHeader({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/tours`, label: dict.nav.tours },
    { href: `/${locale}/contacts`, label: dict.nav.contacts },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-strong to-accent-2 text-accent-foreground">
            ST
          </span>
          <span>SinoTech Voyage</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <LanguageSwitcher locale={locale} />
          <Link
            href={`/${locale}/contacts`}
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            {dict.nav.cta}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
          aria-label="Menu"
          aria-expanded={open}
        >
          <span className="sr-only">Menu</span>
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-4 pb-6 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center justify-between gap-4">
            <LanguageSwitcher locale={locale} />
            <Link
              href={`/${locale}/contacts`}
              onClick={() => setOpen(false)}
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              {dict.nav.cta}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

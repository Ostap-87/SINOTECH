import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export function SiteFooter({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const year = new Date().getFullYear();

  const links = [
    { href: `/${locale}`, label: dict.footer.nav.home },
    { href: `/${locale}/about`, label: dict.footer.nav.about },
    { href: `/${locale}/tours`, label: dict.footer.nav.tours },
    { href: `/${locale}/contacts`, label: dict.footer.nav.contacts },
  ];

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-accent-strong to-accent-2 text-xs text-accent-foreground">
              ST
            </span>
            SinoTech Voyage
          </div>
          <p className="mt-1 text-sm text-muted">{dict.footer.tagline}</p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-muted">
          © {year} SinoTech Voyage. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}

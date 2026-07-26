"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";

function withLocale(pathname: string, locale: Locale) {
  const segments = pathname.split("/");
  segments[1] = locale;
  return segments.join("/") || "/";
}

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1 text-xs font-medium">
      {locales.map((item) => (
        <Link
          key={item}
          href={withLocale(pathname, item)}
          aria-current={item === locale}
          className={`rounded-full px-2.5 py-1 uppercase transition-colors ${
            item === locale
              ? "bg-accent text-accent-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          {item}
        </Link>
      ))}
    </div>
  );
}

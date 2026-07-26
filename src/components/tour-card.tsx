import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

export type TourItem = {
  id: string;
  title: string;
  location: string;
  duration: string;
  level: string;
  description: string;
  highlights: string[];
};

export function TourCard({
  tour,
  locale,
  ctaLabel,
}: {
  tour: TourItem;
  locale: Locale;
  ctaLabel: string;
}) {
  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/40">
      <div>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{tour.location}</span>
          <span>{tour.duration}</span>
        </div>
        <h3 className="mt-3 text-lg font-semibold text-foreground">
          {tour.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted">{tour.description}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {tour.highlights.slice(0, 3).map((highlight) => (
            <li
              key={highlight}
              className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs text-muted"
            >
              {highlight}
            </li>
          ))}
        </ul>
      </div>
      <Link
        href={`/${locale}/tours#${tour.id}`}
        className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent-strong transition-colors group-hover:text-accent"
      >
        {ctaLabel}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
    </article>
  );
}

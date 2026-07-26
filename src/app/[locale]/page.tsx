import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { TourCard } from "@/components/tour-card";
import { notFound } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const { hero, stats, features, toursPreview } = dict.home;

  return (
    <>
      <section className="relative overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <span className="rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
            {hero.eyebrow}
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-gradient">{hero.title}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
            {hero.subtitle}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href={`/${locale}/tours`}
              className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              {hero.ctaPrimary}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
            >
              {hero.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface/50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:px-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="text-3xl font-semibold text-gradient">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            {features.title}
          </h2>
          <p className="mt-3 text-muted">{features.subtitle}</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface/50">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                {toursPreview.title}
              </h2>
              <p className="mt-3 max-w-xl text-muted">
                {toursPreview.subtitle}
              </p>
            </div>
            <Link
              href={`/${locale}/tours`}
              className="text-sm font-medium text-accent-strong hover:text-accent"
            >
              {toursPreview.cta} →
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dict.tours.items.slice(0, 3).map((tour) => (
              <TourCard
                key={tour.id}
                tour={tour}
                locale={locale as Locale}
                ctaLabel={dict.tours.cta}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-surface to-surface-2 px-8 py-16 text-center sm:px-16">
          <h2 className="text-3xl font-semibold tracking-tight">
            {dict.home.cta.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            {dict.home.cta.subtitle}
          </p>
          <Link
            href={`/${locale}/contacts`}
            className="mt-8 inline-flex rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            {dict.home.cta.button}
          </Link>
        </div>
      </section>
    </>
  );
}

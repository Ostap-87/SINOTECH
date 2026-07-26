import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { notFound } from "next/navigation";

export default async function ToursPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const tours = dict.tours;

  return (
    <>
      <section className="border-b border-border bg-grid">
        <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
          <span className="rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
            {tours.eyebrow}
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {tours.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            {tours.subtitle}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          {tours.items.map((tour) => (
            <article
              key={tour.id}
              id={tour.id}
              className="scroll-mt-24 rounded-2xl border border-border bg-surface p-8"
            >
              <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
                <div className="lg:max-w-xl">
                  <h2 className="text-2xl font-semibold">{tour.title}</h2>
                  <p className="mt-3 leading-7 text-muted">
                    {tour.description}
                  </p>

                  <dl className="mt-6 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <dt className="text-xs uppercase text-muted">
                        {tours.locationLabel}
                      </dt>
                      <dd className="mt-1 font-medium">{tour.location}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-muted">
                        {tours.durationLabel}
                      </dt>
                      <dd className="mt-1 font-medium">{tour.duration}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-muted">
                        {tours.levelLabel}
                      </dt>
                      <dd className="mt-1 font-medium">{tour.level}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl border border-border bg-surface-2 p-6 lg:w-72 lg:shrink-0">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {tours.detailsLabel}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {tour.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`/${locale}/contacts`}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                  >
                    {tours.cta}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

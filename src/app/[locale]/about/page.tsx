import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { notFound } from "next/navigation";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const about = dict.about;

  return (
    <>
      <section className="border-b border-border bg-grid">
        <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
          <span className="rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
            {about.eyebrow}
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {about.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            {about.intro}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h2 className="text-xl font-semibold">{about.mission.title}</h2>
          <p className="mt-3 leading-7 text-muted">{about.mission.text}</p>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            {about.values.title}
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {about.values.items.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <h3 className="text-base font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-2 p-8">
          <h2 className="text-xl font-semibold">{about.team.title}</h2>
          <p className="mt-3 leading-7 text-muted">{about.team.text}</p>
        </div>
      </section>
    </>
  );
}

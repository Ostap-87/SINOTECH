import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ContactForm } from "@/components/contact-form";
import { notFound } from "next/navigation";

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const contacts = dict.contacts;

  return (
    <section className="border-b border-border bg-grid">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <span className="rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
          {contacts.eyebrow}
        </span>
        <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {contacts.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          {contacts.subtitle}
        </p>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {contacts.info.title}
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">{contacts.info.emailLabel}</dt>
                  <dd>
                    <a
                      href={`mailto:${contacts.info.email}`}
                      className="font-medium text-accent-strong hover:text-accent"
                    >
                      {contacts.info.email}
                    </a>
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">{contacts.info.phoneLabel}</dt>
                  <dd>
                    <a
                      href={`tel:${contacts.info.phone.replace(/[^+\d]/g, "")}`}
                      className="font-medium"
                    >
                      {contacts.info.phone}
                    </a>
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">{contacts.info.locationLabel}</dt>
                  <dd className="font-medium">{contacts.info.location}</dd>
                </div>
              </dl>
            </div>
          </div>

          <ContactForm form={contacts.form} />
        </div>
      </div>
    </section>
  );
}

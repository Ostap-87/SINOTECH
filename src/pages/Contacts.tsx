import { useState } from 'react'
import { ParticleCanvas } from '@/components/ParticleCanvas'
import { useLanguage } from '@/i18n/LanguageContext'
import { usePageMeta } from '@/hooks/usePageMeta'
import { siteContent } from '@/data'
import { ShimmerText } from '@/components/ShimmerText'
import { RevealText } from '@/components/RevealText'

interface ContactForm {
  name: string
  companyName: string
  phone: string
  email: string
  telegram: string
  message: string
}

const EMPTY_FORM: ContactForm = {
  name: '',
  companyName: '',
  phone: '',
  email: '',
  telegram: '',
  message: '',
}

export function Contacts() {
  const { locale } = useLanguage()
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM)
  const [website, setWebsite] = useState('') // honeypot — real visitors never see/fill this
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  usePageMeta(
    locale === 'ru' ? 'Контакты — Global Tech Tour' : 'Contacts — Global Tech Tour',
    locale === 'ru'
      ? 'Свяжитесь с нами — расскажите о задаче, подберём формат экспедиции или консалтинга и ответим в течение рабочего дня.'
      : "Get in touch — tell us your goal, we'll match a format and reply within one business day.",
  )

  const { company_en, company_ru, company_zh, legal_address, office_address, email, telegram, whatsapp, wechat } =
    siteContent.contacts

  const valid =
    form.name.trim().length > 0 && form.phone.trim().length > 0 && /\S+@\S+\.\S+/.test(form.email.trim())

  // Posts straight to the site's own lead-capture backend (scripts/lead-intake.py
  // on the VPS, proxied at /api/lead) — the previous version only opened a
  // mailto: link and relied on the visitor manually hitting "send" in their
  // own mail client, which silently lost most submissions. mailto stays as a
  // manual fallback (see the "Быстрая связь" block) if this ever fails.
  async function handleSubmit() {
    if (!valid || status === 'sending') return
    setStatus('sending')
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, website, locale }),
      })
      if (!response.ok) throw new Error(`status ${response.status}`)
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  const inputClass =
    'rounded-xl border border-black/10 bg-surface/40 px-4 py-2.5 text-sm text-bone-white placeholder:text-ash-gray focus:border-electric-iris/60 focus:outline-none'

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[820px] lg:h-[720px]">
        <ParticleCanvas shape="china" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, transparent 35%, var(--color-void) 92%, var(--color-void) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 pb-24 lg:pt-20">
        <p className="text-sm font-semibold uppercase tracking-[0.025em]">
          <ShimmerText variant="saffron" text={locale === 'ru' ? 'Контакты' : 'Contacts'} />
        </p>
        <h1 className="mt-6 max-w-3xl text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[44px] lg:text-[52px]">
          <RevealText text={locale === 'ru' ? 'Свяжитесь с нами' : 'Get in touch'} />
        </h1>
        <p className="mt-6 max-w-2xl text-lg font-normal text-silver-mist">
          {locale === 'ru'
            ? 'Расскажите о задаче — подберём формат экспедиции или консалтинга и ответим в течение рабочего дня.'
            : "Tell us about your goal — we'll match a format and reply within one business day."}
        </p>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/10 bg-surface/60 p-6">
              <h2 className="text-lg font-medium">{locale === 'ru' ? 'Реквизиты компании' : 'Company details'}</h2>
              <p className="mt-4 text-sm text-bone-white">{company_zh}</p>
              <p className="text-sm text-bone-white">{locale === 'ru' ? company_ru : company_en}</p>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">
                    {locale === 'ru' ? 'Юридический адрес' : 'Legal address'}
                  </p>
                  <p className="mt-1 text-sm text-silver-mist">{legal_address}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">
                    {locale === 'ru' ? 'Офис' : 'Office'}
                  </p>
                  <p className="mt-1 text-sm text-silver-mist">{office_address}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-surface/60 p-6">
              <h2 className="text-lg font-medium">{locale === 'ru' ? 'Быстрая связь' : 'Direct contacts'}</h2>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <a href={`mailto:${email}`} className="text-bone-white transition-colors hover:text-electric-iris">
                  {email}
                </a>
                <a
                  href={`https://t.me/${telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-bone-white transition-colors hover:text-electric-iris"
                >
                  Telegram: {telegram}
                </a>
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-bone-white transition-colors hover:text-electric-iris"
                >
                  WhatsApp: {whatsapp}
                </a>
                {wechat && <span className="text-bone-white">WeChat: {wechat}</span>}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-surface/60 p-6 sm:p-8">
            {status !== 'sent' ? (
              <>
                <h2 className="text-lg font-medium">{locale === 'ru' ? 'Оставить заявку' : 'Send an inquiry'}</h2>
                <div className="mt-4 flex flex-col gap-3">
                  {/* Honeypot — hidden from real visitors via CSS, not `type="hidden"`,
                      so form-filling bots that inspect visible inputs still fill it. */}
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder={locale === 'ru' ? 'Имя' : 'Name'}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                    placeholder={locale === 'ru' ? 'Название компании' : 'Company name'}
                    className={inputClass}
                  />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder={locale === 'ru' ? 'Телефон' : 'Phone'}
                    className={inputClass}
                  />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="Email"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={form.telegram}
                    onChange={(e) => setForm((f) => ({ ...f, telegram: e.target.value }))}
                    placeholder="Telegram (@username)"
                    className={inputClass}
                  />
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder={locale === 'ru' ? 'Расскажите о задаче' : 'Tell us about your goal'}
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <button
                  type="button"
                  disabled={!valid || status === 'sending'}
                  onClick={handleSubmit}
                  className={`mt-6 w-full rounded-full px-6 py-3 text-sm font-medium transition-opacity ${
                    valid && status !== 'sending'
                      ? 'bg-electric-iris text-white hover:opacity-90'
                      : 'cursor-not-allowed bg-black/10 text-ash-gray'
                  }`}
                >
                  {status === 'sending'
                    ? locale === 'ru'
                      ? 'Отправляем…'
                      : 'Sending…'
                    : locale === 'ru'
                      ? 'Отправить заявку'
                      : 'Send request'}
                </button>

                {status === 'error' && (
                  <p className="mt-3 text-sm text-red-400">
                    {locale === 'ru' ? (
                      <>
                        Не получилось отправить — попробуйте ещё раз или напишите напрямую на{' '}
                        <a href={`mailto:${email}`} className="underline">
                          {email}
                        </a>
                        .
                      </>
                    ) : (
                      <>
                        Something went wrong — try again, or email us directly at{' '}
                        <a href={`mailto:${email}`} className="underline">
                          {email}
                        </a>
                        .
                      </>
                    )}
                  </p>
                )}
              </>
            ) : (
              <div>
                <p className="text-lg font-medium text-bone-white">{locale === 'ru' ? 'Спасибо!' : 'Thank you!'}</p>
                <p className="mt-2 text-sm text-silver-mist">
                  {locale === 'ru'
                    ? 'Заявка отправлена — мы ответим в течение рабочего дня.'
                    : "Your inquiry is on its way — we'll reply within one business day."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

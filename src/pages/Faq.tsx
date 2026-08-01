import { useEffect, useState } from 'react'
import { ChevronDown, MessageCircle, Send } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'
import { usePageMeta } from '@/hooks/usePageMeta'
import { siteContent } from '@/data'
import { FAQ_GROUPS, FAQ_ITEMS, FAQ_DIRECTIONS, VISA_INFO_ACTUAL_DATE } from '@/data/faq'
import type { FaqBlock } from '@/data/faq'

/** Splits `**bold**` markers out of otherwise-plain text into React nodes. */
function renderInline(text: string) {
  const parts = text.split(/(\*\*.+?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-medium text-bone-white">{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

function FaqBlockView({ block }: { block: FaqBlock }) {
  if (block.type === 'p') {
    return <p className="text-sm text-silver-mist">{renderInline(block.text)}</p>
  }
  if (block.type === 'h') {
    return <p className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">{block.text}</p>
  }
  if (block.type === 'ul') {
    return (
      <ul className="space-y-2">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-silver-mist">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-electric-iris" />
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>
    )
  }
  return (
    <ol className="space-y-2">
      {block.items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm text-silver-mist">
          <span className="shrink-0 text-xs font-semibold text-electric-iris">{i + 1}.</span>
          <span>{renderInline(item)}</span>
        </li>
      ))}
    </ol>
  )
}

interface CtaForm {
  name: string
  company: string
  direction: string
  size: string
  contact: string
  comment: string
}

const EMPTY_CTA_FORM: CtaForm = { name: '', company: '', direction: '', size: '', contact: '', comment: '' }

export function Faq() {
  const { locale } = useLanguage()
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  const [ctaForm, setCtaForm] = useState<CtaForm>(EMPTY_CTA_FORM)
  const [ctaSent, setCtaSent] = useState(false)

  usePageMeta(
    locale === 'ru' ? 'Вопросы и ответы — Global Tech Tour' : 'FAQ — Global Tech Tour',
    locale === 'ru'
      ? 'Как устроены бизнес-визиты на технологические предприятия Китая: программа, доступ к руководству, требования к участникам, визы, организация поездки.'
      : "How business visits to China's technology companies work: programme, access to leadership, participant requirements, visas, trip logistics.",
  )

  // Deep-link support: /faq#companies opens and scrolls to that block.
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (!hash) return
    if (!FAQ_ITEMS.some((item) => item.id === hash)) return
    setOpenIds(new Set([hash]))
    const el = document.getElementById(hash)
    if (el) window.setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }, [])

  // schema.org/FAQPage structured data.
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.question_ru,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.blocks_ru
            .map((block) => (block.type === 'ul' || block.type === 'ol' ? block.items.join(' ') : block.text))
            .join(' ')
            .replace(/\*\*/g, ''),
        },
      })),
    })
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const { telegram, whatsapp } = siteContent.contacts

  const ctaValid = ctaForm.name.trim().length > 0 && ctaForm.contact.trim().length > 0

  function handleCtaSubmit() {
    if (!ctaValid) return
    const subject = encodeURIComponent(
      locale === 'ru' ? 'Заявка с FAQ — Global Tech Tour' : 'FAQ inquiry — Global Tech Tour',
    )
    const bodyLines = [
      `${locale === 'ru' ? 'Имя' : 'Name'}: ${ctaForm.name}`,
      `${locale === 'ru' ? 'Компания' : 'Company'}: ${ctaForm.company}`,
      `${locale === 'ru' ? 'Направление' : 'Direction'}: ${ctaForm.direction}`,
      `${locale === 'ru' ? 'Размер делегации' : 'Delegation size'}: ${ctaForm.size}`,
      `${locale === 'ru' ? 'Контакт для связи' : 'Contact'}: ${ctaForm.contact}`,
      `${locale === 'ru' ? 'Комментарий' : 'Comment'}: ${ctaForm.comment}`,
    ]
    const body = encodeURIComponent(bodyLines.join('\n'))
    window.location.href = `mailto:${siteContent.contacts.email}?subject=${subject}&body=${body}`
    setCtaSent(true)
  }

  const inputClass =
    'rounded-xl border border-black/10 bg-surface/40 px-4 py-2.5 text-sm text-bone-white placeholder:text-ash-gray focus:border-electric-iris/60 focus:outline-none'

  return (
    <section className="mx-auto w-full max-w-[900px] px-6 py-16 lg:py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.025em] text-saffron-spark">
        {locale === 'ru' ? 'FAQ' : 'FAQ'}
      </p>
      <h1 className="mt-6 text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[44px]">
        {locale === 'ru' ? 'Вопросы и ответы' : 'Questions & answers'}
      </h1>
      <p className="mt-6 max-w-2xl text-lg font-normal text-silver-mist">
        {locale === 'ru'
          ? 'Как устроены бизнес-визиты на технологические предприятия Китая: программа, доступ к руководству, требования к участникам, визы, организация поездки.'
          : "How business visits to China's technology companies work: programme, access to leadership, participant requirements, visas, trip logistics."}
      </p>

      {FAQ_GROUPS.map((group) => (
        <div key={group.id} className="mt-12">
          <h2 className="text-xl font-medium tracking-[-0.01em] text-bone-white">
            {locale === 'ru' ? group.title_ru : group.title_en}
          </h2>

          <div className="mt-4 flex flex-col gap-3">
            {FAQ_ITEMS.filter((item) => item.group === group.id).map((item) => {
              const isOpen = openIds.has(item.id)
              return (
                <div key={item.id} id={item.id} className="scroll-mt-24 rounded-2xl border border-black/10 bg-surface/60">
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                  >
                    <h3 className="text-base font-medium text-bone-white">
                      {locale === 'ru' ? item.question_ru : item.question_en}
                    </h3>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-ash-gray transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Answers stay in the DOM even when collapsed, only visually hidden — required so they're present in the initial HTML for indexing. */}
                  <div className={isOpen ? 'block' : 'hidden'}>
                    <div className="flex flex-col gap-3 px-5 pb-5 sm:px-6">
                      {(locale === 'ru' ? item.blocks_ru : item.blocks_en).map((block, i) => (
                        <FaqBlockView key={i} block={block} />
                      ))}
                      {item.id === 'visa' && (
                        <p className="text-xs text-ash-gray">
                          {locale === 'ru'
                            ? `Информация актуальна на: ${VISA_INFO_ACTUAL_DATE}`
                            : `Information current as of: ${VISA_INFO_ACTUAL_DATE}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div id="contacts" className="mt-16 scroll-mt-24 rounded-2xl border border-electric-iris/30 bg-electric-iris/10 p-6 sm:p-8">
        {!ctaSent ? (
          <>
            <h2 className="text-xl font-medium tracking-[-0.01em] text-bone-white">
              {locale === 'ru' ? 'Остался вопрос или нужен расчёт под вашу задачу?' : 'Still have a question, or need a quote for your brief?'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-silver-mist">
              {locale === 'ru'
                ? 'Расскажите, какое направление вам интересно, сколько человек в делегации и какие задачи вы хотите закрыть поездкой. Мы соберём маршрут под запрос и вернёмся с программой и расчётом.'
                : "Tell us which direction interests you, how many people are in the delegation, and what you want the trip to solve. We'll put together a route for your request and come back with a programme and a quote."}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={ctaForm.name}
                onChange={(e) => setCtaForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={locale === 'ru' ? 'Имя' : 'Name'}
                className={inputClass}
              />
              <input
                type="text"
                value={ctaForm.company}
                onChange={(e) => setCtaForm((f) => ({ ...f, company: e.target.value }))}
                placeholder={locale === 'ru' ? 'Компания' : 'Company'}
                className={inputClass}
              />
              <select
                value={ctaForm.direction}
                onChange={(e) => setCtaForm((f) => ({ ...f, direction: e.target.value }))}
                className={inputClass}
              >
                <option value="">{locale === 'ru' ? 'Направление' : 'Direction'}</option>
                {FAQ_DIRECTIONS.map((d) => (
                  <option key={d.ru} value={locale === 'ru' ? d.ru : d.en}>
                    {locale === 'ru' ? d.ru : d.en}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={ctaForm.size}
                onChange={(e) => setCtaForm((f) => ({ ...f, size: e.target.value }))}
                placeholder={locale === 'ru' ? 'Размер делегации' : 'Delegation size'}
                className={inputClass}
              />
              <input
                type="text"
                value={ctaForm.contact}
                onChange={(e) => setCtaForm((f) => ({ ...f, contact: e.target.value }))}
                placeholder={locale === 'ru' ? 'Контакт для связи' : 'Contact'}
                className={inputClass}
              />
              <input
                type="text"
                value={ctaForm.comment}
                onChange={(e) => setCtaForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder={locale === 'ru' ? 'Комментарий' : 'Comment'}
                className={inputClass}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                disabled={!ctaValid}
                onClick={handleCtaSubmit}
                className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-opacity ${
                  ctaValid ? 'bg-electric-iris text-white hover:opacity-90' : 'cursor-not-allowed bg-black/10 text-ash-gray'
                }`}
              >
                {locale === 'ru' ? 'Обсудить программу' : 'Discuss the programme'}
              </button>

              <a
                href={`https://t.me/${telegram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-ash-gray transition-colors hover:border-electric-iris/60 hover:text-bone-white"
              >
                <Send size={16} />
              </a>
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-ash-gray transition-colors hover:border-electric-iris/60 hover:text-bone-white"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </>
        ) : (
          <div>
            <p className="text-lg font-medium text-bone-white">{locale === 'ru' ? 'Спасибо!' : 'Thank you!'}</p>
            <p className="mt-2 text-sm text-silver-mist">
              {locale === 'ru'
                ? 'Мы открыли почтовый клиент с заполненным письмом — отправьте его, и мы ответим в течение рабочего дня.'
                : 'We opened your email client with a pre-filled message — send it and we will reply within one business day.'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

import { useState } from 'react'

/**
 * Application form embedded at the bottom of every programme page.
 * Reuses the exact same lead-capture channel as /contacts
 * (POST /api/lead → scripts/lead-intake.py → Telegram), so no parallel
 * backend is introduced (see Stage 0 audit / final report for why).
 *
 * Design note — the hidden "Программа" field: lead-intake.py formats the
 * Telegram message from a fixed FIELD_LABELS list (name/companyName/phone/
 * email/telegram/message) and ignores any other JSON key, and that Python
 * service runs as a long-lived process on the VPS that this repo's deploy
 * pipeline does not restart on push (webhook-deploy.py only rebuilds the
 * static site). Extending FIELD_LABELS with a "program" key would sit
 * inert on disk until someone restarts the service by hand. To avoid
 * requiring that out-of-band step, the programme name is folded into the
 * `message` field itself as a prefix — a field lead-intake.py already
 * relays verbatim — so every submission is immediately distinguishable by
 * programme with zero backend changes. See the final report for the
 * alternative (edit + restart lead-intake.py) if a real hidden field is
 * ever wanted.
 *
 * Design note — "phone or email" as one field: lead-intake.py hard-rejects
 * (HTTP 400) any submission whose `email` isn't a syntactically valid
 * address — Contacts.tsx works around this by requiring both phone AND a
 * valid email client-side, but Stage 3.1 asks for a single "phone or
 * email" field. When the visitor types something that isn't email-shaped,
 * we send it as `phone` (so the real value reaches the operator via the
 * Telegram message) and fill `email` with a fixed, non-personal
 * placeholder purely to satisfy that server-side check — never a value
 * derived from the visitor's input. See the final report for the
 * alternative (loosen lead-intake.py's check, needs a VPS-side restart).
 */
const PLACEHOLDER_EMAIL = 'phone-lead@globaltechtour.ru'
export function ApplicationForm({ programLabel }: { programLabel: string }) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [contact, setContact] = useState('')
  const [comment, setComment] = useState('')
  const [website, setWebsite] = useState('') // honeypot, mirrors Contacts.tsx
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const looksLikeEmail = /\S+@\S+\.\S+/.test(contact.trim())
  const looksLikePhone = contact.replace(/\D/g, '').length >= 5
  const valid = name.trim().length > 0 && (looksLikeEmail || looksLikePhone)

  async function handleSubmit() {
    if (!valid || status === 'sending') return
    setStatus('sending')

    // lead-intake.py's FIELD_LABELS already renders `phone` under its own
    // "Телефон:" line in the Telegram message, so the real phone number
    // reaches the operator even when `email` below is the placeholder.
    const taggedMessage = `[Программа: ${programLabel}]${comment.trim() ? `\n\n${comment.trim()}` : ''}`

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          companyName: company,
          phone: looksLikeEmail ? '' : contact,
          email: looksLikeEmail ? contact : PLACEHOLDER_EMAIL,
          message: taggedMessage,
          website,
          locale: 'ru',
        }),
      })
      if (!response.ok) throw new Error(`status ${response.status}`)
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  const inputClass =
    'rounded-xl border border-black/10 bg-surface/40 px-4 py-2.5 text-sm text-bone-white placeholder:text-ash-gray focus:border-electric-iris/60 focus:outline-none'

  if (status === 'sent') {
    return (
      <div className="rounded-2xl border border-black/10 bg-surface/60 p-6 sm:p-8">
        <p className="text-lg font-medium text-bone-white">Спасибо!</p>
        <p className="mt-2 text-sm text-silver-mist">
          Заявка на программу «{programLabel}» отправлена — мы ответим в течение рабочего дня.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-surface/60 p-6 sm:p-8">
      <h3 className="text-lg font-medium text-bone-white">Форма заявки</h3>
      <p className="mt-1 text-sm text-ash-gray">Программа: {programLabel}</p>

      <div className="mt-5 flex flex-col gap-3">
        {/* Honeypot — hidden from real visitors via CSS, not type="hidden". */}
        <input
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />
        {/* Hidden field: programme, auto-filled — see class-level comment on why
            it's folded into `message` on submit rather than sent as its own key. */}
        <input type="hidden" value={programLabel} readOnly aria-hidden="true" />

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя"
          className={inputClass}
        />
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Компания"
          className={inputClass}
        />
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Телефон или email"
          className={inputClass}
        />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Комментарий (необязательно)"
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="button"
        disabled={!valid || status === 'sending'}
        onClick={handleSubmit}
        className={`mt-5 w-full rounded-full px-6 py-3 text-sm font-medium transition-opacity sm:w-auto ${
          valid && status !== 'sending'
            ? 'bg-electric-iris text-white hover:opacity-90'
            : 'cursor-not-allowed bg-black/10 text-ash-gray'
        }`}
      >
        {status === 'sending' ? 'Отправляем…' : 'Отправить заявку'}
      </button>

      {status === 'error' && (
        <p className="mt-3 text-sm text-red-500">
          Не получилось отправить — попробуйте ещё раз или напишите напрямую через{' '}
          <a href="/contacts" className="underline">
            страницу контактов
          </a>
          .
        </p>
      )}
    </div>
  )
}

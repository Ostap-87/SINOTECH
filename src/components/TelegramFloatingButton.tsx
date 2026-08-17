import { useLanguage } from '@/i18n/LanguageContext'
import { TELEGRAM_CHANNEL_URL } from '@/lib/seoConfig'
import { TelegramIcon } from './TelegramIcon'

export function TelegramFloatingButton() {
  const { locale } = useLanguage()

  return (
    <a
      href={TELEGRAM_CHANNEL_URL}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#2AABEE] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/30 transition-transform hover:scale-105"
      aria-label={locale === 'ru' ? 'Подписаться на наш Telegram-канал' : 'Subscribe to our Telegram channel'}
    >
      <TelegramIcon className="h-5 w-5" />
      <span className="hidden sm:inline">{locale === 'ru' ? 'Подписаться' : 'Subscribe'}</span>
    </a>
  )
}

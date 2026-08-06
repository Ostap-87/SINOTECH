import { Link } from 'react-router-dom'
import { useLanguage } from '@/i18n/LanguageContext'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ShimmerText } from '@/components/ShimmerText'
import { RevealText } from '@/components/RevealText'

export function NotFound() {
  const { locale } = useLanguage()

  usePageMeta(
    locale === 'ru' ? 'Страница не найдена — Global Tech Tour' : 'Page not found — Global Tech Tour',
    undefined,
    { noindex: true },
  )

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-[1280px] flex-col justify-center px-6 py-24">
      <p className="text-sm font-semibold uppercase tracking-[0.025em]">
        <ShimmerText variant="saffron" text="404" />
      </p>
      <h1 className="mt-4 text-[42px] font-normal leading-[1.05] tracking-[-0.04em] sm:text-[56px]">
        <RevealText text={locale === 'ru' ? 'Страница не найдена' : 'Page not found'} />
      </h1>
      <p className="mt-4 max-w-xl text-lg font-normal text-silver-mist">
        {locale === 'ru'
          ? 'Такой страницы не существует или она была перемещена.'
          : "This page doesn't exist or has been moved."}
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex w-fit items-center justify-center rounded-full bg-electric-iris px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        {locale === 'ru' ? 'На главную' : 'Back home'}
      </Link>
    </section>
  )
}

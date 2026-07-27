import { useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '@/i18n/LanguageContext'
import { ParticleCanvas } from '@/components/ParticleCanvas'
import type { ParticleCanvasHandle } from '@/components/ParticleCanvas'
import { COUNTRY_SHAPES } from '@/data/countryShapes'
import { useShapeExitNavigate } from '@/hooks/useShapeExitNavigate'
import { Placeholder } from './Placeholder'

export function CountryPreview() {
  const { locale } = useLanguage()
  const { code } = useParams<{ code: string }>()
  const canvasHandleRef = useRef<ParticleCanvasHandle>(null)
  const { goTo, isLeaving, durationMs } = useShapeExitNavigate(canvasHandleRef)

  const country = code && code !== 'cn' ? COUNTRY_SHAPES[code] : undefined

  if (!country) {
    return (
      <Placeholder
        title_ru="Страна не найдена"
        title_en="Country not found"
        note_ru="Вернитесь на главную и выберите страну ещё раз."
        note_en="Go back home and pick a country again."
      />
    )
  }

  return (
    <section className="relative min-h-[760px] overflow-hidden">
      <div className="absolute inset-0">
        <ParticleCanvas ref={canvasHandleRef} shape={country.shape} />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
          style={{
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            maskImage: 'linear-gradient(to bottom, transparent, black)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)',
          }}
        />
      </div>

      <div
        className="pointer-events-none relative z-10 mx-auto max-w-[1280px] px-6 py-16 lg:py-24"
        style={{ opacity: isLeaving ? 0 : 1, transition: `opacity ${durationMs}ms ease-in-out` }}
      >
        <Link
          to="/"
          onClick={(event) => goTo('/', event)}
          className="pointer-events-auto inline-flex items-center gap-1 text-sm text-ash-gray hover:text-bone-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          {locale === 'ru' ? 'На главную' : 'Back home'}
        </Link>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.025em] text-saffron-spark">
          {locale === 'ru' ? 'Скоро' : 'Coming soon'}
        </p>
        <h1 className="mt-3 max-w-2xl text-[42px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px] lg:text-[64px]">
          {locale === 'ru' ? country.name_ru : country.name_en}
        </h1>
        <p className="mt-6 max-w-xl text-lg font-normal text-silver-mist">
          {locale === 'ru'
            ? 'Каталог компаний и готовые экспедиции для этой страны в разработке — загляните позже.'
            : "The company catalogue and ready expeditions for this country are in the works — check back soon."}
        </p>
      </div>
    </section>
  )
}

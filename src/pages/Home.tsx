import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/i18n/LanguageContext'
import { useSelectedCountry } from '@/context/SelectedCountryContext'
import { companiesData, toursData } from '@/data'
import { COUNTRY_SHAPES } from '@/data/countryShapes'
import { ParticleCanvas } from '@/components/ParticleCanvas'
import type { ParticleCanvasHandle } from '@/components/ParticleCanvas'
import { useShapeExitNavigate } from '@/hooks/useShapeExitNavigate'

export function Home() {
  const { locale } = useLanguage()
  const { countryCode } = useSelectedCountry()
  const { counts } = companiesData.meta
  const tour = toursData.tours[0]
  const canvasHandleRef = useRef<ParticleCanvasHandle>(null)
  const { goTo, isLeaving, durationMs } = useShapeExitNavigate(canvasHandleRef)

  // Only China has a real catalogue behind it — picking any other country
  // from the selector still swaps the hero's 3D map in place (the same
  // assemble/disperse morph the shape always does), but the copy below it
  // switches to a "coming soon" message instead of the China-specific pitch.
  const country = COUNTRY_SHAPES[countryCode] ?? COUNTRY_SHAPES.cn
  const isChina = countryCode === 'cn'

  return (
    <section className="relative min-h-[920px] overflow-hidden lg:min-h-[760px]">
      <div className="absolute inset-0">
        <ParticleCanvas ref={canvasHandleRef} shape={country.shape} />
        {/* Dissolves the canvas into a blur toward the bottom instead of a hard clip,
            so the hero reads as one continuous space with the content below it. */}
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
        {isChina ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.025em] text-saffron-spark">
              {locale === 'ru' ? 'Бизнес-экспедиции в Китай и не только' : 'Business expeditions to China and beyond'}
            </p>
            <h1 className="mt-6 max-w-2xl text-[42px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px] lg:text-[64px]">
              {locale === 'ru'
                ? 'Приветствуем, какую индустрию хотели бы изучить?'
                : 'Welcome — which industry would you like to explore?'}
            </h1>
            <p className="mt-6 max-w-xl text-lg font-normal text-silver-mist">
              {locale === 'ru'
                ? 'Sinotech Voyage · by Aura Robotics — закрытые визиты на производства лидеров индустрии Китая.'
                : 'Sinotech Voyage · by Aura Robotics — private visits to the production sites of China’s industry leaders.'}
            </p>

            <div className="pointer-events-auto mt-10 flex flex-wrap gap-3">
              <Link
                to="/industries"
                onClick={(event) => goTo('/industries', event)}
                className="inline-block w-fit rounded-[24px] bg-electric-iris px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                {locale === 'ru' ? 'Каталог' : 'Catalogue'}
              </Link>
              <Link
                to="/expeditions"
                onClick={(event) => goTo('/expeditions', event)}
                className="inline-block w-fit rounded-[24px] border border-black/10 bg-surface/70 px-6 py-3 text-sm font-medium text-bone-white transition-colors hover:bg-surface"
              >
                {locale === 'ru' ? 'Готовые программы' : 'Ready-made programs'}
              </Link>
              <Link
                to="/industries"
                onClick={(event) => goTo('/industries', event)}
                className="inline-block w-fit rounded-[24px] border border-black/10 bg-surface/70 px-6 py-3 text-sm font-medium text-bone-white transition-colors hover:bg-surface"
              >
                {locale === 'ru' ? 'Собрать свою программу' : 'Build your own program'}
              </Link>
            </div>

            <dl className="mt-16 grid max-w-xl grid-cols-3 gap-8 border-t border-black/10 pt-8 text-sm text-ash-gray">
              <div>
                <dt>{locale === 'ru' ? 'компаний в каталоге' : 'companies in catalogue'}</dt>
                <dd className="mt-1 text-2xl font-semibold text-bone-white">
                  {Math.floor(counts.companies / 50) * 50}+
                </dd>
              </div>
              <div>
                <dt>{locale === 'ru' ? 'отраслей' : 'sectors'}</dt>
                <dd className="mt-1 text-2xl font-semibold text-bone-white">{counts.sectors}</dd>
              </div>
              <div>
                <dt>{locale === 'ru' ? 'готовый тур' : 'ready-made tour'}</dt>
                <dd className="mt-1 text-2xl font-semibold text-bone-white">
                  {locale === 'ru' ? tour.title_ru : tour.title_en}
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.025em] text-saffron-spark">
              {locale === 'ru' ? 'Скоро' : 'Coming soon'}
            </p>
            <h1 className="mt-6 max-w-2xl text-[42px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px] lg:text-[64px]">
              {locale === 'ru' ? country.name_ru : country.name_en}
            </h1>
            <p className="mt-6 max-w-xl text-lg font-normal text-silver-mist">
              {locale === 'ru'
                ? 'Каталог компаний и готовые экспедиции для этой страны в разработке — загляните позже.'
                : "The company catalogue and ready expeditions for this country are in the works — check back soon."}
            </p>
          </>
        )}
      </div>
    </section>
  )
}

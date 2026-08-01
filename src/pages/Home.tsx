import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/i18n/LanguageContext'
import { useSelectedCountry } from '@/context/SelectedCountryContext'
import { COUNTRY_SHAPES } from '@/data/countryShapes'
import { ParticleCanvas } from '@/components/ParticleCanvas'
import type { ParticleCanvasHandle } from '@/components/ParticleCanvas'
import { useShapeExitNavigate } from '@/hooks/useShapeExitNavigate'
import { usePageMeta } from '@/hooks/usePageMeta'
import { BrandMarquee } from '@/components/BrandMarquee'
import { ShimmerText } from '@/components/ShimmerText'

export function Home() {
  const { locale } = useLanguage()
  const { countryCode } = useSelectedCountry()
  const canvasHandleRef = useRef<ParticleCanvasHandle>(null)
  const { goTo, isLeaving, durationMs } = useShapeExitNavigate(canvasHandleRef)

  usePageMeta(
    locale === 'ru' ? 'Global Tech Tour — бизнес-экспедиции в Китай' : 'Global Tech Tour — business expeditions to China',
    locale === 'ru'
      ? 'Закрытые визиты на производства и в штаб-квартиры лидеров индустрий Китая. Более 400 компаний, 17 отраслей — прямой доступ, куда не попасть самостоятельно.'
      : "Private visits to production sites and headquarters of China's industry leaders. 400+ companies across 17 sectors — direct access you can't reach on your own.",
  )

  // The bottom pill row is stretched to match the top row's total width
  // (measured, since each pill is sized to its own text) so the two rows
  // read as one aligned block instead of a shorter loose row underneath.
  const topPillsRef = useRef<HTMLDivElement>(null)
  const [topPillsWidth, setTopPillsWidth] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = topPillsRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (width) setTopPillsWidth(width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Only China has a real catalogue behind it — picking any other country
  // from the selector still swaps the hero's 3D map in place (the same
  // assemble/disperse morph the shape always does), but the copy below it
  // switches to a "coming soon" message instead of the China-specific pitch.
  const country = COUNTRY_SHAPES[countryCode] ?? COUNTRY_SHAPES.cn
  const isChina = countryCode === 'cn'

  return (
    <>
    <section className="relative min-h-[920px] overflow-hidden lg:min-h-[760px]">
      <div className="absolute inset-0" style={{ transform: 'translateY(-57px)' }}>
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
        className="pointer-events-none relative z-10 mx-auto max-w-[1280px] px-6 pb-16 pt-[26px] lg:pb-24 lg:pt-[58px]"
        style={{ opacity: isLeaving ? 0 : 1, transition: `opacity ${durationMs}ms ease-in-out` }}
      >
        {isChina ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.025em]">
              <ShimmerText
                text={locale === 'ru' ? 'Бизнес-экспедиции в Китай и не только' : 'Business expeditions to China and beyond'}
              />
            </p>
            <h1 className="mt-6 max-w-2xl text-[42px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px] lg:text-[64px]">
              {locale === 'ru'
                ? 'А какую индустрию хотели бы изучить именно Вы?'
                : 'So which industry would you specifically like to explore?'}
            </h1>
            <p className="mt-6 max-w-xl text-lg font-normal text-silver-mist">
              {locale === 'ru'
                ? 'Полезные экспедиции, где Вы уже не просто турист, а исследователь и первооткрыватель.'
                : 'Purposeful expeditions where you’re no longer just a tourist — you’re an explorer and a pioneer.'}
            </p>

            <div ref={topPillsRef} className="pointer-events-auto mt-10 flex w-fit flex-wrap gap-3">
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

            <div
              className="pointer-events-auto mt-3 flex max-w-full gap-3"
              style={topPillsWidth ? { width: topPillsWidth } : undefined}
            >
              <Link
                to="/cases"
                onClick={(event) => goTo('/cases', event)}
                className="pill-shimmer flex flex-1 items-center justify-center rounded-[24px] border border-electric-iris/40 bg-surface/70 px-6 py-3 text-center text-sm font-medium text-bone-white transition-colors hover:bg-surface"
              >
                <span className="relative z-10">{locale === 'ru' ? 'Кейсы' : 'Cases'}</span>
              </Link>
              <Link
                to="/expeditions"
                onClick={(event) => goTo('/expeditions', event)}
                className="pill-shimmer flex flex-1 items-center justify-center rounded-[24px] border border-electric-iris/40 bg-surface/70 px-6 py-3 text-center text-sm font-medium text-bone-white transition-colors hover:bg-surface"
              >
                <span className="relative z-10">
                  {locale === 'ru' ? 'Предстоящие экспедиции' : 'Upcoming expeditions'}
                </span>
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.025em]">
              <ShimmerText variant="saffron" text={locale === 'ru' ? 'Скоро' : 'Coming soon'} />
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
    <div className="mt-[-114px]">
      <BrandMarquee />
    </div>
    </>
  )
}

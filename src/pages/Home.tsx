import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { LocaleLink } from '@/i18n/LocaleLink'
import { useLanguage } from '@/i18n/LanguageContext'
import { useSelectedCountry } from '@/context/SelectedCountryContext'
import { COUNTRY_SHAPES } from '@/data/countryShapes'
import { companiesData } from '@/data'
import { ParticleCanvas } from '@/components/ParticleCanvas'
import type { ParticleCanvasHandle } from '@/components/ParticleCanvas'
import { useShapeExitNavigate } from '@/hooks/useShapeExitNavigate'
import { usePageMeta } from '@/hooks/usePageMeta'
import { BrandMarquee } from '@/components/BrandMarquee'
import { ShimmerText } from '@/components/ShimmerText'
import { RevealText, REVEAL_WORD_STEP_MS, REVEAL_WORD_DURATION_MS } from '@/components/RevealText'
import { CountrySelector } from '@/components/CountrySelector'

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

  // Picking any country from the selector swaps the hero's 3D map in place
  // (the same assemble/disperse morph the shape always does). Countries with
  // a real catalogue behind them (companiesData.countries[].active) get the
  // full pitch + button row below, scoped to that country everywhere it
  // matters (BrandMarquee, ExpeditionsReady); everyone else still gets a
  // "coming soon" placeholder instead.
  const country = COUNTRY_SHAPES[countryCode] ?? COUNTRY_SHAPES.cn
  const isActive = companiesData.countries.find((c) => c.code === countryCode)?.active ?? false
  const eyebrowRu =
    countryCode === 'cn'
      ? 'Бизнес-экспедиции в Китай и не только'
      : `Бизнес-экспедиции ${country.preposition_ru} ${country.accusative_ru}`
  const eyebrowEn = countryCode === 'cn' ? 'Business expeditions to China and beyond' : `Business expeditions to ${country.name_en}`

  const headlineRu = 'А какую индустрию хотели бы изучить именно Вы?'
  const headlineEn = 'So which industry would you specifically like to explore?'
  const headlineText = isActive
    ? locale === 'ru'
      ? headlineRu
      : headlineEn
    : locale === 'ru'
      ? country.name_ru
      : country.name_en
  const headlineWordCount = headlineText.split(/\s+/).filter(Boolean).length
  const subtitleStartDelayMs = headlineWordCount * REVEAL_WORD_STEP_MS

  // The hero's 3D map only mounts (and starts its own scatter->assemble
  // animation, see ParticleFieldEngine) once the headline has finished its
  // word-by-word reveal — so on first load it reads as "text settles, then
  // the map assembles", not both firing at once. Runs once per mount.
  const [mapReady, setMapReady] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMapReady(true)
      return
    }
    const timer = setTimeout(
      () => setMapReady(true),
      headlineWordCount * REVEAL_WORD_STEP_MS + REVEAL_WORD_DURATION_MS * 0.3,
    )
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
    <section className="relative min-h-[920px] overflow-hidden lg:min-h-[760px]">
      <div className="absolute inset-0" style={{ transform: 'translateY(-57px)' }}>
        <div
          className="h-full w-full"
          style={{ opacity: mapReady ? 1 : 0, transition: 'opacity 900ms ease-out' }}
        >
          {mapReady && <ParticleCanvas ref={canvasHandleRef} shape={country.shape} />}
        </div>
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
        {isActive ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.025em]">
              <ShimmerText text={locale === 'ru' ? eyebrowRu : eyebrowEn} />
            </p>
            <h1 className="mt-6 max-w-2xl text-[42px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px] lg:text-[64px]">
              <RevealText text={headlineText} />
            </h1>
            <p className="mt-6 max-w-xl text-lg font-normal text-silver-mist">
              <RevealText
                startDelayMs={subtitleStartDelayMs}
                text={
                  locale === 'ru'
                    ? 'Полезные экспедиции, где Вы уже не просто турист, а исследователь и первооткрыватель.'
                    : 'Purposeful expeditions where you’re no longer just a tourist — you’re an explorer and a pioneer.'
                }
              />
            </p>

            {/* Below sm, a plain single-column stack reads far cleaner than the
                desktop two-row layout wrapping unevenly across 5 buttons of
                different widths. */}
            <div className="pointer-events-auto mt-10 flex flex-col gap-3 sm:hidden">
              <LocaleLink
                to="/industries"
                onClick={(event) => goTo('/industries', event)}
                className="w-full rounded-[24px] bg-electric-iris px-6 py-3 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                {locale === 'ru' ? 'Каталог' : 'Catalogue'}
              </LocaleLink>
              <LocaleLink
                to="/expeditions"
                onClick={(event) => goTo('/expeditions', event)}
                className="w-full rounded-[24px] border border-black/10 bg-surface/70 px-6 py-3 text-center text-sm font-medium text-bone-white transition-colors hover:bg-surface"
              >
                {locale === 'ru' ? 'Готовые программы' : 'Ready-made programs'}
              </LocaleLink>
              <LocaleLink
                to="/industries"
                onClick={(event) => goTo('/industries', event)}
                className="w-full rounded-[24px] border border-black/10 bg-surface/70 px-6 py-3 text-center text-sm font-medium text-bone-white transition-colors hover:bg-surface"
              >
                {locale === 'ru' ? 'Собрать свою программу' : 'Build your own program'}
              </LocaleLink>
              <LocaleLink
                to="/cases"
                onClick={(event) => goTo('/cases', event)}
                className="pill-shimmer relative w-full rounded-[24px] border border-electric-iris/40 bg-surface/70 px-6 py-3 text-center text-sm font-medium text-bone-white transition-colors hover:bg-surface"
              >
                <span className="relative z-10">{locale === 'ru' ? 'Кейсы' : 'Cases'}</span>
              </LocaleLink>
              <LocaleLink
                to="/expeditions"
                onClick={(event) => goTo('/expeditions', event)}
                className="pill-shimmer relative w-full rounded-[24px] border border-electric-iris/40 bg-surface/70 px-6 py-3 text-center text-sm font-medium text-bone-white transition-colors hover:bg-surface"
              >
                <span className="relative z-10">
                  {locale === 'ru' ? 'Предстоящие экспедиции' : 'Upcoming expeditions'}
                </span>
              </LocaleLink>
              <CountrySelector variant="hero" className="w-full" />
            </div>

            <div ref={topPillsRef} className="pointer-events-auto mt-10 hidden w-fit flex-wrap gap-3 sm:flex">
              <LocaleLink
                to="/industries"
                onClick={(event) => goTo('/industries', event)}
                className="inline-block w-fit rounded-[24px] bg-electric-iris px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                {locale === 'ru' ? 'Каталог' : 'Catalogue'}
              </LocaleLink>
              <LocaleLink
                to="/expeditions"
                onClick={(event) => goTo('/expeditions', event)}
                className="inline-block w-fit rounded-[24px] border border-black/10 bg-surface/70 px-6 py-3 text-sm font-medium text-bone-white transition-colors hover:bg-surface"
              >
                {locale === 'ru' ? 'Готовые программы' : 'Ready-made programs'}
              </LocaleLink>
              <LocaleLink
                to="/industries"
                onClick={(event) => goTo('/industries', event)}
                className="inline-block w-fit rounded-[24px] border border-black/10 bg-surface/70 px-6 py-3 text-sm font-medium text-bone-white transition-colors hover:bg-surface"
              >
                {locale === 'ru' ? 'Собрать свою программу' : 'Build your own program'}
              </LocaleLink>
            </div>

            {/* Grid, not flex, for the three equal-width pills below: a flex
                row gives each item's own min-content an implicit floor, so
                unevenly-sized labels (a two-word pill vs a short country
                name) end up unequal widths even with flex-1 on all three.
                grid-cols-3 uses minmax(0,1fr) tracks, which ignores content
                size entirely and always splits the row into three equal
                columns. */}
            <div
              className="pointer-events-auto mt-3 hidden max-w-full grid-cols-3 gap-3 sm:grid"
              style={topPillsWidth ? { width: topPillsWidth } : undefined}
            >
              <LocaleLink
                to="/cases"
                onClick={(event) => goTo('/cases', event)}
                className="pill-shimmer flex items-center justify-center rounded-[24px] border border-electric-iris/40 bg-surface/70 px-6 py-3 text-center text-sm font-medium text-bone-white transition-colors hover:bg-surface"
              >
                <span className="relative z-10">{locale === 'ru' ? 'Кейсы' : 'Cases'}</span>
              </LocaleLink>
              <LocaleLink
                to="/expeditions"
                onClick={(event) => goTo('/expeditions', event)}
                className="pill-shimmer flex items-center justify-center rounded-[24px] border border-electric-iris/40 bg-surface/70 px-6 py-3 text-center text-sm font-medium text-bone-white transition-colors hover:bg-surface"
              >
                <span className="relative z-10">
                  {locale === 'ru' ? 'Предстоящие экспедиции' : 'Upcoming expeditions'}
                </span>
              </LocaleLink>
              <CountrySelector variant="hero" className="w-full" />
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.025em]">
              <ShimmerText variant="saffron" text={locale === 'ru' ? 'Скоро' : 'Coming soon'} />
            </p>
            <h1 className="mt-6 max-w-2xl text-[42px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px] lg:text-[64px]">
              <RevealText text={headlineText} />
            </h1>
            <p className="mt-6 max-w-xl text-lg font-normal text-silver-mist">
              <RevealText
                startDelayMs={subtitleStartDelayMs}
                text={
                  locale === 'ru'
                    ? 'Каталог компаний и готовые экспедиции для этой страны в разработке — загляните позже.'
                    : "The company catalogue and ready expeditions for this country are in the works — check back soon."
                }
              />
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

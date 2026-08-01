import { useRef } from 'react'
import { useLanguage } from '@/i18n/LanguageContext'
import { ParticleCanvas } from '@/components/ParticleCanvas'
import type { ParticleCanvasHandle } from '@/components/ParticleCanvas'
import { ExpeditionsTabs } from '@/components/ExpeditionsTabs'
import { useShapeExitNavigate } from '@/hooks/useShapeExitNavigate'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ShimmerText } from '@/components/ShimmerText'

export function ExpeditionsRecommended() {
  const { locale } = useLanguage()
  const canvasHandleRef = useRef<ParticleCanvasHandle>(null)
  const { goTo, isLeaving, durationMs } = useShapeExitNavigate(canvasHandleRef)

  usePageMeta(
    locale === 'ru' ? 'Рекомендуемые экспедиции — Global Tech Tour' : 'Recommended expeditions — Global Tech Tour',
    locale === 'ru'
      ? 'Подборка рекомендуемых бизнес-экспедиций в Китай под разные задачи и отрасли.'
      : 'A curated selection of recommended business expeditions to China for different goals and sectors.',
  )

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[820px] lg:h-[720px]">
        <ParticleCanvas ref={canvasHandleRef} shape="china" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, transparent 35%, var(--color-void) 92%, var(--color-void) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 pb-24 lg:pt-20">
        <div
          className="pointer-events-none"
          style={{ opacity: isLeaving ? 0 : 1, transition: `opacity ${durationMs}ms ease-in-out` }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.025em]">
            <ShimmerText variant="saffron" text={locale === 'ru' ? 'Каталог' : 'Catalog'} />
          </p>
          <h1 className="mt-6 max-w-2xl text-[36px] font-normal leading-[1.05] tracking-[-0.04em] sm:text-[48px] lg:text-[56px]">
            {locale === 'ru' ? 'Экспедиции' : 'Expeditions'}
          </h1>
          <p className="mt-4 max-w-xl text-lg font-normal text-silver-mist">
            {locale === 'ru'
              ? 'Курируемые программы по приоритетным нишам — маршрут, компании и логистика уже собраны.'
              : 'Curated programs for priority niches — route, companies, and logistics already assembled.'}
          </p>
        </div>

        <div className="pointer-events-auto mt-9">
          <ExpeditionsTabs onCustom={(event) => goTo('/industries', event)} />
        </div>

        <div className="mt-9 rounded-2xl border border-dashed border-black/15 bg-surface/50 p-10 text-center backdrop-blur-sm">
          <p className="text-lg font-medium text-bone-white">
            {locale === 'ru' ? 'Рекомендуемые предложения скоро появятся' : 'Recommended offers are coming soon'}
          </p>
          <p className="mt-2 text-sm text-silver-mist">
            {locale === 'ru'
              ? 'Мы готовим подборку кураторских программ — загляните сюда позже.'
              : "We're putting together a curated selection — check back here soon."}
          </p>
        </div>
      </div>
    </section>
  )
}

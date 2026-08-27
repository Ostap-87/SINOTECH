import { usePageMeta } from '@/hooks/usePageMeta'
import { ShimmerText } from '@/components/ShimmerText'
import { RevealText } from '@/components/RevealText'
import { LocaleLink } from '@/i18n/LocaleLink'
import { useLanguage } from '@/i18n/LanguageContext'
import { corporatePrograms, HUB_FAQ, WHY_US_POINTS, WHY_US_POINTS_EN } from '@/data/corporateTraining'
import { materials } from '@/data/materials'
import { ProgramCard } from '@/components/corporate-training/ProgramCard'
import { MaterialCard } from '@/components/corporate-training/MaterialCard'
import { PlaceholderText } from '@/components/corporate-training/PlaceholderText'

export function CorporateTrainingHub() {
  const { locale } = useLanguage()

  usePageMeta(
    locale === 'ru'
      ? 'Корпоративное обучение в Китае — туры на Huawei, Alibaba — Global Tech Tour'
      : 'Corporate Training in China — Tours to Huawei, Alibaba — Global Tech Tour',
    locale === 'ru'
      ? 'Трёхдневные интенсивы на площадках Huawei, Alibaba, Xiaomi, Haier, ByteDance, Ping An. Перевод, визы, логистика — под ключ.'
      : 'Three-day intensives at Huawei, Alibaba, Xiaomi, Haier, ByteDance and Ping An. Interpreting, visas, logistics — turnkey.',
  )

  const whyUsPoints = locale === 'ru' ? WHY_US_POINTS : WHY_US_POINTS_EN

  return (
    <section className="mx-auto w-full max-w-[1280px] px-6 py-16 lg:py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.025em]">
        <ShimmerText variant="saffron" text={locale === 'ru' ? 'Корпоративное обучение' : 'Corporate training'} />
      </p>
      <h1 className="mt-6 max-w-3xl text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[44px] lg:text-[52px]">
        <RevealText text={locale === 'ru' ? 'Учитесь у тех, кто уже построил будущее' : 'Learn from those who already built the future'} />
      </h1>
      <p className="mt-6 max-w-2xl text-lg font-normal text-silver-mist">
        {locale === 'ru'
          ? 'Трёхдневные интенсивы на площадках компаний-лидеров рынка Китая — Huawei, Alibaba, Xiaomi, Haier, ByteDance, Ping An. Стратегия, цифровизация, управление — из первых рук, с переводом и полным сопровождением.'
          : "Three-day intensives at the campuses of China's market-leading companies — Huawei, Alibaba, Xiaomi, Haier, ByteDance, Ping An. Strategy, digitalisation and management straight from the source, with interpreting and full support."}
      </p>
      <p className="mt-6 max-w-3xl text-base text-silver-mist">
        {locale === 'ru'
          ? 'Мы организуем точечные обучающие интенсивы в Китай для руководителей и управленческих команд: три дня полного погружения в управленческую модель одной компании-эталона — посещение кампуса, разбор конкретных инструментов и кейсов, тематические тренинги по ключевым модулям. Попадание внутрь компаний, которые обычно закрыты для внешних визитов, — с переводчиками-отраслевиками и полным сопровождением от визы до логистики.'
          : "We organise focused training intensives in China for executives and management teams: three days of full immersion in the management model of one benchmark company — a campus visit, a breakdown of specific tools and cases, and themed workshops on the key modules. Access inside companies that are normally closed to outside visitors — with industry-specialist interpreters and full support from visa to logistics."}
      </p>

      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {corporatePrograms.map((program) => (
          <ProgramCard key={program.slug} program={program} />
        ))}
      </div>

      {/* Materials & methodology — a tab/section within this hub page, not a
          separate top-level nav item (see Stage 4.5). */}
      <div id="materials" className="mt-20 scroll-mt-24 rounded-2xl border border-black/10 bg-surface/60 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.025em] text-ash-gray">
              {locale === 'ru' ? 'Подраздел' : 'Subsection'}
            </h2>
            <p className="mt-1 text-2xl font-semibold text-bone-white">
              {locale === 'ru' ? 'Материалы и методология' : 'Materials and methodology'}
            </p>
            <p className="mt-2 max-w-2xl text-sm text-silver-mist">
              {locale === 'ru'
                ? 'Методические материалы о том, как строить программу поездки по отрасли, когда одну индустрию нельзя охватить за один визит — и её стоит покрывать через несколько отдельных поездок по разным секторам.'
                : 'Methodology materials on how to plan an industry trip when one visit cannot cover a whole industry — and it makes more sense to cover it through several separate trips across different sectors.'}
            </p>
          </div>
          <LocaleLink
            to="/corporate-training/materials"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-electric-iris px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {locale === 'ru' ? 'Все материалы' : 'All materials'}
          </LocaleLink>
        </div>

        {materials.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {materials.slice(0, 3).map((material) => (
              <MaterialCard key={material.slug} material={material} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {whyUsPoints.map((point, i) => (
          <div key={i} className="rounded-2xl border border-black/10 bg-surface/60 p-6">
            <p className="text-sm text-bone-white">{point}</p>
          </div>
        ))}
      </div>

      <div className="mt-20">
        <h2 className="text-2xl font-semibold text-bone-white">{locale === 'ru' ? 'Частые вопросы' : 'Frequently asked questions'}</h2>
        <div className="mt-6 flex flex-col gap-4">
          {HUB_FAQ.map((item, i) => (
            <div key={i} className="rounded-2xl border border-black/10 bg-surface/60 p-5">
              <p className="text-sm font-semibold text-bone-white">{locale === 'ru' ? item.question : item.question_en}</p>
              <p className="mt-2 text-sm text-silver-mist">
                <PlaceholderText text={locale === 'ru' ? item.answer : item.answer_en} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

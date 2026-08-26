import { usePageMeta } from '@/hooks/usePageMeta'
import { ShimmerText } from '@/components/ShimmerText'
import { RevealText } from '@/components/RevealText'
import { LocaleLink } from '@/i18n/LocaleLink'
import { corporatePrograms, HUB_FAQ, WHY_US_POINTS } from '@/data/corporateTraining'
import { materials } from '@/data/materials'
import { ProgramCard } from '@/components/corporate-training/ProgramCard'
import { MaterialCard } from '@/components/corporate-training/MaterialCard'
import { PlaceholderText } from '@/components/corporate-training/PlaceholderText'

export function CorporateTrainingHub() {
  usePageMeta(
    'Корпоративное обучение в Китае — туры на Huawei, Alibaba — Global Tech Tour',
    'Трёхдневные интенсивы на площадках Huawei, Alibaba, Xiaomi, Haier, ByteDance, Ping An. Перевод, визы, логистика — под ключ.',
  )

  return (
    <section className="mx-auto w-full max-w-[1280px] px-6 py-16 lg:py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.025em]">
        <ShimmerText variant="saffron" text="Корпоративное обучение" />
      </p>
      <h1 className="mt-6 max-w-3xl text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[44px] lg:text-[52px]">
        <RevealText text="Учитесь у тех, кто уже построил будущее" />
      </h1>
      <p className="mt-6 max-w-2xl text-lg font-normal text-silver-mist">
        Трёхдневные интенсивы на площадках компаний-лидеров рынка Китая — Huawei, Alibaba, Xiaomi, Haier, ByteDance,
        Ping An. Стратегия, цифровизация, управление — из первых рук, с переводом и полным сопровождением.
      </p>
      <p className="mt-6 max-w-3xl text-base text-silver-mist">
        Мы организуем точечные обучающие интенсивы в Китай для руководителей и управленческих команд: три дня
        полного погружения в управленческую модель одной компании-эталона — посещение кампуса, разбор конкретных
        инструментов и кейсов, тематические тренинги по ключевым модулям. Попадание внутрь компаний, которые обычно
        закрыты для внешних визитов, — с переводчиками-отраслевиками и полным сопровождением от визы до логистики.
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
            <h2 className="text-sm font-semibold uppercase tracking-[0.025em] text-ash-gray">Подраздел</h2>
            <p className="mt-1 text-2xl font-semibold text-bone-white">Материалы и методология</p>
            <p className="mt-2 max-w-2xl text-sm text-silver-mist">
              Методические материалы о том, как строить программу поездки по отрасли, когда одну индустрию нельзя
              охватить за один визит — и её стоит покрывать через несколько отдельных поездок по разным секторам.
            </p>
          </div>
          <LocaleLink
            to="/corporate-training/materials"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-electric-iris px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Все материалы
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
        {WHY_US_POINTS.map((point, i) => (
          <div key={i} className="rounded-2xl border border-black/10 bg-surface/60 p-6">
            <p className="text-sm text-bone-white">{point}</p>
          </div>
        ))}
      </div>

      <div className="mt-20">
        <h2 className="text-2xl font-semibold text-bone-white">Частые вопросы</h2>
        <div className="mt-6 flex flex-col gap-4">
          {HUB_FAQ.map((item, i) => (
            <div key={i} className="rounded-2xl border border-black/10 bg-surface/60 p-5">
              <p className="text-sm font-semibold text-bone-white">{item.question}</p>
              <p className="mt-2 text-sm text-silver-mist">
                <PlaceholderText text={item.answer} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

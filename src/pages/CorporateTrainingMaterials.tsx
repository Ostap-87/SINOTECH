import { usePageMeta } from '@/hooks/usePageMeta'
import { ShimmerText } from '@/components/ShimmerText'
import { RevealText } from '@/components/RevealText'
import { LocaleLink } from '@/i18n/LocaleLink'
import { materials } from '@/data/materials'
import { MaterialCard } from '@/components/corporate-training/MaterialCard'

export function CorporateTrainingMaterials() {
  usePageMeta(
    'Материалы и методология — Корпоративное обучение — Global Tech Tour',
    'Методические материалы о том, как строить программу поездки по отрасли, когда одну индустрию нужно покрывать через несколько отдельных визитов.',
  )

  return (
    <section className="mx-auto w-full max-w-[1280px] px-6 py-16 lg:py-20">
      <LocaleLink
        to="/corporate-training"
        className="inline-flex items-center gap-1 text-sm text-ash-gray hover:text-bone-white"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        Корпоративное обучение
      </LocaleLink>

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.025em]">
        <ShimmerText variant="saffron" text="Подраздел" />
      </p>
      <h1 className="mt-4 max-w-2xl text-[36px] font-normal leading-[1.1] tracking-[-0.03em] sm:text-[48px]">
        <RevealText text="Материалы и методология" />
      </h1>
      <p className="mt-6 max-w-2xl text-lg font-normal text-silver-mist">
        Как строить программу поездки по отрасли, когда одну индустрию нельзя охватить за один визит — и её
        логичнее показывать через несколько отдельных поездок по разным секторам.
      </p>

      {materials.length === 0 ? (
        <div className="mt-14 rounded-2xl border border-black/10 bg-surface/60 p-10 text-center">
          <p className="text-lg font-medium text-bone-white">Материалы скоро появятся</p>
          <p className="mt-2 text-sm text-silver-mist">
            Мы готовим первые методические материалы — загляните сюда чуть позже.
          </p>
        </div>
      ) : (
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <MaterialCard key={material.slug} material={material} />
          ))}
        </div>
      )}
    </section>
  )
}

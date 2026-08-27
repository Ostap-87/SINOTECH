import { usePageMeta } from '@/hooks/usePageMeta'
import { ShimmerText } from '@/components/ShimmerText'
import { RevealText } from '@/components/RevealText'
import { LocaleLink } from '@/i18n/LocaleLink'
import { useLanguage } from '@/i18n/LanguageContext'
import { materials } from '@/data/materials'
import { MaterialCard } from '@/components/corporate-training/MaterialCard'

export function CorporateTrainingMaterials() {
  const { locale } = useLanguage()

  usePageMeta(
    locale === 'ru'
      ? 'Материалы и методология — Корпоративное обучение — Global Tech Tour'
      : 'Materials and Methodology — Corporate Training — Global Tech Tour',
    locale === 'ru'
      ? 'Методические материалы о том, как строить программу поездки по отрасли, когда одну индустрию нужно покрывать через несколько отдельных визитов.'
      : 'Methodology materials on how to plan an industry trip when one industry needs to be covered through several separate visits.',
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
        {locale === 'ru' ? 'Корпоративное обучение' : 'Corporate training'}
      </LocaleLink>

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.025em]">
        <ShimmerText variant="saffron" text={locale === 'ru' ? 'Подраздел' : 'Subsection'} />
      </p>
      <h1 className="mt-4 max-w-2xl text-[36px] font-normal leading-[1.1] tracking-[-0.03em] sm:text-[48px]">
        <RevealText text={locale === 'ru' ? 'Материалы и методология' : 'Materials and methodology'} />
      </h1>
      <p className="mt-6 max-w-2xl text-lg font-normal text-silver-mist">
        {locale === 'ru'
          ? 'Как строить программу поездки по отрасли, когда одну индустрию нельзя охватить за один визит — и её логичнее показывать через несколько отдельных поездок по разным секторам.'
          : 'How to plan an industry trip when one industry cannot be covered in a single visit — and it makes more sense to show it through several separate trips across different sectors.'}
      </p>

      {materials.length === 0 ? (
        <div className="mt-14 rounded-2xl border border-black/10 bg-surface/60 p-10 text-center">
          <p className="text-lg font-medium text-bone-white">
            {locale === 'ru' ? 'Материалы скоро появятся' : 'Materials are coming soon'}
          </p>
          <p className="mt-2 text-sm text-silver-mist">
            {locale === 'ru'
              ? 'Мы готовим первые методические материалы — загляните сюда чуть позже.'
              : "We're preparing the first methodology materials — check back a little later."}
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

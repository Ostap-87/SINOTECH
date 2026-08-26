import { useParams } from 'react-router-dom'
import { usePageMeta } from '@/hooks/usePageMeta'
import { RevealText } from '@/components/RevealText'
import { LocaleLink } from '@/i18n/LocaleLink'
import { getMaterial } from '@/data/materials'
import { materialCoverPath } from '@/data/corporateTrainingImages'
import { StaticImage } from '@/components/corporate-training/StaticImage'
import { MaterialBody } from '@/components/corporate-training/MaterialBody'
import { Placeholder } from './Placeholder'

export function CorporateTrainingMaterialDetail() {
  const { slug } = useParams<{ slug: string }>()
  const material = slug ? getMaterial(slug) : undefined

  usePageMeta(`${material?.title ?? 'Материал'} — Материалы и методология — Global Tech Tour`, material?.intro, {
    noindex: !material,
  })

  if (!material) {
    return (
      <Placeholder
        title_ru="Материал не найден"
        title_en="Material not found"
        note_ru="Вернитесь к списку материалов и выберите ещё раз."
        note_en="Go back to the materials list and pick again."
      />
    )
  }

  return (
    <section className="mx-auto w-full max-w-[760px] px-6 py-16 lg:py-20">
      <LocaleLink
        to="/corporate-training/materials"
        className="inline-flex items-center gap-1 text-sm text-ash-gray hover:text-bone-white"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        Материалы и методология
      </LocaleLink>

      {material.industryTag && (
        <span className="mt-6 inline-block w-fit rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-ash-gray">
          {material.industryTag}
        </span>
      )}

      <h1 className="mt-4 text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-bone-white sm:text-[36px]">
        <RevealText text={material.title} />
      </h1>
      <p className="mt-5 text-lg text-silver-mist">{material.intro}</p>

      <StaticImage
        src={material.cover ?? materialCoverPath(material.slug)}
        alt={material.title}
        placeholderLabel="Обложка скоро появится"
        className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover"
      />

      <MaterialBody blocks={material.body} />
    </section>
  )
}

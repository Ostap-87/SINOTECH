import { useParams } from 'react-router-dom'
import { usePageMeta } from '@/hooks/usePageMeta'
import { RevealText } from '@/components/RevealText'
import { LocaleLink } from '@/i18n/LocaleLink'
import { useLanguage } from '@/i18n/LanguageContext'
import { getMaterial } from '@/data/materials'
import { materialCoverPath } from '@/data/corporateTrainingImages'
import { StaticImage } from '@/components/corporate-training/StaticImage'
import { MaterialBody } from '@/components/corporate-training/MaterialBody'
import { Placeholder } from './Placeholder'

export function CorporateTrainingMaterialDetail() {
  const { locale } = useLanguage()
  const { slug } = useParams<{ slug: string }>()
  const material = slug ? getMaterial(slug) : undefined

  const title = material ? (locale === 'ru' ? material.title : (material.title_en ?? material.title)) : undefined
  const intro = material ? (locale === 'ru' ? material.intro : (material.intro_en ?? material.intro)) : undefined
  const industryTag = material
    ? locale === 'ru'
      ? material.industryTag
      : (material.industryTag_en ?? material.industryTag)
    : undefined

  usePageMeta(
    `${title ?? (locale === 'ru' ? 'Материал' : 'Material')} — ${
      locale === 'ru' ? 'Материалы и методология' : 'Materials and methodology'
    } — Global Tech Tour`,
    intro,
    { noindex: !material },
  )

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
        {locale === 'ru' ? 'Материалы и методология' : 'Materials and methodology'}
      </LocaleLink>

      {industryTag && (
        <span className="mt-6 inline-block w-fit rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-ash-gray">
          {industryTag}
        </span>
      )}

      <h1 className="mt-4 text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-bone-white sm:text-[36px]">
        <RevealText text={title ?? ''} />
      </h1>
      <p className="mt-5 text-lg text-silver-mist">{intro}</p>

      <StaticImage
        src={material.cover ?? materialCoverPath(material.slug)}
        alt={title ?? ''}
        placeholderLabel={locale === 'ru' ? 'Обложка скоро появится' : 'Cover coming soon'}
        className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover"
      />

      <MaterialBody blocks={material.body} />
    </section>
  )
}

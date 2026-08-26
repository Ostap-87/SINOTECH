import { LocaleLink } from '@/i18n/LocaleLink'
import type { Material } from '@/data/materials'
import { materialCoverPath } from '@/data/corporateTrainingImages'
import { StaticImage } from './StaticImage'

export function MaterialCard({ material }: { material: Material }) {
  return (
    <LocaleLink
      to={`/corporate-training/materials/${material.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-surface/60 transition-colors hover:border-electric-iris/60"
    >
      <StaticImage
        src={material.cover ?? materialCoverPath(material.slug)}
        alt={material.title}
        placeholderLabel="Обложка скоро появится"
        className="aspect-[16/9] w-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        {material.industryTag && (
          <span className="w-fit rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-ash-gray">
            {material.industryTag}
          </span>
        )}
        <h3 className="text-lg font-semibold text-bone-white">{material.title}</h3>
        <p className="text-sm text-silver-mist">{material.intro}</p>
        <span className="mt-auto pt-2 text-sm font-medium text-electric-iris group-hover:underline">Читать →</span>
      </div>
    </LocaleLink>
  )
}

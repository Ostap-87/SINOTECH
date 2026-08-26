import { LocaleLink } from '@/i18n/LocaleLink'
import type { CorporateProgram } from '@/data/corporateTraining'
import { companiesData } from '@/data'
import { CompanyMark } from '@/components/CompanyMark'
import { heroImagePath } from '@/data/corporateTrainingImages'
import { StaticImage } from './StaticImage'

/** One of the six programme cards on the /corporate-training/ hub. */
export function ProgramCard({ program }: { program: CorporateProgram }) {
  const company = companiesData.companies.find((c) => c.id === program.companyId)

  return (
    <LocaleLink
      to={`/corporate-training/${program.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-surface/60 transition-colors hover:border-electric-iris/60"
    >
      <StaticImage
        src={heroImagePath(program.slug)}
        alt={program.heroAlt}
        placeholderContent={
          company && (
            <div className="flex h-full w-full items-center justify-center p-6">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={`${company.name_en} logo`}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <CompanyMark company={company} size={64} />
              )}
            </div>
          )
        }
        className="aspect-[16/9] w-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.02em] text-ash-gray">
          {company?.name_en ?? program.companyId}
        </p>
        <h3 className="text-lg font-semibold text-bone-white">{program.cardTitle}</h3>
        <p className="text-sm text-silver-mist">{program.cardTeaser}</p>
        <span className="mt-auto pt-2 text-sm font-medium text-electric-iris group-hover:underline">
          Подробнее о программе →
        </span>
      </div>
    </LocaleLink>
  )
}

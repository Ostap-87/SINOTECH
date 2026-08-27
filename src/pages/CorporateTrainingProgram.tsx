import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ShimmerText } from '@/components/ShimmerText'
import { RevealText } from '@/components/RevealText'
import { LocaleLink } from '@/i18n/LocaleLink'
import { useLanguage } from '@/i18n/LanguageContext'
import { getCorporateProgram } from '@/data/corporateTraining'
import { companiesData, companyNameZh } from '@/data'
import { heroImagePath, galleryImagePaths, SHOW_PHOTO_GALLERY } from '@/data/corporateTrainingImages'
import { StaticImage } from '@/components/corporate-training/StaticImage'
import { CompanyMark } from '@/components/CompanyMark'
import { CourseModuleMap } from '@/components/corporate-training/CourseModuleMap'
import { ApplicationForm } from '@/components/corporate-training/ApplicationForm'
import { ProgramGallery } from '@/components/corporate-training/ProgramGallery'
import { PlaceholderText } from '@/components/corporate-training/PlaceholderText'
import { Placeholder } from './Placeholder'

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = []
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size))
  return rows
}

export function CorporateTrainingProgram() {
  const { locale } = useLanguage()
  const { company: slug } = useParams<{ company: string }>()
  const program = slug ? getCorporateProgram(slug) : undefined
  const company = program ? companiesData.companies.find((c) => c.id === program.companyId) : undefined
  const [heroPhotoMissing, setHeroPhotoMissing] = useState(false)

  const metaTitle = program ? (locale === 'ru' ? program.metaTitle : program.metaTitle_en) : locale === 'ru' ? 'Программа' : 'Programme'
  const metaDescription = program ? (locale === 'ru' ? program.metaDescription : program.metaDescription_en) : undefined

  usePageMeta(`${metaTitle} — Global Tech Tour`, metaDescription, {
    noindex: !program,
  })

  if (!program) {
    return (
      <Placeholder
        title_ru="Программа не найдена"
        title_en="Program not found"
        note_ru="Вернитесь в раздел «Корпоративное обучение» и выберите программу ещё раз."
        note_en="Go back to Corporate training and pick a program again."
      />
    )
  }

  return (
    <section className="mx-auto w-full max-w-[900px] px-6 py-16 lg:py-20">
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
        <ShimmerText variant="saffron" text={locale === 'ru' ? program.cardTitle : program.cardTitle_en} />
      </p>
      <h1 className="mt-4 text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-bone-white sm:text-[40px] lg:text-[46px]">
        <RevealText text={locale === 'ru' ? program.h1 : program.h1_en} />
      </h1>
      <p className="mt-6 text-lg text-silver-mist">{locale === 'ru' ? program.subtitle : program.subtitle_en}</p>

      <div className="relative mt-6">
        <StaticImage
          src={heroImagePath(program.slug)}
          alt={locale === 'ru' ? program.heroAlt : program.heroAlt_en}
          onFailedChange={setHeroPhotoMissing}
          placeholderContent={
            company && (
              <div className="flex h-full w-full items-center justify-center p-3 sm:p-4">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={`${company.name_en} logo`}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <CompanyMark company={company} size={320} />
                )}
              </div>
            )
          }
          className={`w-full rounded-2xl object-cover ${heroPhotoMissing ? 'aspect-[3/1]' : 'aspect-[16/9]'}`}
        />
        {company && !heroPhotoMissing && (
          <div className="absolute bottom-4 left-4 shadow-sm">
            <CompanyMark company={company} size={64} />
          </div>
        )}
      </div>

      {/* Почему эта компания */}
      <div className="mt-6 rounded-2xl border border-black/10 bg-surface/60 p-6 sm:p-8">
        <h2 className="text-center text-sm font-semibold uppercase tracking-[0.025em] text-ash-gray">
          {locale === 'ru' ? 'Почему' : 'Why'} {company ? companyNameZh(company) : program.companyId}
        </h2>
        <ul className="mt-4 flex flex-col gap-2.5">
          {(locale === 'ru' ? program.whyPoints : program.whyPoints_en).map((point, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-bone-white">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-electric-iris" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
        {company && (
          <LocaleLink
            to={`/companies/${company.id}`}
            className="mt-5 inline-block text-sm font-medium text-electric-iris hover:underline"
          >
            {locale === 'ru' ? 'Подробнее о компании →' : 'More about the company →'}
          </LocaleLink>
        )}
      </div>

      {/* Визуальная схема модулей курса — сразу после "Почему эта компания",
          перед текстовыми "Модули курса" / "Программа по дням" (Stage 2.1). */}
      <div className="mt-14">
        <h2 className="text-center text-2xl font-semibold text-bone-white">
          {locale === 'ru' ? 'Как устроена программа' : 'How the programme is structured'}
        </h2>
        <div className="mt-6">
          <CourseModuleMap
            programTitle={`${company?.name_en ?? program.companyId} — ${locale === 'ru' ? program.cardTitle : program.cardTitle_en}`}
            modules={program.modules}
          />
        </div>
      </div>

      {/* Модули курса — текстом, плитки одинакового размера, максимум 3 в
          ряд (тот же паттерн раскладки, что и у визуальной схемы выше:
          5 модулей → 3+2 центрированный второй ряд, 6 → 3+3). */}
      <div className="mt-14">
        <h2 className="text-center text-2xl font-semibold text-bone-white">
          {locale === 'ru' ? 'Модули курса' : 'Course modules'}
        </h2>
        <div className="mt-6 flex flex-col gap-5">
          {chunk(program.modules, 3).map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`flex flex-col gap-5 sm:flex-row ${row.length < 3 ? 'sm:justify-center' : ''}`}
            >
              {row.map((mod, i) => (
                <div
                  key={mod.id}
                  className="flex flex-1 flex-col items-center rounded-2xl border border-black/10 bg-surface/60 p-5 text-center sm:max-w-[340px]"
                >
                  <p className="text-sm font-semibold text-ash-gray">
                    {locale === 'ru' ? 'Модуль' : 'Module'} {rowIndex * 3 + i + 1}
                  </p>
                  <p className="mt-1 text-base font-semibold text-bone-white">{locale === 'ru' ? mod.title : mod.title_en}</p>
                  <p className="mt-1.5 text-sm text-silver-mist">{locale === 'ru' ? mod.description : mod.description_en}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Пример программы */}
      <div className="mt-14">
        <h2 className="text-center text-2xl font-semibold text-bone-white">
          {locale === 'ru' ? 'Пример программы' : 'Sample schedule'}
        </h2>
        <div className="mt-6 flex flex-col gap-5">
          {program.days.map((d) => (
            <div key={d.day} className="rounded-2xl border border-black/10 bg-surface/60 p-5">
              <p className="text-center text-sm font-semibold text-electric-iris">
                {locale === 'ru' ? `День ${d.day} — ${d.title}` : `Day ${d.day} — ${d.title_en}`}
              </p>
              <p className="mt-1.5 text-sm text-silver-mist">{locale === 'ru' ? d.description : d.description_en}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Формат и условия */}
      <div className="mt-14 rounded-2xl border border-black/10 bg-surface/60 p-5 sm:p-6">
        <h2 className="text-center text-lg font-semibold text-bone-white">
          {locale === 'ru' ? 'Формат и условия' : 'Format and terms'}
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">
              {locale === 'ru' ? 'Длительность' : 'Duration'}
            </dt>
            <dd className="mt-0.5 text-sm text-bone-white">
              {locale === 'ru' ? (
                <>
                  {program.format.duration} / <PlaceholderText text={program.format.nights} /> ночей
                </>
              ) : (
                <>
                  {program.format.duration_en} / {program.format.nights} nights
                </>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">
              {locale === 'ru' ? 'Размер группы' : 'Group size'}
            </dt>
            <dd className="mt-0.5 text-sm text-bone-white">
              <PlaceholderText text={locale === 'ru' ? program.format.groupSize : program.format.groupSize_en} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">
              {locale === 'ru' ? 'Стоимость' : 'Price'}
            </dt>
            <dd className="mt-0.5 text-sm text-bone-white">
              <PlaceholderText text={locale === 'ru' ? program.format.price : program.format.price_en} />{' '}
              {locale === 'ru' ? 'за участника' : 'per participant'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">
              {locale === 'ru' ? 'Ближайшие даты' : 'Upcoming dates'}
            </dt>
            <dd className="mt-0.5 text-sm text-bone-white">
              <PlaceholderText text={locale === 'ru' ? program.format.dates : program.format.dates_en} />
            </dd>
          </div>
        </dl>
        <div className="mt-4 border-t border-black/10 pt-3">
          <span className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">
            {locale === 'ru' ? 'В стоимость входит: ' : 'Included in the price: '}
          </span>
          {(locale === 'ru' ? program.format.included : program.format.included_en).map((item, i, arr) => (
            <span key={i} className="text-sm text-bone-white">
              <PlaceholderText text={item} />
              {i < arr.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Форма заявки */}
      <div className="mt-14">
        <ApplicationForm
          programLabel={`${company?.name_en ?? program.companyId} — ${locale === 'ru' ? program.cardTitle : program.cardTitle_en}`}
        />
      </div>

      {/* Галерея фото с прошлых заездов — hidden for now (SHOW_PHOTO_GALLERY
          in corporateTrainingImages.ts) since no real photos exist yet and
          a wall of empty placeholder tiles looks unfinished. Flip that flag
          back to true once real files land at galleryImagePaths(). */}
      {SHOW_PHOTO_GALLERY && (
        <div className="mt-14">
          <h2 className="text-center text-2xl font-semibold text-bone-white">
            {locale === 'ru' ? 'Фото с прошлых заездов' : 'Photos from past cohorts'}
          </h2>
          <div className="mt-6">
            <ProgramGallery
              paths={galleryImagePaths(program.slug)}
              programLabel={locale === 'ru' ? program.cardTitle : program.cardTitle_en}
            />
          </div>
        </div>
      )}
    </section>
  )
}

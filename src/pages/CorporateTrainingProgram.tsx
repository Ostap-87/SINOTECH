import { useParams } from 'react-router-dom'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ShimmerText } from '@/components/ShimmerText'
import { RevealText } from '@/components/RevealText'
import { LocaleLink } from '@/i18n/LocaleLink'
import { getCorporateProgram } from '@/data/corporateTraining'
import { companiesData, companyNameZh } from '@/data'
import { heroImagePath, galleryImagePaths } from '@/data/corporateTrainingImages'
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
  const { company: slug } = useParams<{ company: string }>()
  const program = slug ? getCorporateProgram(slug) : undefined
  const company = program ? companiesData.companies.find((c) => c.id === program.companyId) : undefined

  usePageMeta(`${program?.metaTitle ?? 'Программа'} — Global Tech Tour`, program?.metaDescription, {
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
        Корпоративное обучение
      </LocaleLink>

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.025em]">
        <ShimmerText variant="saffron" text={program.cardTitle} />
      </p>
      <h1 className="mt-4 text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-bone-white sm:text-[40px] lg:text-[46px]">
        <RevealText text={program.h1} />
      </h1>
      <p className="mt-6 text-lg text-silver-mist">{program.subtitle}</p>

      <div className="relative mt-10">
        <StaticImage
          src={heroImagePath(program.slug)}
          alt={program.heroAlt}
          placeholderLabel="Фото скоро появится"
          className="aspect-[16/9] w-full rounded-2xl object-cover"
        />
        {company && (
          <div className="absolute bottom-4 left-4 shadow-sm">
            <CompanyMark company={company} size={64} />
          </div>
        )}
      </div>

      {/* Почему эта компания */}
      <div className="mt-10 rounded-2xl border border-black/10 bg-surface/60 p-6 sm:p-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.025em] text-ash-gray">
          Почему {company ? companyNameZh(company) : program.companyId}
        </h2>
        <ul className="mt-4 flex flex-col gap-2.5">
          {program.whyPoints.map((point, i) => (
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
            Подробнее о компании →
          </LocaleLink>
        )}
      </div>

      {/* Визуальная схема модулей курса — сразу после "Почему эта компания",
          перед текстовыми "Модули курса" / "Программа по дням" (Stage 2.1). */}
      <div className="mt-14">
        <h2 className="text-2xl font-semibold text-bone-white">Как устроена программа</h2>
        <div className="mt-6">
          <CourseModuleMap
            programTitle={`${company?.name_en ?? program.companyId} — ${program.cardTitle}`}
            modules={program.modules}
          />
        </div>
      </div>

      {/* Модули курса — текстом, плитки одинакового размера, максимум 3 в
          ряд (тот же паттерн раскладки, что и у визуальной схемы выше:
          5 модулей → 3+2 центрированный второй ряд, 6 → 3+3). */}
      <div className="mt-14">
        <h2 className="text-2xl font-semibold text-bone-white">Модули курса</h2>
        <div className="mt-6 flex flex-col gap-5">
          {chunk(program.modules, 3).map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`flex flex-col gap-5 sm:flex-row ${row.length < 3 ? 'sm:justify-center' : ''}`}
            >
              {row.map((mod, i) => (
                <div
                  key={mod.id}
                  className="flex flex-1 flex-col rounded-2xl border border-black/10 bg-surface/60 p-5 sm:max-w-[340px]"
                >
                  <p className="text-sm font-semibold text-ash-gray">Модуль {rowIndex * 3 + i + 1}</p>
                  <p className="mt-1 text-base font-semibold text-bone-white">{mod.title}</p>
                  <p className="mt-1.5 text-sm text-silver-mist">{mod.description}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Пример программы */}
      <div className="mt-14">
        <h2 className="text-2xl font-semibold text-bone-white">Пример программы</h2>
        <div className="mt-6 flex flex-col gap-5">
          {program.days.map((d) => (
            <div key={d.day} className="rounded-2xl border border-black/10 bg-surface/60 p-5">
              <p className="text-sm font-semibold text-electric-iris">День {d.day} — {d.title}</p>
              <p className="mt-1.5 text-sm text-silver-mist">{d.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Формат и условия */}
      <div className="mt-14 rounded-2xl border border-black/10 bg-surface/60 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-bone-white">Формат и условия</h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">Длительность</dt>
            <dd className="mt-0.5 text-sm text-bone-white">
              {program.format.duration} / <PlaceholderText text={program.format.nights} /> ночей
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">Размер группы</dt>
            <dd className="mt-0.5 text-sm text-bone-white">
              <PlaceholderText text={program.format.groupSize} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">Стоимость</dt>
            <dd className="mt-0.5 text-sm text-bone-white">
              <PlaceholderText text={program.format.price} /> за участника
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">Ближайшие даты</dt>
            <dd className="mt-0.5 text-sm text-bone-white">
              <PlaceholderText text={program.format.dates} />
            </dd>
          </div>
        </dl>
        <div className="mt-4 border-t border-black/10 pt-3">
          <span className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">В стоимость входит: </span>
          {program.format.included.map((item, i) => (
            <span key={i} className="text-sm text-bone-white">
              <PlaceholderText text={item} />
              {i < program.format.included.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Форма заявки */}
      <div className="mt-14">
        <ApplicationForm programLabel={`${company?.name_en ?? program.companyId} — ${program.cardTitle}`} />
      </div>

      {/* Галерея фото с прошлых заездов */}
      <div className="mt-14">
        <h2 className="text-2xl font-semibold text-bone-white">Фото с прошлых заездов</h2>
        <div className="mt-6">
          <ProgramGallery paths={galleryImagePaths(program.slug)} programLabel={program.cardTitle} />
        </div>
      </div>
    </section>
  )
}

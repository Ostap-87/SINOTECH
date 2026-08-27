import { usePageMeta } from '@/hooks/usePageMeta'
import { ShimmerText } from '@/components/ShimmerText'
import { RevealText } from '@/components/RevealText'
import { LocaleLink } from '@/i18n/LocaleLink'
import { useLanguage } from '@/i18n/LanguageContext'
import { materials } from '@/data/materials'
import { MaterialCard } from '@/components/corporate-training/MaterialCard'
import { ExpeditionTabs } from '@/components/corporate-training/ExpeditionTabs'
import { expeditionTabs, seriesLogicColumns, caseStudyRows } from '@/data/methodology'
import { UtensilsCrossed, Wheat, Package } from 'lucide-react'

const circleDiagramRu = '/logos/circle-diagram-ru.png'
const circleDiagramEn = '/logos/circle-diagram-en.png'

const cycleFeatures = [
  {
    icon: UtensilsCrossed,
    title: 'Рецептура / продукт',
    title_en: 'Recipe / Product',
    text: 'То, что бренд продаёт клиенту: блюдо, формат подачи, вкусовой профиль, R&D-процесс создания и обновления меню.',
    text_en: 'What the brand sells the customer: the dish, presentation format, flavor profile, the R&D behind creating and updating the menu.',
  },
  {
    icon: Wheat,
    title: 'Сырьё / ингредиенты',
    title_en: 'Raw Materials / Ingredients',
    text: 'Из чего физически сделан продукт: специи, мясо, тесто, бульонные базы — и кто их производит и поставляет.',
    text_en: 'What the product is physically made of: spices, meat, dough, broth bases — and who produces and supplies them.',
  },
  {
    icon: Package,
    title: 'Упаковка и материалы',
    title_en: 'Packaging & Materials',
    text: 'Во что продукт помещается на вынос/доставку, этикетка, брендинг тары, экологичность материалов.',
    text_en: 'What the product goes into for takeout/delivery: labeling, packaging branding, material sustainability.',
  },
]

export function CorporateTrainingMaterials() {
  const { locale } = useLanguage()
  const diagramSrc = locale === 'ru' ? circleDiagramRu : circleDiagramEn
  const diagramAlt =
    locale === 'ru'
      ? 'Схема методологии: продукт в центре, рецепт, сырьё и упаковка образуют цикл'
      : 'Methodology diagram: product at the center, with recipe, raw materials, and packaging forming a cycle'

  usePageMeta(
    locale === 'ru'
      ? 'Материалы и методология — Корпоративное обучение — Global Tech Tour'
      : 'Materials and Methodology — Corporate Training — Global Tech Tour',
    locale === 'ru'
      ? 'Методология «Три технологические экспедиции»: как раскладывать бренд на продукт, сырьё и упаковку и строить под это серию экспедиций.'
      : 'The "Three Technological Expeditions" methodology: how to break a brand down into product, raw materials, and packaging, and build a series of expeditions around it.',
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

      {/* ═══ Section 1 — Three parts of one cycle ═══ */}
      <div className="mt-14 rounded-2xl border border-black/10 bg-surface/60 p-6 sm:p-8 lg:p-10">
        <h2 className="text-2xl font-semibold text-bone-white">
          {locale === 'ru' ? 'Три части одного цикла' : 'Three parts of one cycle'}
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-base text-silver-mist">
              {locale === 'ru'
                ? 'Любой ресторанный бренд с точки зрения технологического анализа раскладывается на три неразрывные, но самостоятельные составные части. Каждая из них заслуживает отдельного, полноценного технологического погружения — а не беглого знакомства в рамках одной экскурсии. Именно поэтому качественный разбор бренда — это не одна поездка, а серия из трёх экспедиций.'
                : "Any restaurant brand, from a technological standpoint, breaks down into three inseparable but self-contained parts. Each of them deserves its own full technological deep dive — not a quick look during a single tour. That's why a proper brand teardown isn't one trip, but a series of three expeditions."}
            </p>
            <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:gap-6">
              {cycleFeatures.map((feature) => (
                <div key={feature.title} className="flex flex-1 flex-col gap-2">
                  <feature.icon size={24} strokeWidth={1.75} className="text-electric-iris" aria-hidden="true" />
                  <p className="text-sm font-semibold text-bone-white">
                    {locale === 'ru' ? feature.title : feature.title_en}
                  </p>
                  <p className="text-sm text-silver-mist">{locale === 'ru' ? feature.text : feature.text_en}</p>
                </div>
              ))}
            </div>
          </div>
          <img
            src={diagramSrc}
            alt={diagramAlt}
            className="mx-auto w-full max-w-[360px] rounded-2xl border border-black/10 bg-void p-4 shadow-sm"
          />
        </div>
      </div>

      {/* ═══ Section 2 — Expeditions don't overlap (interactive tabs) ═══ */}
      <div className="mt-14">
        <h2 className="text-center text-2xl font-semibold text-bone-white">
          {locale === 'ru' ? 'Экспедиции не дублируют друг друга' : "Expeditions don't overlap"}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-silver-mist">
          {locale === 'ru'
            ? 'Каждая экспедиция закрывает свой пласт вопросов, недоступный при поверхностном визите в ресторан.'
            : "Each expedition covers a layer of questions you can't get from a surface-level restaurant visit."}
        </p>
        <div className="mx-auto mt-8 max-w-3xl">
          <ExpeditionTabs tabs={expeditionTabs} diagramSrc={diagramSrc} diagramAlt={diagramAlt} />
        </div>
      </div>

      {/* ═══ Section 3 — Overall logic of the series ═══ */}
      <div className="mt-14 rounded-2xl border border-black/10 bg-surface/60 p-5 sm:p-6">
        <h2 className="text-center text-lg font-semibold text-bone-white">
          {locale === 'ru' ? 'Итоговая логика серии' : 'Overall logic of the series'}
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {seriesLogicColumns.map((col) => (
            <div key={col.numberLabel} className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-electric-iris">
                {col.numberLabel} · {locale === 'ru' ? col.title : col.title_en}
              </p>
              <dl className="flex flex-col gap-3">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">
                    {locale === 'ru' ? 'Аудитория' : 'Audience'}
                  </dt>
                  <dd className="mt-0.5 text-sm text-bone-white">{locale === 'ru' ? col.audience : col.audience_en}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">
                    {locale === 'ru' ? 'Сложность доступа' : 'Access difficulty'}
                  </dt>
                  <dd className="mt-0.5 text-sm text-bone-white">
                    {locale === 'ru' ? col.accessDifficulty : col.accessDifficulty_en}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.025em] text-ash-gray">
                    {locale === 'ru' ? 'Связь с брендом' : 'Link to the brand'}
                  </dt>
                  <dd className="mt-0.5 text-sm text-bone-white">{locale === 'ru' ? col.brandLink : col.brandLink_en}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Section 4 — Closing statement ═══ */}
      <div className="mt-14 rounded-2xl bg-electric-iris/10 p-6 sm:p-10">
        <p className="mx-auto max-w-3xl text-center text-lg font-medium leading-relaxed text-bone-white sm:text-xl">
          {locale === 'ru'
            ? '«Три экспедиции — это не три случайных маршрута, а последовательная деконструкция одного и того же бренда на его технологические составляющие. Именно поэтому продавать их лучше всего как серию: понимание, увиденное в Экспедиции 1 (что представляет собой бренд и его рецептура), становится системой координат, через которую участник смотрит на заводы в Экспедициях 2 и 3 — увидеть источник теста после того, как попробовал готовое блюдо, гораздо ценнее, чем увидеть тот же завод в отрыве от бренда, который он обслуживает.»'
            : '"The three expeditions aren\'t three random routes — they\'re a sequential deconstruction of one brand into its technological components. That\'s why they sell best as a series: what you understand in Expedition 1 (what the brand and its recipe actually are) becomes the frame of reference through which you view the factories in Expeditions 2 and 3 — seeing the source of the dough after tasting the finished dish is far more valuable than seeing the same factory detached from the brand it serves."'}
        </p>
      </div>

      {/* ═══ Section 6 — The methodology in action ═══ */}
      <div className="mt-14">
        <h2 className="text-center text-2xl font-semibold text-bone-white">
          {locale === 'ru' ? 'Методология в действии' : 'The methodology in action'}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-silver-mist">
          {locale === 'ru'
            ? 'Возьмём кофейный ритейл — индустрию, которая уже есть в нашем каталоге. Три составляющие бренда здесь читаются особенно чётко:'
            : "Take coffee retail — an industry already in our catalogue. Here the brand's three components are especially easy to see:"}
        </p>
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-black/10 bg-surface/60 p-6 sm:p-8">
          <div className="flex flex-col gap-6">
            {caseStudyRows.map((row) => (
              <div key={row.numberLabel} className="flex gap-4">
                <span className="shrink-0 text-sm font-semibold text-electric-iris">{row.numberLabel}</span>
                <div>
                  <p className="text-sm font-semibold text-bone-white">{locale === 'ru' ? row.title : row.title_en}</p>
                  <p className="mt-1 text-sm text-silver-mist">{locale === 'ru' ? row.text : row.text_en}</p>
                </div>
              </div>
            ))}
          </div>
          <LocaleLink
            to="/companies/luckin-coffee"
            className="mt-6 inline-block text-sm font-medium text-electric-iris hover:underline"
          >
            {locale === 'ru' ? 'Смотреть компанию в каталоге →' : 'View the company in our catalogue →'}
          </LocaleLink>
        </div>
      </div>

      {/* ═══ Section 5 — CTA ═══ */}
      <div className="mt-14 rounded-2xl border border-black/10 bg-surface/60 p-8 text-center sm:p-10">
        <h2 className="text-2xl font-semibold text-bone-white">
          {locale === 'ru' ? 'Хотите разобрать бренд по этой методологии?' : 'Want to break down a brand using this methodology?'}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-silver-mist">
          {locale === 'ru'
            ? 'Оставьте заявку — подберём экспедицию или всю серию под ваш бренд и задачи.'
            : "Submit a request — we'll put together an expedition or the full series around your brand and goals."}
        </p>
        <LocaleLink
          to="/contacts"
          className="mt-6 inline-block rounded-full bg-electric-iris px-6 py-3 text-sm font-semibold text-void hover:opacity-90"
        >
          {locale === 'ru' ? 'Оставить заявку →' : 'Submit a request →'}
        </LocaleLink>
      </div>

      {materials.length > 0 && (
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <MaterialCard key={material.slug} material={material} />
          ))}
        </div>
      )}
    </section>
  )
}

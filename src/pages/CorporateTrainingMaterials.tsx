import { usePageMeta } from '@/hooks/usePageMeta'
import { ShimmerText } from '@/components/ShimmerText'
import { RevealText } from '@/components/RevealText'
import { LocaleLink } from '@/i18n/LocaleLink'
import { useLanguage } from '@/i18n/LanguageContext'
import { materials } from '@/data/materials'
import { MaterialCard } from '@/components/corporate-training/MaterialCard'
import { ExpeditionTabs } from '@/components/corporate-training/ExpeditionTabs'
import {
  expeditionTabs,
  seriesLogicColumns,
  caseStudyRows,
  roboticsExpeditionTabs,
  roboticsSeriesLogicColumns,
} from '@/data/methodology'
import { UtensilsCrossed, Wheat, Package, Wrench, ScanEye, Cpu } from 'lucide-react'

const circleDiagramRu = '/logos/circle-diagram-ru.png'
const circleDiagramEn = '/logos/circle-diagram-en.png'
const roboticsDiagram = '/logos/robotics-diagram.png'

// Crop mask (percent of the diagram image) hiding the diagram's baked-in,
// Russian-only bottom caption so the image can be reused on the EN page
// without an untranslated strip — the equivalent caption is rendered as
// ordinary, localized HTML text underneath instead (see roboticsDiagramCaption).
const roboticsCaptionMask = { left: 34.5, top: 80.5, width: 36, height: 19.5 }

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

const roboticsFeatures = [
  {
    icon: Wrench,
    title: 'Аппаратное обеспечение (Hardware)',
    title_en: 'Hardware',
    text: 'Физическое тело робота: механика, приводы, моторы и актуаторы, источники питания и проводка. То, из чего робот собран физически.',
    text_en: "The robot's physical body: mechanics, drives, motors and actuators, power sources and wiring. What the robot is physically built from.",
  },
  {
    icon: ScanEye,
    title: 'Системы управления и сенсорика (Control & Sensing)',
    title_en: 'Control & Sensing',
    text: '«Нервная система» робота: сенсоры, камеры, лидары, контроллеры, контур обратной связи между роботом и внешней средой.',
    text_en: "The robot's \"nervous system\": sensors, cameras, LiDAR, controllers, the feedback loop between the robot and its environment.",
  },
  {
    icon: Cpu,
    title: 'Программное обеспечение (Software)',
    title_en: 'Software',
    text: '«Мозг» робота: алгоритмы, код, операционные системы (ROS и аналоги), логика принятия решений.',
    text_en: "The robot's \"brain\": algorithms, code, operating systems (ROS and equivalents), decision-making logic.",
  },
]

export function CorporateTrainingMaterials() {
  const { locale } = useLanguage()
  const diagramSrc = locale === 'ru' ? circleDiagramRu : circleDiagramEn
  const diagramAlt =
    locale === 'ru'
      ? 'Схема методологии: продукт в центре, рецепт, сырьё и упаковка образуют цикл'
      : 'Methodology diagram: product at the center, with recipe, raw materials, and packaging forming a cycle'

  const roboticsDiagramAlt =
    locale === 'ru'
      ? 'Схема методологии робототехники: робот в центре, аппаратное обеспечение, системы управления и сенсорика, программное обеспечение — три составляющие любого робота'
      : 'Robotics methodology diagram: a robot at the center, with hardware, control & sensing, and software as its three components'
  const roboticsDiagramCaption =
    locale === 'ru'
      ? 'Робототехника строится на трёх основных компонентах («трёх китах»)'
      : "Robotics is built on three core components (the 'three pillars')"

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

      {/* ═══ In-page jump nav — two methodology blocks below ═══ */}
      <nav aria-label={locale === 'ru' ? 'Разделы методологии' : 'Methodology sections'} className="mt-6 flex flex-wrap gap-2">
        <a
          href="#restaurant-methodology"
          className="rounded-full border border-black/10 bg-surface/60 px-3 py-1 text-xs font-semibold text-silver-mist hover:text-bone-white sm:text-sm"
        >
          {locale === 'ru' ? 'Рестораны' : 'Restaurants'}
        </a>
        <a
          href="#robotics-methodology"
          className="rounded-full border border-black/10 bg-surface/60 px-3 py-1 text-xs font-semibold text-silver-mist hover:text-bone-white sm:text-sm"
        >
          {locale === 'ru' ? 'Робототехника' : 'Robotics'}
        </a>
      </nav>

      {/* ═══════════════════════════════════════════════════════════
          METHODOLOGY BLOCK 1 — Restaurant brands
          ═══════════════════════════════════════════════════════════ */}
      <div id="restaurant-methodology" className="scroll-mt-24">
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
      </div>
      {/* ═══ end of METHODOLOGY BLOCK 1 — Restaurant brands ═══ */}

      {/* ═══ Divider between the two methodology blocks ═══ */}
      <div className="mt-16 border-t border-black/10 pt-16" />

      {/* ═══════════════════════════════════════════════════════════
          METHODOLOGY BLOCK 2 — Robotics
          ═══════════════════════════════════════════════════════════ */}
      <div id="robotics-methodology" className="scroll-mt-24">
        <p className="text-sm font-semibold uppercase tracking-[0.025em]">
          <ShimmerText variant="saffron" text={locale === 'ru' ? 'Методология · Робототехника' : 'Methodology · Robotics'} />
        </p>
        <h2 className="mt-4 max-w-2xl text-[28px] font-normal leading-[1.15] tracking-[-0.02em] sm:text-[36px]">
          {locale === 'ru'
            ? 'Методология анализа робототехники: три технологические экспедиции'
            : 'Robotics Analysis Methodology: Three Technological Expeditions'}
        </h2>

        {/* ═══ Section 1 — The three pillars of robotics ═══ */}
        <div className="mt-10 rounded-2xl border border-black/10 bg-surface/60 p-6 sm:p-8 lg:p-10">
          <h3 className="text-2xl font-semibold text-bone-white">
            {locale === 'ru' ? 'Три кита робототехники' : 'The three pillars of robotics'}
          </h3>
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-base text-silver-mist">
                {locale === 'ru'
                  ? 'Любой робот — промышленный манипулятор, сервисный робот, гуманоид или мобильная платформа — с точки зрения технологического анализа раскладывается на три неразрывные, но самостоятельные составные части («три кита» робототехники). Каждая из них заслуживает отдельного, полноценного технологического погружения — а не беглого знакомства в рамках одной экскурсии по шоуруму. Именно поэтому качественный разбор робототехнического бренда или продукта — это не одна поездка, а серия из трёх экспедиций.'
                  : "Any robot — an industrial manipulator, a service robot, a humanoid, or a mobile platform — breaks down, from a technological standpoint, into three inseparable but self-contained parts (the 'three pillars' of robotics). Each of them deserves its own full technological deep dive — not a quick look during a single showroom visit. That's why a proper teardown of a robotics brand or product isn't one trip, but a series of three expeditions."}
              </p>
              <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:gap-6">
                {roboticsFeatures.map((feature) => (
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
            <div className="mx-auto w-full max-w-[420px]">
              <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-void p-4 shadow-sm">
                <div className="relative">
                  <img src={roboticsDiagram} alt={roboticsDiagramAlt} className="w-full" />
                  <div
                    aria-hidden="true"
                    className="absolute bg-surface"
                    style={{
                      left: `${roboticsCaptionMask.left}%`,
                      top: `${roboticsCaptionMask.top}%`,
                      width: `${roboticsCaptionMask.width}%`,
                      height: `${roboticsCaptionMask.height}%`,
                    }}
                  />
                </div>
              </div>
              <p className="mt-2 text-center text-xs text-ash-gray">{roboticsDiagramCaption}</p>
            </div>
          </div>
        </div>

        {/* ═══ Section 2 — Expeditions don't overlap (interactive tabs) ═══ */}
        <div className="mt-14">
          <h3 className="text-center text-2xl font-semibold text-bone-white">
            {locale === 'ru' ? 'Экспедиции не дублируют друг друга' : "Expeditions don't overlap"}
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base text-silver-mist">
            {locale === 'ru'
              ? 'Экспедиции не дублируют друг друга — каждая закрывает свой пласт вопросов, недоступный при поверхностном визите на шоурум или выставочный стенд.'
              : "Each expedition covers a layer of questions you can't get from a surface-level showroom or trade-show visit."}
          </p>
          <div className="mx-auto mt-8 max-w-3xl">
            <ExpeditionTabs
              tabs={roboticsExpeditionTabs}
              diagramSrc={roboticsDiagram}
              diagramAlt={roboticsDiagramAlt}
              diagramCaptionMask={roboticsCaptionMask}
              diagramCaption={roboticsDiagramCaption}
            />
          </div>
        </div>

        {/* ═══ Section 3 — Overall logic of the series ═══ */}
        <div className="mt-14 rounded-2xl border border-black/10 bg-surface/60 p-5 sm:p-6">
          <h3 className="text-center text-lg font-semibold text-bone-white">
            {locale === 'ru' ? 'Итоговая логика серии' : 'Overall logic of the series'}
          </h3>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {roboticsSeriesLogicColumns.map((col) => (
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
                      {locale === 'ru' ? 'Связь с продуктом' : 'Link to the product'}
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
              ? '«Три экспедиции — это последовательная деконструкция одного и того же робота на его технологические составляющие, а не три случайных маршрута. Понимание, увиденное при знакомстве с готовым продуктом (демонстрация робота в сборе), становится системой координат, через которую участник смотрит на заводы аппаратной части, лаборатории сенсорики и команды разработки ПО — увидеть код после того, как подержал в руках готового робота, гораздо ценнее, чем увидеть тот же код в отрыве от физического продукта, который он оживляет.»'
              : '"The three expeditions are a sequential deconstruction of one and the same robot into its technological components, not three random routes. The understanding gained from meeting the finished product (seeing the assembled robot in action) becomes the frame of reference through which a participant views the hardware factories, the sensing labs, and the software teams — seeing the code after having held the finished robot is far more valuable than seeing that same code detached from the physical product it brings to life."'}
          </p>
        </div>

        {/* ═══ Section 5 — Flexible format (standalone callout, not a 4th tab) ═══ */}
        <div className="mt-14 rounded-r-2xl border-l-4 border-electric-iris bg-surface/60 p-6 sm:p-8">
          <h3 className="text-xl font-semibold text-bone-white">
            {locale === 'ru' ? 'Гибкий формат: можно смешивать блоки' : 'Flexible format: blocks can be mixed'}
          </h3>
          <p className="mt-4 text-sm text-silver-mist">
            {locale === 'ru'
              ? 'Три экспедиции не обязаны идти строго последовательно и раздельно — при необходимости их можно смешивать в рамках одной поездки, чтобы дать более полное и цельное погружение в процесс за одну экспедицию. Например, один день может включать завод аппаратной части, а на следующий день — лабораторию сенсорики и презентацию софта той же компании: так участник видит, как три «кита» связаны внутри одного конкретного продукта.'
              : "The three expeditions don't have to run strictly in sequence and separately — when useful, they can be mixed within a single trip to give a more complete, cohesive immersion in the process in one go. For example, one day might cover a hardware factory, and the next day a sensing lab and a software presentation from the same company — so the participant sees how the three pillars connect within one specific product."}
          </p>
          <p className="mt-4 text-sm font-semibold text-bone-white">
            {locale === 'ru'
              ? 'Тем не менее базовая рекомендация методологии остаётся прежней: начинать с трёх отдельных блоков и в первую очередь — с первой экспедиции (аппаратное обеспечение). Раздельный формат даёт более глубокое и предсказуемое погружение в каждую составляющую — смешанный формат имеет смысл как следующий шаг, когда участник уже понимает логику всех трёх «китов» по отдельности и хочет увидеть их интеграцию в конкретном продукте или на конкретной производственной площадке.'
              : "That said, the methodology's baseline recommendation stays the same: start with three separate blocks, beginning with the first expedition (hardware). The separate format gives a deeper, more predictable immersion in each component — the mixed format makes sense as a next step, once a participant already understands the logic of all three pillars individually and wants to see their integration in a specific product or production site."}
          </p>
        </div>

        {/* ═══ Section 6 — The methodology in action ═══ */}
        <div className="mt-14">
          <h3 className="text-center text-2xl font-semibold text-bone-white">
            {locale === 'ru' ? 'Методология в действии' : 'The methodology in action'}
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base text-silver-mist">
            {locale === 'ru'
              ? 'Экспедиция Robotics Expedition — практический пример гибридного формата (см. Раздел «Гибкий формат» выше): визиты в рамках одной пятидневной поездки закрывают сразу несколько «китов» на разных площадках — от сборочных линий и демонстрации гуманоидов до презентаций технологий распознавания и управления.'
              : "The Robotics Expedition is a practical example of the hybrid format (see 'Flexible format' above): within a single five-day trip, visits cover several of the three pillars across different sites — from assembly lines and humanoid demos to presentations on perception and control technology."}
          </p>
          <div className="mx-auto mt-8 max-w-3xl text-center">
            <LocaleLink
              to="/expeditions/robotics-expedition"
              className="inline-block rounded-full bg-electric-iris px-6 py-3 text-sm font-semibold text-void hover:opacity-90"
            >
              {locale === 'ru' ? 'Смотреть программу Robotics Expedition →' : 'View the Robotics Expedition program →'}
            </LocaleLink>
          </div>
        </div>

        {/* ═══ Section 7 — CTA ═══ */}
        <div className="mt-14 rounded-2xl border border-black/10 bg-surface/60 p-8 text-center sm:p-10">
          <h3 className="text-2xl font-semibold text-bone-white">
            {locale === 'ru'
              ? 'Хотите разобрать робота или производителя по этой методологии?'
              : 'Want to break down a robot or manufacturer using this methodology?'}
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-base text-silver-mist">
            {locale === 'ru'
              ? 'Оставьте заявку — подберём экспедицию или всю серию под задачи вашей команды.'
              : "Submit a request — we'll put together an expedition or the full series around your team's goals."}
          </p>
          <LocaleLink
            to="/contacts"
            className="mt-6 inline-block rounded-full bg-electric-iris px-6 py-3 text-sm font-semibold text-void hover:opacity-90"
          >
            {locale === 'ru' ? 'Оставить заявку →' : 'Submit a request →'}
          </LocaleLink>
        </div>
      </div>
      {/* ═══ end of METHODOLOGY BLOCK 2 — Robotics ═══ */}

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

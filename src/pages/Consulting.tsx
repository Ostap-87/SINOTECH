import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/i18n/LanguageContext'
import { ParticleCanvas } from '@/components/ParticleCanvas'
import type { ParticleCanvasHandle } from '@/components/ParticleCanvas'
import { useShapeExitNavigate } from '@/hooks/useShapeExitNavigate'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ShimmerText } from '@/components/ShimmerText'
import { RevealText } from '@/components/RevealText'

interface Service {
  n: number
  title_ru: string
  title_en: string
  desc_ru: string
  desc_en: string
  bullets_ru: string[]
  bullets_en: string[]
}

const SERVICES: Service[] = [
  {
    n: 1,
    title_ru: 'Технологические экспедиции «под ключ»',
    title_en: 'Turnkey technology expeditions',
    desc_ru:
      'Организация закрытых деловых делегаций к флагманским предприятиям и холдингам по вашей отрасли.',
    desc_en: 'Closed-door business delegations to flagship enterprises and holdings in your industry.',
    bullets_ru: [
      'Подбор компаний под конкретную задачу заказчика (производство, ретейл, робототехника, биотех, FMCG, логистика и др.)',
      'Доступ на закрытые объекты: R&D-центры, «умные» производства, шоурумы, распределительные хабы',
      'Многогородские маршруты с выверенной логистикой (Китай, ЮВА) — без потерь времени на переезды',
      'Полное сопровождение группы: трансферы, отели, синхронный перевод, протокол',
    ],
    bullets_en: [
      "Companies matched to the client's specific brief (manufacturing, retail, robotics, biotech, FMCG, logistics, and more)",
      'Access to closed sites: R&D centers, smart factories, showrooms, distribution hubs',
      'Multi-city routes with tight logistics (China, SE Asia) — no time lost to transfers',
      'Full group support: transfers, hotels, simultaneous interpretation, protocol',
    ],
  },
  {
    n: 2,
    title_ru: 'Доступ к первым лицам (C-level Access)',
    title_en: 'C-level access',
    desc_ru: 'Личное общение с собственниками, CEO и топ-менеджерами компаний-лидеров.',
    desc_en: 'Direct conversations with owners, CEOs, and top management of leading companies.',
    bullets_ru: [
      'Приватные встречи и деловые завтраки с руководителями холдингов',
      'Авторские лекции топ-менеджеров: как строились компании-лидеры, реальные кейсы роста, ошибки и решения',
      'Разбор стратегий из первых уст — управление, масштабирование, выход на международные рынки',
      'Нетворкинг-сессии с представителями отрасли и профильными ассоциациями',
    ],
    bullets_en: [
      'Private meetings and business breakfasts with holding-company leadership',
      'Original talks by top executives: how leading companies were built, real growth cases, mistakes and fixes',
      'First-hand strategy breakdowns — management, scaling, international expansion',
      'Networking sessions with industry figures and trade associations',
    ],
  },
  {
    n: 3,
    title_ru: 'Корпоративное обучение (Executive Education)',
    title_en: 'Executive education',
    desc_ru: 'Образовательные модули на базе реальной практики азиатского бизнеса.',
    desc_en: 'Educational modules grounded in the real practice of Asian business.',
    bullets_ru: [
      'Тематические программы: цифровизация производства, новый ретейл, цепочки поставок, продукт и бренд',
      'Разбор живых кейсов на площадках самих компаний, а не в аудитории',
      'Мастер-классы от практиков: операционная эффективность, инновации, работа с данными',
    ],
    bullets_en: [
      'Themed programs: manufacturing digitalization, new retail, supply chains, product and brand',
      'Live case studies on-site at the companies themselves, not in a classroom',
      'Master classes from practitioners: operational efficiency, innovation, working with data',
    ],
  },
  {
    n: 4,
    title_ru: 'Стратегические сессии с участием топ-менеджеров',
    title_en: 'Strategy sessions with top executives',
    desc_ru: 'Фасилитируемые рабочие сессии, где эксперты азиатских холдингов помогают решить именно вашу задачу.',
    desc_en: 'Facilitated working sessions where experts from Asian holdings help solve your specific problem.',
    bullets_ru: [
      'Сессии в формате «ваш вызов — их опыт»: приглашённые топ-менеджеры разбирают вашу ситуацию',
      'Совместная выработка стратегии выхода на азиатский рынок или локализации в России/СНГ',
      'Модерация, фиксация решений, дорожная карта на выходе',
      'Возможность закрытого формата под совет директоров или управленческую команду заказчика',
    ],
    bullets_en: [
      '"Your challenge, their experience" format: invited top executives work through your situation',
      'Joint development of a market-entry strategy for Asia or a localization strategy for Russia/CIS',
      'Moderation, decisions recorded, a roadmap as the output',
      'Available as a closed-door format for a board of directors or a client management team',
    ],
  },
  {
    n: 5,
    title_ru: 'Поиск и верификация партнёров (Partner Matchmaking)',
    title_en: 'Partner matchmaking',
    desc_ru: 'Мы не просто знакомим — мы подбираем и проверяем.',
    desc_en: "We don't just make introductions — we source and verify.",
    bullets_ru: [
      'Формирование лонг-листа потенциальных партнёров и поставщиков под задачу',
      'Проверка благонадёжности, производственных мощностей, экспортного опыта',
      'Организация переговоров с подготовленной повесткой и переводом',
      'Сопровождение до подписания соглашений о намерениях',
    ],
    bullets_en: [
      'Building a long list of potential partners and suppliers for the task',
      'Due diligence: reliability, production capacity, export track record',
      'Negotiations organized with a prepared agenda and interpretation',
      'Support through to signing letters of intent',
    ],
  },
  {
    n: 6,
    title_ru: 'Сопровождение сделок и локализация',
    title_en: 'Deal support and localization',
    desc_ru: 'Доводим интерес до результата — с учётом специфики расчётов и логистики.',
    desc_en: 'We carry interest through to results — accounting for the specifics of payments and logistics.',
    bullets_ru: [
      'Организация платёжных и расчётных решений для работы с азиатскими контрагентами',
      'Поддержка по логистике, таможне, сертификации и импорту',
      'Юридическое сопровождение договоров и агентских соглашений',
      'Постоянное представительство ваших интересов на месте после экспедиции',
    ],
    bullets_en: [
      'Setting up payment and settlement solutions for working with Asian counterparties',
      'Support with logistics, customs, certification, and import',
      'Legal support for contracts and agency agreements',
      'Ongoing on-the-ground representation of your interests after the expedition',
    ],
  },
]

const FORMATS = [
  {
    title_ru: 'Индивидуальная экспедиция',
    title_en: 'Individual expedition',
    desc_ru: 'Под одну компанию и её задачу.',
    desc_en: 'Built around one company and its brief.',
  },
  {
    title_ru: 'Отраслевая делегация',
    title_en: 'Industry delegation',
    desc_ru: 'Сборная группа по вертикали (робототехника, FMCG, биотех и т.д.).',
    desc_en: 'A joint group by vertical (robotics, FMCG, biotech, and more).',
  },
  {
    title_ru: 'Годовой корпоративный контракт',
    title_en: 'Annual corporate contract',
    desc_ru: 'Серия визитов, обучение и постоянное сопровождение партнёрской работы в регионе.',
    desc_en: 'A series of visits, training, and ongoing support for partner work in the region.',
  },
]

const WHY_US = [
  {
    ru: 'Команда и инфраструктура на месте — не посредники «по переписке»',
    en: 'A team and infrastructure on the ground — not correspondence-only middlemen',
  },
  {
    ru: 'Доступ к компаниям и людям уровня, недоступного при самостоятельной организации',
    en: 'Access to companies and people at a level unreachable through self-organized visits',
  },
  {
    ru: 'Полный цикл: от первого визита до подписанной сделки и постоянного присутствия',
    en: 'Full cycle: from the first visit to a signed deal and an ongoing presence',
  },
]

export function Consulting() {
  const { locale } = useLanguage()
  const canvasHandleRef = useRef<ParticleCanvasHandle>(null)
  const { goTo, isLeaving, durationMs } = useShapeExitNavigate(canvasHandleRef)

  usePageMeta(
    locale === 'ru' ? 'Консалтинг — Global Tech Tour' : 'Consulting — Global Tech Tour',
    locale === 'ru'
      ? 'Консалтинг и технологические экспедиции в Китай и Юго-Восточную Азию — доступ к первым лицам ведущих азиатских холдингов.'
      : 'Consulting and technology expeditions to China and Southeast Asia — direct access to the leadership of top Asian holdings.',
  )

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[820px] lg:h-[720px]">
        <ParticleCanvas ref={canvasHandleRef} shape="china" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, transparent 35%, var(--color-void) 92%, var(--color-void) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 pb-24 lg:pt-20">
        <div
          className="pointer-events-none"
          style={{ opacity: isLeaving ? 0 : 1, transition: `opacity ${durationMs}ms ease-in-out` }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.025em]">
            <ShimmerText variant="saffron" text={locale === 'ru' ? 'Консалтинг' : 'Consulting'} />
          </p>
          <h1 className="mt-6 max-w-3xl text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[44px] lg:text-[52px]">
            <RevealText
              text={
                locale === 'ru'
                  ? 'Консалтинг и технологические экспедиции в Китай и Юго-Восточную Азию'
                  : 'Consulting and technology expeditions to China and Southeast Asia'
              }
            />
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-normal text-silver-mist">
            {locale === 'ru'
              ? 'Мы открываем российским и международным компаниям прямой доступ к первым лицам ведущих азиатских холдингов — не как туристам, а как партнёрам. Наш формат превращает деловую поездку в стратегический инструмент: вы не просто «смотрите заводы», а получаете живой опыт от людей, которые построили компании-лидеры, находите проверенных партнёров и увозите готовые решения для собственного бизнеса.'
              : "We open a direct line for Russian and international companies to the leadership of top Asian holdings — not as tourists, but as partners. Our format turns a business trip into a strategic tool: instead of just \"touring factories,\" you get first-hand experience from the people who built market-leading companies, find vetted partners, and leave with ready-to-use solutions for your own business."}
          </p>
          <p className="mt-4 max-w-2xl text-lg font-normal text-silver-mist">
            {locale === 'ru'
              ? 'За счёт постоянного присутствия команды на месте (Шанхай), выстроенной сети контактов на уровне топ-менеджмента и собственной операционной инфраструктуры мы организуем визиты, которые невозможно получить «с улицы».'
              : "With a team permanently on the ground (Shanghai), an established network of top-management contacts, and our own operating infrastructure, we arrange visits that simply aren't available to outsiders."}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {SERVICES.map((service) => (
            <div key={service.n} className="rounded-2xl border border-black/10 bg-surface/60 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.025em] text-electric-iris">
                {String(service.n).padStart(2, '0')}
              </p>
              <h2 className="mt-2 text-xl font-medium tracking-[-0.01em] text-bone-white">
                {locale === 'ru' ? service.title_ru : service.title_en}
              </h2>
              <p className="mt-2 text-sm text-silver-mist">
                {locale === 'ru' ? service.desc_ru : service.desc_en}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-silver-mist">
                {(locale === 'ru' ? service.bullets_ru : service.bullets_en).map((bullet) => (
                  <li key={bullet} className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-electric-iris" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 border-t border-black/10 pt-12 lg:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium">{locale === 'ru' ? 'География' : 'Geography'}</h3>
            <p className="mt-3 text-sm text-silver-mist">
              {locale === 'ru'
                ? 'Китай (Шанхай, Шэньчжэнь, Гуанчжоу, Пекин, Чэнду, Ханчжоу и др.) — основное направление уже сегодня.'
                : 'China (Shanghai, Shenzhen, Guangzhou, Beijing, Chengdu, Hangzhou, and more) — our primary destination today.'}
            </p>
            <p className="mt-2 text-sm text-silver-mist">
              {locale === 'ru'
                ? 'А также в скором времени: Индия, Малайзия, Индонезия, Япония, Вьетнам, Таиланд, Южная Корея.'
                : 'Coming soon: India, Malaysia, Indonesia, Japan, Vietnam, Thailand, South Korea.'}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium">{locale === 'ru' ? 'Форматы работы' : 'Work formats'}</h3>
            <ul className="mt-3 space-y-4">
              {FORMATS.map((format) => (
                <li key={format.title_en}>
                  <p className="text-sm font-medium text-bone-white">
                    {locale === 'ru' ? format.title_ru : format.title_en}
                  </p>
                  <p className="mt-0.5 text-sm text-silver-mist">
                    {locale === 'ru' ? format.desc_ru : format.desc_en}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-black/10 bg-surface/60 p-6 sm:p-8">
          <h3 className="text-lg font-medium">
            {locale === 'ru' ? 'Почему Global Tech Tour' : 'Why Global Tech Tour'}
          </h3>
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {WHY_US.map((item) => (
              <li key={item.en} className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-electric-iris" />
                <span className="text-sm text-silver-mist">{locale === 'ru' ? item.ru : item.en}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          to="/contacts"
          onClick={(event) => goTo('/contacts', event)}
          className="mt-10 inline-flex w-full items-center justify-center rounded-full bg-electric-iris px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
        >
          {locale === 'ru' ? 'Оставить заявку' : 'Get in touch'}
        </Link>
      </div>
    </section>
  )
}

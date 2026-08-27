/**
 * Content for the standalone "Корпоративное обучение" (corporate training)
 * section — six fixed benchmarking-tour programmes, one per partner
 * company. This is a deliberately separate data model from tours.json
 * (Expeditions): no cities/days-as-itinerary-legs/flights, just a
 * programme page shape of its own (see CorporateProgram below).
 *
 * The six programmes are a fixed, curated set (unlike the open-ended
 * "Материалы и методология" library in ./materials/*.json) — adding a
 * 7th one is expected to touch code, same as adding a new top-level page
 * would.
 *
 * PLACEHOLDER marks values the site owner asked to leave unfilled rather
 * than guessed (dates, price, group size, some inclusions). Components
 * rendering these should style them visibly (see PlaceholderTag) so
 * they're easy to find later.
 *
 * Bilingual fields: every `xyz` field carries a sibling `xyz_en` with the
 * English copy, following the `${key}_en` convention already used across
 * src/data (see companies.json/materials/*.json) and picked up via
 * `pick()` from src/i18n/LanguageContext. Russian content is the source of
 * truth — English fields are translations of it, not independent copy.
 */

export const PLACEHOLDER = '[уточнить]'
export const PLACEHOLDER_EN = '[TBC]'

export interface CourseModule {
  id: string
  /** Bold line inside the module-map box, and the heading in the text module list. */
  title: string
  title_en: string
  /** Short one-line gloss shown under the title in the module-map box. */
  short: string
  short_en: string
  /** Fuller description used in the text "Модули курса" section. */
  description: string
  description_en: string
}

export interface ProgramDay {
  day: number
  title: string
  title_en: string
  description: string
  description_en: string
}

export interface CorporateProgram {
  /** URL slug under /corporate-training/, and the id used for image paths. */
  slug: string
  /** Matching id in src/data/companies.json — used to link to /companies/:id. */
  companyId: string

  metaTitle: string
  metaTitle_en: string
  metaDescription: string
  metaDescription_en: string
  keywords: string[]
  keywords_en: string[]
  heroAlt: string
  heroAlt_en: string

  h1: string
  h1_en: string
  subtitle: string
  subtitle_en: string
  whyPoints: string[]
  whyPoints_en: string[]
  modules: CourseModule[]
  days: ProgramDay[]

  format: {
    duration: string
    duration_en: string
    nights: string
    groupSize: string
    groupSize_en: string
    price: string
    price_en: string
    included: string[]
    included_en: string[]
    dates: string
    dates_en: string
  }

  /** Hub grid card copy. */
  cardTitle: string
  cardTitle_en: string
  cardTeaser: string
  cardTeaser_en: string

  /**
   * Optional tag linking this programme to a methodology described on
   * /corporate-training/materials. When set, the programme page shows a
   * small badge back-linking to that methodology's section. Scaffolding
   * for the future — not set on any of the current six programmes; see
   * the "Методология в действии" section on the materials page for the
   * only place this concept is exercised today (the coffee-retail example
   * links the other way, from the methodology to a company, not a
   * programme).
   */
  methodology?: 'three-expeditions'
}

export const corporatePrograms: CorporateProgram[] = [
  {
    slug: 'huawei',
    companyId: 'huawei',
    metaTitle: 'Бенчмаркинг-тур на Huawei — стратегическое управление',
    metaTitle_en: 'Huawei Benchmarking Tour — Strategic Management',
    metaDescription:
      '3 дня на кампусе Huawei в Шэньчжэне: стратегия, культура, кадры. Перевод и полное сопровождение делегации.',
    metaDescription_en:
      "3 days on Huawei's Shenzhen campus: strategy, culture, talent management. Interpreting and full delegation support included.",
    keywords: [
      'тур на Huawei для бизнеса',
      'бенчмаркинг Huawei',
      'обучение стратегии Huawei',
      'посетить штаб-квартиру Huawei',
      'корпоративное обучение Huawei Шэньчжэнь',
      'стратегический менеджмент курс Huawei',
    ],
    keywords_en: [
      'corporate tour to Huawei',
      'Huawei benchmarking',
      'Huawei strategy training',
      'visit Huawei headquarters',
      'corporate training Huawei Shenzhen',
      'Huawei strategic management course',
    ],
    heroAlt: 'Штаб-квартира Huawei в Шэньчжэне',
    heroAlt_en: 'Huawei headquarters in Shenzhen',
    h1: 'Huawei: как строить стратегию, которая выдерживает 30 лет роста',
    h1_en: 'Huawei: how to build a strategy that survives 30 years of growth',
    subtitle:
      'Три дня на территории компании, признанной одним из десяти частных предприятий — «национальных тяжеловесов» Китая. Разбираем управленческую систему, которая довела Huawei до присутствия в 170+ странах.',
    subtitle_en:
      "Three days on the campus of a company officially named one of China's ten private-enterprise \"national heavyweights.\" We examine the management system that took Huawei into 170+ countries.",
    whyPoints: [
      '16 лет подряд в списке Fortune Global 500, в 2025 году — 83-е место',
      'Топ-40 самых дорогих брендов мира по версии Kantar BrandZ',
      'Официально признана одной из 10 частных компаний — «национальных тяжеловесов» КНР',
      'Более 200 000 сотрудников, работа в 170+ странах, услугами пользуются свыше 3 млрд человек',
      'Мировой лидер сразу в трёх направлениях бизнеса: операторском, корпоративном и потребительском',
    ],
    whyPoints_en: [
      '16 consecutive years on the Fortune Global 500 — ranked 83rd in 2025',
      'Top 40 most valuable brands worldwide, per Kantar BrandZ',
      "Officially recognised as one of China's 10 private-enterprise \"national heavyweights\"",
      'Over 200,000 employees, operations in 170+ countries, services used by more than 3 billion people',
      'World leader across three business lines at once: carrier, enterprise and consumer',
    ],
    modules: [
      {
        id: 'culture',
        title: 'Культурное строительство',
        title_en: 'Culture building',
        short: 'ценности как инструмент управления',
        short_en: 'values as a management tool',
        description:
          'Как ценности компании становятся рабочим инструментом, а не лозунгом на стене; методология самокритики и «дух борьбы».',
        description_en:
          'How corporate values become a working tool rather than a slogan on the wall; the self-criticism methodology and the "spirit of struggle."',
      },
      {
        id: 'strategy',
        title: 'Стратегическое планирование',
        title_en: 'Strategic planning',
        short: 'от цели до цифровой интеграции',
        short_en: 'from goal-setting to digital integration',
        description: 'От постановки цели до цифровой интеграции стратегии.',
        description_en: 'From setting the goal to digitally integrating the strategy.',
      },
      {
        id: 'org-innovation',
        title: 'Организационные инновации',
        title_en: 'Organisational innovation',
        short: 'модель «железного треугольника»',
        short_en: 'the "iron triangle" model',
        description: 'Модель «железного треугольника» и клиентоориентированные процессы.',
        description_en: 'The "iron triangle" model and customer-focused processes.',
      },
      {
        id: 'talent',
        title: 'Развитие талантов',
        title_en: 'Talent development',
        short: '«три опоры HR»',
        short_en: 'the "three pillars of HR"',
        description: 'Управление кадрами, система эффективности, «три опоры HR».',
        description_en: 'People management, the performance system, and the "three pillars of HR."',
      },
      {
        id: 'business',
        title: 'Управление бизнесом',
        title_en: 'Business management',
        short: '«армия продаж» Huawei',
        short_en: "Huawei's \"sales army\"",
        description: 'Как выстроена «армия продаж» Huawei.',
        description_en: 'How Huawei built its "sales army."',
      },
      {
        id: 'rnd',
        title: 'Управление НИОКР',
        title_en: 'R&D management',
        short: 'интегрированная разработка продукта',
        short_en: 'integrated product development',
        description: 'Практика интегрированной разработки продукта (IPD).',
        description_en: 'Integrated Product Development (IPD) in practice.',
      },
    ],
    days: [
      {
        day: 1,
        title: 'Культура и управление',
        title_en: 'Culture and management',
        description:
          'Знакомство с культурой Huawei: как ценности превращаются в систему управления. Разбор методологии самокритики и «духа борьбы».',
        description_en:
          'An introduction to Huawei\'s culture: how values become a management system. A close look at the self-criticism methodology and the "spirit of struggle."',
      },
      {
        day: 2,
        title: 'Стратегия и организация',
        title_en: 'Strategy and organisation',
        description:
          'Стратегическое планирование и организационные инновации: практикум по построению стратегии и разбор модели «железного треугольника».',
        description_en:
          'Strategic planning and organisational innovation: a hands-on workshop on building strategy and a breakdown of the "iron triangle" model.',
      },
      {
        day: 3,
        title: 'Таланты и бизнес',
        title_en: 'Talent and business',
        description:
          'Развитие талантов и управление бизнесом: система эффективности, мотивация, построение продающей организации.',
        description_en:
          'Talent development and business management: the performance system, motivation, and building a sales-driven organisation.',
      },
    ],
    format: {
      duration: '3 дня',
      duration_en: '3 days',
      nights: '4',
      groupSize: 'от 10 человек',
      groupSize_en: '10+ people',
      price: 'по запросу',
      price_en: 'on request',
      included: ['программа', 'перевод', 'проживание, трансфер, визовая поддержка — по запросу'],
      included_en: ['programme', 'interpreting', 'accommodation, transfers, visa support — on request'],
      dates: 'по запросу',
      dates_en: 'on request',
    },
    cardTitle: 'Стратегическое управление',
    cardTitle_en: 'Strategic management',
    cardTeaser: 'Как выстроить стратегию компании с нуля — культура, планирование, организация, кадры',
    cardTeaser_en: 'How to build a company strategy from scratch — culture, planning, organisation, people',
  },
  {
    slug: 'alibaba',
    companyId: 'alibaba',
    metaTitle: 'Бенчмаркинг-тур на Alibaba — управленческие инновации',
    metaTitle_en: 'Alibaba Benchmarking Tour — Management Innovation',
    metaDescription: '3 дня на кампусах Alibaba в Ханчжоу: стратегия, культура, организация. Полное сопровождение делегации.',
    metaDescription_en:
      "3 days on Alibaba's Hangzhou campuses: strategy, culture, organisation. Full delegation support included.",
    keywords: [
      'тур на Alibaba для бизнеса',
      'бенчмаркинг Alibaba',
      'обучение управленческим инновациям Alibaba',
      'посетить кампус Alibaba Ханчжоу',
      'корпоративное обучение Alibaba',
    ],
    keywords_en: [
      'corporate tour to Alibaba',
      'Alibaba benchmarking',
      'Alibaba management innovation training',
      'visit Alibaba campus Hangzhou',
      'corporate training Alibaba',
    ],
    heroAlt: 'Кампус Alibaba Group в Ханчжоу',
    heroAlt_en: 'Alibaba Group campus in Hangzhou',
    h1: 'Alibaba: 20 лет управленческих экспериментов, из которых выросла экосистема на триллионы юаней',
    h1_en: 'Alibaba: 20 years of management experiments that grew into a trillion-yuan ecosystem',
    subtitle:
      'Посещаем кампусы Alibaba в Ханчжоу и разбираем, как компания выстроила стратегию, культуру и организацию, которые позволяют ей одновременно расти в e-commerce, финансах, логистике и облаке.',
    subtitle_en:
      "We visit Alibaba's campuses in Hangzhou and unpack how the company built the strategy, culture and organisation that let it grow simultaneously in e-commerce, finance, logistics and cloud computing.",
    whyPoints: [
      'Одна из крупнейших в мире экосистем: e-commerce, платежи, логистика, финансы, облачные вычисления, локальные сервисы',
      'Институт DAMO — масштабные вложения в фундаментальные и прорывные технологии',
      'Путь от ранних B2B-платформ для малого бизнеса до модели «новой розницы», объединившей онлайн и офлайн',
      'Сильная корпоративная культура: миссия «в мире не должно быть трудного бизнеса» и система ценностей «Шесть духовных мечей»',
    ],
    whyPoints_en: [
      "One of the world's largest ecosystems: e-commerce, payments, logistics, finance, cloud computing, local services",
      'The DAMO Academy — large-scale investment in fundamental and frontier technologies',
      'A path from early B2B platforms for small business to the "New Retail" model that merged online and offline',
      'A strong corporate culture: the mission "to make it easy to do business anywhere" and the "Six Vein Spirit Sword" value system',
    ],
    modules: [
      {
        id: 'strategic-thinking',
        title: 'Стратегическое мышление',
        title_en: 'Strategic thinking',
        short: 'от бизнес-модели до платформенной стратегии',
        short_en: 'from business model to platform strategy',
        description: 'От бизнес-модели до омниканального маркетинга и платформенной стратегии.',
        description_en: 'From the business model to omnichannel marketing and platform strategy.',
      },
      {
        id: 'business-management',
        title: 'Управление бизнесом',
        title_en: 'Business management',
        short: '«железная армия продаж»',
        short_en: 'the "iron sales army"',
        description:
          'Операционный цикл компании, гибкая разработка продукта, построение «железной армии продаж».',
        description_en:
          "The company's operating cycle, agile product development, and building the \"iron sales army.\"",
      },
      {
        id: 'org-innovation',
        title: 'Организационные инновации',
        title_en: 'Organisational innovation',
        short: '«три топора» управления',
        short_en: 'the "three axes" of management',
        description: 'Путь к организационной победе, «три топора» управления, система управления эффективностью.',
        description_en:
          'The path to organisational success, the "three axes" of management, and the performance-management system.',
      },
    ],
    days: [
      {
        day: 1,
        title: 'Кампус в Биньцзяне',
        title_en: 'Binjiang campus',
        description: 'Кампус Alibaba в Биньцзяне: разбор двухъядерной модели — стратегический движок и организационная поддержка.',
        description_en:
          "Alibaba's Binjiang campus: a look at the dual-engine model — strategic drive and organisational support.",
      },
      {
        day: 2,
        title: 'Институт DAMO',
        title_en: 'DAMO Academy',
        description: 'Институт DAMO: технологические инновации как часть управленческой стратегии.',
        description_en: 'The DAMO Academy: technological innovation as part of management strategy.',
      },
      {
        day: 3,
        title: 'Кампус в Сиси',
        title_en: 'Xixi campus',
        description: 'Кампус Alibaba в Сиси: практика системы политкомиссаров и управленческие инновации компании.',
        description_en:
          "Alibaba's Xixi campus: the political-commissar system in practice and the company's management innovations.",
      },
    ],
    format: {
      duration: '3 дня',
      duration_en: '3 days',
      nights: '4',
      groupSize: 'от 10 человек',
      groupSize_en: '10+ people',
      price: 'по запросу',
      price_en: 'on request',
      included: ['программа', 'перевод', 'проживание, трансфер, визовая поддержка — по запросу'],
      included_en: ['programme', 'interpreting', 'accommodation, transfers, visa support — on request'],
      dates: 'по запросу',
      dates_en: 'on request',
    },
    cardTitle: 'Управленческие инновации',
    cardTitle_en: 'Management innovation',
    cardTeaser: '20 лет управленческого опыта одной из крупнейших экосистем мира',
    cardTeaser_en: "20 years of management experience from one of the world's largest ecosystems",
  },
  {
    slug: 'xiaomi',
    companyId: 'xiaomi',
    metaTitle: 'Бенчмаркинг-тур на Xiaomi — создание хитовых продуктов',
    metaTitle_en: 'Xiaomi Benchmarking Tour — Building Hit Products',
    metaDescription: '3 дня на площадке Xiaomi: пользовательское мышление, маркетинг, вывод продукта в топ продаж.',
    metaDescription_en: '3 days at Xiaomi: user-centric thinking, marketing, and taking a product to the top of the sales charts.',
    keywords: [
      'тур на Xiaomi для бизнеса',
      'бенчмаркинг Xiaomi',
      'как Xiaomi создаёт хиты продаж',
      'обучение маркетингу Xiaomi',
      'корпоративное обучение Xiaomi',
    ],
    keywords_en: [
      'corporate tour to Xiaomi',
      'Xiaomi benchmarking',
      'how Xiaomi creates bestsellers',
      'Xiaomi marketing training',
      'corporate training Xiaomi',
    ],
    heroAlt: 'Кампус Xiaomi',
    heroAlt_en: 'Xiaomi campus',
    h1: 'Xiaomi: как за 7 лет войти в Fortune 500, продавая «дружбу с пользователем»',
    h1_en: 'Xiaomi: how to enter the Fortune 500 in 7 years by selling "friendship with the user"',
    subtitle:
      'Разбираем на месте, как Xiaomi превращает обычные продукты в хиты продаж — от ценообразования до вирусного роста фан-сообщества.',
    subtitle_en:
      'On site, we examine how Xiaomi turns ordinary products into bestsellers — from pricing to the viral growth of its fan community.',
    whyPoints: [
      '7 лет подряд (2019–2025) в списке Fortune Global 500',
      'Аналогичные по характеристикам продукты в среднем на 30–40% дешевле конкурентов',
      'Крупнейшая в мире потребительская IoT-платформа, более 400 компаний в экосистеме',
      'Огромная и лояльная пользовательская база, статус модного и высокотехнологичного бренда',
    ],
    whyPoints_en: [
      '7 consecutive years (2019–2025) on the Fortune Global 500',
      'Comparable products priced 30–40% below competitors on average',
      "The world's largest consumer IoT platform, with more than 400 companies in the ecosystem",
      'A huge, loyal user base and standing as a fashionable, high-tech brand',
    ],
    modules: [
      {
        id: 'user-thinking',
        title: 'Пользовательское мышление',
        title_en: 'User-centric thinking',
        short: 'из покупателя — в фаната бренда',
        short_en: 'from buyer to brand fan',
        description: 'Как превратить покупателя в фаната бренда.',
        description_en: 'How to turn a buyer into a brand fan.',
      },
      {
        id: 'business-model',
        title: 'Бизнес-модель',
        title_en: 'Business model',
        short: 'экосистема и трансграничная e-commerce',
        short_en: 'ecosystem and cross-border e-commerce',
        description: 'Инновации экосистемы Xiaomi и выход на глобальный рынок через трансграничную e-commerce.',
        description_en: "Innovation in Xiaomi's ecosystem and its global expansion through cross-border e-commerce.",
      },
      {
        id: 'hit-products',
        title: 'Создание хитов',
        title_en: 'Creating hit products',
        short: '9 правил и реальные кейсы',
        short_en: '9 rules and real cases',
        description: '9 правил создания продукта и разбор реальных кейсов.',
        description_en: '9 rules for creating a hit product, illustrated with real cases.',
      },
      {
        id: 'marketing-growth',
        title: 'Маркетинговый рост',
        title_en: 'Marketing-driven growth',
        short: '360°-маркетинг по сценариям использования',
        short_en: '360° marketing built around use scenarios',
        description: '360°-маркетинг по сценариям использования, продвижение через новые медиа.',
        description_en: '360° marketing built around use scenarios, and promotion through new media.',
      },
      {
        id: 'talent',
        title: 'Развитие талантов',
        title_en: 'Talent development',
        short: 'управление в логике продуктовых команд',
        short_en: 'management built around product teams',
        description: 'Управление персоналом в логике продуктовых команд.',
        description_en: 'People management built around the logic of product teams.',
      },
    ],
    days: [
      {
        day: 1,
        title: 'Пользовательское мышление',
        title_en: 'User-centric thinking',
        description: 'Кампус Xiaomi: пользовательское мышление и построение репутации бренда.',
        description_en: "Xiaomi's campus: user-centric thinking and building brand reputation.",
      },
      {
        day: 2,
        title: 'Бизнес-модель и хиты',
        title_en: 'Business model and hit products',
        description: 'Практикум по бизнес-модели и созданию хитового продукта: разбор 9 правил на реальных кейсах.',
        description_en: 'A workshop on the business model and creating a hit product: the 9 rules examined through real cases.',
      },
      {
        day: 3,
        title: 'Маркетинг и таланты',
        title_en: 'Marketing and talent',
        description: 'Маркетинговый рост и работа с талантами: как компания выстраивает продающую систему.',
        description_en: 'Marketing-driven growth and talent management: how the company builds a sales-driving system.',
      },
    ],
    format: {
      duration: '3 дня',
      duration_en: '3 days',
      nights: '4',
      groupSize: 'от 10 человек',
      groupSize_en: '10+ people',
      price: 'по запросу',
      price_en: 'on request',
      included: ['программа', 'перевод', 'проживание, трансфер, визовая поддержка — по запросу'],
      included_en: ['programme', 'interpreting', 'accommodation, transfers, visa support — on request'],
      dates: 'по запросу',
      dates_en: 'on request',
    },
    cardTitle: 'Создание хитовых продуктов',
    cardTitle_en: 'Building hit products',
    cardTeaser: 'Полный цикл: от пользовательского мышления до вывода продукта в топ продаж',
    cardTeaser_en: 'The full cycle: from user-centric thinking to taking a product to the top of the sales charts',
  },
  {
    slug: 'haier',
    companyId: 'haier',
    metaTitle: 'Бенчмаркинг-тур на Haier — цифровая экосистема бренда',
    metaTitle_en: 'Haier Benchmarking Tour — A Digital Brand Ecosystem',
    metaDescription: '3 дня на площадке Haier: модель «人单合一», умные фабрики, цифровая трансформация производства.',
    metaDescription_en: '3 days at Haier: the "Rendanheyi" model, smart factories, and the digital transformation of manufacturing.',
    keywords: [
      'тур на Haier для бизнеса',
      'бенчмаркинг Haier',
      'модель 人单合一 Haier обучение',
      'цифровая трансформация Haier',
      'корпоративное обучение Haier',
    ],
    keywords_en: [
      'corporate tour to Haier',
      'Haier benchmarking',
      'Haier Rendanheyi model training',
      'Haier digital transformation',
      'corporate training Haier',
    ],
    heroAlt: 'Штаб-квартира Haier',
    heroAlt_en: 'Haier headquarters',
    h1: 'Haier: как разрушить границы между сотрудником и рынком — и не потерять контроль',
    h1_en: 'Haier: how to dissolve the boundary between employee and market — without losing control',
    subtitle:
      'Изучаем на месте модель «人单合一» — управленческую систему, которая держит Haier на первом месте в мире по продажам крупной бытовой техники уже 16 лет подряд.',
    subtitle_en:
      "On site, we study the \"Rendanheyi\" model — the management system that has kept Haier the world's No.1 in major-appliance sales for 16 consecutive years.",
    whyPoints: [
      '21 год подряд в списке «Топ-500 мировых брендов»',
      '16 лет подряд №1 в мире по продажам крупной бытовой техники',
      'Бренд представлен в 160+ странах и регионах',
      'Крупнейшее в мире число «маячных» заводов — образцовых «умных фабрик»',
      'Успешный переход от массового производства к массовой кастомизации',
    ],
    whyPoints_en: [
      '21 consecutive years on the "World\'s Top 500 Brands" list',
      "16 consecutive years as the world's No.1 in major-appliance sales",
      'The brand is present in 160+ countries and regions',
      'The world\'s largest number of "lighthouse factories" — model smart factories',
      'A successful shift from mass production to mass customisation',
    ],
    modules: [
      {
        id: 'rendanheyi',
        title: '«人单合一»',
        title_en: '"Rendanheyi"',
        short: 'сотрудник + потребительская ценность',
        short_en: 'employee + user value',
        description: 'Управленческая модель объединения сотрудника и потребительской ценности.',
        description_en: 'A management model that unites the employee with the value created for the user.',
      },
      {
        id: 'industrial-internet',
        title: 'Промышленный интернет',
        title_en: 'Industrial internet',
        short: 'умные фабрики',
        short_en: 'smart factories',
        description: 'Умные фабрики и производство, ориентированное на пользователя.',
        description_en: 'Smart factories and user-driven manufacturing.',
      },
      {
        id: 'digital-transform',
        title: 'Цифровая трансформация',
        title_en: 'Digital transformation',
        short: 'методы и пути перехода',
        short_en: 'methods and pathways',
        description: 'Методы и пути перехода компании в цифровой формат.',
        description_en: "Methods and pathways for the company's shift to a digital model.",
      },
      {
        id: 'entrepreneurship',
        title: 'Ускорение предпринимательства',
        title_en: 'Accelerating entrepreneurship',
        short: 'внутреннее предпринимательство',
        short_en: 'internal entrepreneurship',
        description: 'Модель внутреннего предпринимательства и инкубация стартапов.',
        description_en: 'The internal-entrepreneurship model and startup incubation.',
      },
      {
        id: 'brand-culture',
        title: 'Построение культуры бренда',
        title_en: 'Building brand culture',
        short: '30 лет бренда, система OEC',
        short_en: '30 years of brand-building, the OEC system',
        description: '30-летняя брендовая стратегия и система ежедневного контроля OEC.',
        description_en: 'A 30-year brand strategy and the OEC daily-control system.',
      },
      {
        id: 'talent',
        title: 'Развитие талантов',
        title_en: 'Talent development',
        short: 'кадры в цифровой трансформации',
        short_en: 'people in digital transformation',
        description: 'Управление кадрами в условиях цифровой трансформации.',
        description_en: 'People management under digital transformation.',
      },
    ],
    days: [
      {
        day: 1,
        title: '«人单合一»',
        title_en: '"Rendanheyi"',
        description: 'Знакомство с моделью «人单合一»: как сотрудники становятся внутренними предпринимателями.',
        description_en: 'An introduction to the "Rendanheyi" model: how employees become internal entrepreneurs.',
      },
      {
        day: 2,
        title: 'Умные фабрики',
        title_en: 'Smart factories',
        description: 'Промышленный интернет и умные фабрики: практика цифровой трансформации производства.',
        description_en: 'The industrial internet and smart factories: digital transformation of manufacturing in practice.',
      },
      {
        day: 3,
        title: 'Культура и таланты',
        title_en: 'Culture and talent',
        description: 'Культура бренда и развитие талантов: 30 лет построения бренда и работа с кадровым резервом.',
        description_en: "30 years of brand-building and how the company works with its talent pipeline.",
      },
    ],
    format: {
      duration: '3 дня',
      duration_en: '3 days',
      nights: '4',
      groupSize: 'от 10 человек',
      groupSize_en: '10+ people',
      price: 'по запросу',
      price_en: 'on request',
      included: ['программа', 'перевод', 'проживание, трансфер, визовая поддержка — по запросу'],
      included_en: ['programme', 'interpreting', 'accommodation, transfers, visa support — on request'],
      dates: 'по запросу',
      dates_en: 'on request',
    },
    cardTitle: 'Цифровая экосистема бренда',
    cardTitle_en: 'A digital brand ecosystem',
    cardTeaser: 'Как управлять брендом и производством в логике открытой цифровой экосистемы',
    cardTeaser_en: 'How to manage a brand and its manufacturing as an open digital ecosystem',
  },
  {
    slug: 'bytedance',
    companyId: 'bytedance',
    metaTitle: 'Бенчмаркинг-тур на ByteDance — рост через данные и ИИ',
    metaTitle_en: 'ByteDance Benchmarking Tour — Growth Through Data and AI',
    metaDescription: '3 дня на площадке ByteDance: данные, ИИ и рост бизнеса на примере Douyin и TikTok.',
    metaDescription_en: '3 days at ByteDance: data, AI, and business growth, illustrated through Douyin and TikTok.',
    keywords: [
      'тур на ByteDance для бизнеса',
      'бенчмаркинг ByteDance',
      'обучение цифровому росту ByteDance',
      'бизнес-модель Douyin TikTok',
      'корпоративное обучение ByteDance',
    ],
    keywords_en: [
      'corporate tour to ByteDance',
      'ByteDance benchmarking',
      'ByteDance digital-growth training',
      'Douyin TikTok business model',
      'corporate training ByteDance',
    ],
    heroAlt: 'Офис ByteDance',
    heroAlt_en: 'ByteDance office',
    h1: 'ByteDance: как алгоритм стал стратегией — и вывел компанию на мировой уровень',
    h1_en: 'ByteDance: how an algorithm became a strategy — and took the company global',
    subtitle: 'Разбираем на месте, как ByteDance строит организацию и бизнес-модель вокруг данных и ИИ — от Douyin до TikTok.',
    subtitle_en:
      'On site, we examine how ByteDance builds its organisation and business model around data and AI — from Douyin to TikTok.',
    whyPoints: [
      'Один из первых применил искусственный интеллект в мобильном интернете',
      'Создатель национальных приложений-хитов: Toutiao, Douyin и другие',
      'Лидер в разработке больших языковых моделей — собственная модель «Doubao»',
      'Стремительная глобальная экспансия: продукт TikTok — мировой феномен на зарубежных рынках',
    ],
    whyPoints_en: [
      'One of the first companies to apply artificial intelligence to the mobile internet',
      'Creator of nationwide hit apps: Toutiao, Douyin and others',
      'A leader in large language models, with its own "Doubao" model',
      'Rapid global expansion: TikTok has become a worldwide phenomenon in overseas markets',
    ],
    modules: [
      {
        id: 'digital-mindset',
        title: 'Цифро-интеллектуальное мышление',
        title_en: 'Digital-intelligence mindset',
        short: 'мышление роста и инновации',
        short_en: 'growth mindset and innovation',
        description: 'Мышление роста и инновационная практика.',
        description_en: 'Growth mindset and innovation in practice.',
      },
      {
        id: 'org-efficiency',
        title: 'Эффективность цифровой организации',
        title_en: 'Efficiency of a digital organisation',
        short: 'гибкая структура',
        short_en: 'an agile structure',
        description: 'Как гибкая структура подпитывает энергию компании.',
        description_en: "How an agile structure fuels the company's energy.",
      },
      {
        id: 'digital-competence',
        title: 'Применение цифровых компетенций',
        title_en: 'Applying digital competencies',
        short: 'рост через данные, контент, ИИ',
        short_en: 'growth through data, content and AI',
        description: 'Рост бренда через данные, продвижение через контент-платформы, рост через ИИ.',
        description_en: 'Brand growth through data, promotion through content platforms, and growth through AI.',
      },
    ],
    days: [
      {
        day: 1,
        title: 'Мышление роста',
        title_en: 'Growth mindset',
        description: 'Выставочный зал ByteDance: формирование мышления роста и инновационной практики.',
        description_en: "ByteDance's exhibition hall: building a growth mindset and innovation practice.",
      },
      {
        day: 2,
        title: 'Организация и цепочки поставок',
        title_en: 'Organisation and supply chains',
        description: 'Практика организационного управления и работа с цепочками поставок в эпоху интеллектуализации.',
        description_en: 'Organisational management in practice and working with supply chains in the age of intelligent technology.',
      },
      {
        day: 3,
        title: 'Контент и ИИ',
        title_en: 'Content and AI',
        description: 'Контент-маркетинг и рост через ИИ: практикум по цифровой трансформации отрасли.',
        description_en: 'Content marketing and AI-driven growth: a workshop on the digital transformation of an industry.',
      },
    ],
    format: {
      duration: '3 дня',
      duration_en: '3 days',
      nights: '4',
      groupSize: 'от 10 человек',
      groupSize_en: '10+ people',
      price: 'по запросу',
      price_en: 'on request',
      included: ['программа', 'перевод', 'проживание, трансфер, визовая поддержка — по запросу'],
      included_en: ['programme', 'interpreting', 'accommodation, transfers, visa support — on request'],
      dates: 'по запросу',
      dates_en: 'on request',
    },
    cardTitle: 'Цифро-интеллектуальный рост',
    cardTitle_en: 'Digital-intelligence growth',
    cardTeaser: 'Как технологии и данные становятся прямым драйвером роста бизнеса',
    cardTeaser_en: 'How technology and data become a direct driver of business growth',
  },
  {
    slug: 'ping-an',
    companyId: 'ping-an',
    metaTitle: 'Бенчмаркинг-тур на Ping An — цифровая стратегия в финансах',
    metaTitle_en: 'Ping An Benchmarking Tour — Digital Strategy in Finance',
    metaDescription: '3 дня на площадке Ping An: цифровая стратегия и управление в топ-10 финансовой компании мира.',
    metaDescription_en: "3 days at Ping An: digital strategy and management inside one of the world's top-10 financial companies.",
    keywords: [
      'тур на Ping An для бизнеса',
      'бенчмаркинг Ping An',
      'цифровая стратегия в финансах Китай',
      'обучение цифровизации финансовых компаний',
      'корпоративное обучение Ping An',
    ],
    keywords_en: [
      'corporate tour to Ping An',
      'Ping An benchmarking',
      'digital strategy in finance China',
      'digitalisation training for financial companies',
      'corporate training Ping An',
    ],
    heroAlt: 'Финансовый центр Ping An',
    heroAlt_en: 'Ping An financial centre',
    h1: 'Ping An: как выстроить цифровую стратегию в компании с миллионами клиентов',
    h1_en: 'Ping An: how to build a digital strategy inside a company with millions of customers',
    subtitle:
      'Изучаем, как один из крупнейших финансовых конгломератов мира сделал полную цифровизацию своим ключевым стратегическим проектом на ближайшее десятилетие.',
    subtitle_en:
      "We study how one of the world's largest financial conglomerates made full digitalisation its key strategic project for the coming decade.",
    whyPoints: [
      '47-е место в рейтинге Fortune Global 500 (2025)',
      '9-е место среди глобальных финансовых компаний (2025)',
      'Построила платформу финансовых услуг «одного окна» по стратегиям «финансы + технологии» и «финансы + экосистема»',
      'За почти 10 лет вложила 50 млрд юаней в НИОКР, создала 25 научных лабораторий',
      'Собственная система управления персоналом — «трёхмерная карта талантов»',
    ],
    whyPoints_en: [
      '47th place in the Fortune Global 500 ranking (2025)',
      '9th place among global financial companies (2025)',
      'Built a "one-stop" financial services platform under the "finance + technology" and "finance + ecosystem" strategies',
      'Invested RMB 50 billion in R&D over nearly 10 years and set up 25 research labs',
      'A proprietary people-management system — the "three-dimensional talent map"',
    ],
    modules: [
      {
        id: 'digital-strategy',
        title: 'Цифровая стратегия',
        title_en: 'Digital strategy',
        short: 'видение и прорыв через узкие места',
        short_en: 'vision and breaking through bottlenecks',
        description: 'Формирование видения, цифровая трансформация бизнеса, прорыв через узкие места роста.',
        description_en: 'Building the vision, digitally transforming the business, and breaking through growth bottlenecks.',
      },
      {
        id: 'culture-driver',
        title: 'Культура как драйвер управления',
        title_en: 'Culture as a management driver',
        short: 'от стратегии к ежедневной работе',
        short_en: 'from strategy to daily work',
        description: 'Как культура связывает стратегию с ежедневной работой организации.',
        description_en: "How culture connects strategy to the organisation's day-to-day work.",
      },
      {
        id: 'effectiveness',
        title: 'От эффективности к результативности',
        title_en: 'From efficiency to effectiveness',
        short: 'пять управленческих сил',
        short_en: 'five management forces',
        description: 'Пять управленческих сил: от понимания организации до её устойчивого движения вперёд.',
        description_en: "Five management forces: from understanding the organisation to its sustained forward motion.",
      },
    ],
    days: [
      {
        day: 1,
        title: 'Видение цифровой стратегии',
        title_en: 'The vision behind the digital strategy',
        description: 'Финансовый центр Ping An: формирование видения цифровой стратегии.',
        description_en: "Ping An's financial centre: building the vision behind the digital strategy.",
      },
      {
        day: 2,
        title: 'Цифровое управление и культура',
        title_en: 'Digital management and culture',
        description: 'Финансовый институт Ping An: практика цифрового управления и воплощение культуры в реальных процессах.',
        description_en:
          "Ping An's financial institute: digital management in practice and how culture is embedded into real processes.",
      },
      {
        day: 3,
        title: 'Организация и кадры',
        title_en: 'Organisation and people',
        description: 'Практикум по организационному действию и развитию кадров в условиях цифровой трансформации.',
        description_en: 'A workshop on organisational action and people development under digital transformation.',
      },
    ],
    format: {
      duration: '3 дня',
      duration_en: '3 days',
      nights: '4',
      groupSize: 'от 10 человек',
      groupSize_en: '10+ people',
      price: 'по запросу',
      price_en: 'on request',
      included: ['программа', 'перевод', 'проживание, трансфер, визовая поддержка — по запросу'],
      included_en: ['programme', 'interpreting', 'accommodation, transfers, visa support — on request'],
      dates: 'по запросу',
      dates_en: 'on request',
    },
    cardTitle: 'Цифровая стратегия финансов',
    cardTitle_en: 'Digital strategy in finance',
    cardTeaser: 'Цифровая трансформация в масштабах топ-10 финансовой компании мира',
    cardTeaser_en: 'Digital transformation at the scale of a top-10 global financial company',
  },
]

export function getCorporateProgram(slug: string) {
  return corporatePrograms.find((p) => p.slug === slug)
}

/** Predictable static-asset paths for hero/gallery photos, filled in later
 * directly on the VPS via GitHub — see corporateTrainingImages.ts. */
export const HUB_FAQ: { question: string; question_en: string; answer: string; answer_en: string }[] = [
  {
    question: 'Сколько человек в группе?',
    question_en: 'How many people are in a group?',
    answer: 'От 10 человек — группа набирается индивидуально под компанию.',
    answer_en: 'From 10 people — the group is put together individually for each company.',
  },
  {
    question: 'Нужно ли знание китайского или английского языка?',
    question_en: 'Do you need to know Chinese or English?',
    answer: 'Нет, перевод обеспечен на всех мероприятиях программы.',
    answer_en: 'No, interpreting is provided at every event in the programme.',
  },
  {
    question: 'Можно ли заказать индивидуальную дату для своей компании?',
    question_en: 'Can we request a custom date for our company?',
    answer: 'Да, даты и условия программы под вашу компанию — по запросу.',
    answer_en: 'Yes — dates and programme terms tailored to your company are available on request.',
  },
  {
    question: 'Что входит в стоимость?',
    question_en: "What's included in the price?",
    answer: 'Программа, переводчик, трансфер по программе; проживание и визовая поддержка — по запросу.',
    answer_en:
      'The programme itself, an interpreter, and transfers within the programme; accommodation and visa support are available on request.',
  },
]

export const WHY_US_POINTS = [
  'Программа и материалы — на русском языке, включая перевод на встречах',
  'Мы не просто показываем компанию — помогаем довести знакомство до предметных переговоров',
  'Полное сопровождение: визы, логистика, размещение, локальная поддержка на месте',
]

export const WHY_US_POINTS_EN = [
  'Programme and materials are provided in Russian, including interpreting at every meeting',
  "We don't just show you the company — we help turn the visit into substantive business talks",
  'Full support: visas, logistics, accommodation, local support on the ground',
]

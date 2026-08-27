/**
 * Content for the "Три технологические экспедиции" (three technological
 * expeditions) methodology block on /corporate-training/materials.
 *
 * Kept as a plain data module (same convention as corporateTraining.ts):
 * every `xyz` field carries a sibling `xyz_en`, Russian is the source of
 * truth. This is page-specific content (unlike the open-ended
 * materials/*.json library), so it lives in one file rather than one
 * JSON per entry.
 */

export interface ExpeditionTab {
  id: string
  /** "01" / "02" / "03" — reuses the numbered-card style from the Huawei page. */
  numberLabel: string
  tabTitle: string
  tabTitle_en: string
  badge: string
  badge_en: string
  title: string
  title_en: string
  lede: string
  lede_en: string
  whatWeSee: string[]
  whatWeSee_en: string[]
  whoWeMeet: string[]
  whoWeMeet_en: string[]
  calloutTitle: string
  calloutTitle_en: string
  calloutText: string
  calloutText_en: string
  /** Which icon to show on the callout — null for the first tab (no icon in the brief). */
  calloutIcon: 'clock' | 'globe' | null
  /** Position, in percent of the diagram image, of the word this tab corresponds to. */
  hotspot: { x: number; y: number }
}

export const expeditionTabs: ExpeditionTab[] = [
  {
    id: 'product',
    numberLabel: '01',
    tabTitle: 'Продукт и рецептура',
    tabTitle_en: 'Product & Recipe',
    badge: 'Основная экспедиция серии',
    badge_en: 'Core expedition of the series',
    title: 'Продукт и рецептура',
    title_en: 'Product and Recipe',
    lede:
      'Стержневая экспедиция серии: неразрывно связана с R&D и управлением брендом, поэтому идёт в связке с самим продуктом, а не отдельно от него.',
    lede_en:
      "The backbone expedition of the series: inseparable from R&D and brand management, so it's tied directly to the product rather than run separately.",
    whatWeSee: [
      'Формат подачи и позиционирование бренда на месте — торговый зал, зона кухни (открытая/закрытая), сервисная модель',
      'R&D-процесс: как создаётся и обновляется меню, кто принимает решения, частота ротации блюд',
      'Юнит-экономику точки — состав меню, средний чек, оборачиваемость столов',
      'Франчайзинговую или прямую модель управления сетью, стандарты воспроизводимости бренда между точками',
      'Брендинг и клиентский опыт — от вывески до цифровых интерфейсов заказа',
    ],
    whatWeSee_en: [
      'Presentation format and brand positioning on site — dining area, kitchen zone (open/closed), service model',
      'The R&D process: how the menu is created and updated, who makes the decisions, how often dishes rotate',
      'Unit economics of the outlet — menu composition, average check, table turnover',
      'Franchise or direct network management model, standards for replicating the brand across locations',
      'Branding and customer experience — from signage to digital ordering interfaces',
    ],
    whoWeMeet: [
      'Представители франчайзингового/BD-отдела бренда',
      'По возможности — R&D-команда или бренд-менеджмент (для флагманских брендов с системной корпоративной структурой)',
    ],
    whoWeMeet_en: [
      "Representatives of the brand's franchising/BD department",
      'Where possible — the R&D team or brand management (for flagship brands with a structured corporate setup)',
    ],
    calloutTitle: 'Почему это главная экспедиция',
    calloutTitle_en: 'Why this is the lead expedition',
    calloutText:
      'Рецептура и продукт — точка сборки всего остального: именно тут принимаются решения, какое сырьё и какая упаковка нужны бренду. Эта экспедиция логически идёт первой и остаётся центральной осью серии — две другие её обслуживают, а не наоборот.',
    calloutText_en:
      "The recipe and the product are the assembly point for everything else: this is where decisions are made about what raw materials and what packaging the brand needs. That's why this expedition logically comes first and stays the central axis of the series — the other two serve it, not the other way around.",
    calloutIcon: null,
    hotspot: { x: 50, y: 82 },
  },
  {
    id: 'raw-materials',
    numberLabel: '02',
    tabTitle: 'Сырьё и ингредиенты',
    tabTitle_en: 'Raw Materials & Ingredients',
    badge: 'Экспедиция 2',
    badge_en: 'Expedition 2',
    title: 'Сырьё и ингредиенты',
    title_en: 'Raw Materials and Ingredients',
    lede:
      'Отдельная поездка к производителям сырья, которое ранее было замечено «на кухне» в первой экспедиции — с целью увидеть его происхождение и технологию изготовления.',
    lede_en:
      "A separate trip to the producers of raw materials first spotted 'in the kitchen' during the first expedition — to see their origin and manufacturing technology.",
    whatWeSee: [
      'Производственные линии — от собственных заводов брендов (вертикальная интеграция) до независимых B2B-поставщиков специй, соусов, мясной продукции, теста',
      'Технологию производства хого-баз, компаунд-приправ, замороженных полуфабрикатов',
      'Системы контроля качества, сертификацию (FDA и аналоги), лабораторную базу',
      'Логистику и цепочку поставок — от фермы/сырья до центральной кухни бренда',
      'Условия сотрудничества: MOQ, экспортные возможности, готовность к работе с зарубежными партнёрами',
    ],
    whatWeSee_en: [
      "Production lines — from brands' own factories (vertical integration) to independent B2B suppliers of spices, sauces, meat products, dough",
      'The technology behind hotpot bases, compound seasonings, frozen semi-finished products',
      'Quality control systems, certification (FDA and equivalents), lab facilities',
      "Logistics and the supply chain — from farm/raw material to the brand's central kitchen",
      'Terms of cooperation: MOQ, export capabilities, readiness to work with foreign partners',
    ],
    whoWeMeet: [
      'Отделы продаж/экспорта заводов-поставщиков',
      'Для публичных компаний — представители IR (investor relations), что даёт более системный и верифицируемый канал переговоров',
    ],
    whoWeMeet_en: [
      'Sales/export departments of supplier factories',
      'For public companies — IR (investor relations) representatives, which gives a more systematic, verifiable negotiation channel',
    ],
    calloutTitle: 'Особенность организации',
    calloutTitle_en: 'A note on logistics',
    calloutText:
      'В отличие от визита в ресторан, доступ на производственную площадку требует более длительного согласования: заявки заранее, иногда — подписания NDA, соблюдения санитарных норм при заходе в цех. Закладывайте организацию этой экспедиции с большим запасом по времени, чем экспедиции 1.',
    calloutText_en:
      'Unlike a restaurant visit, access to a production site requires longer lead time: advance applications, sometimes an NDA, compliance with sanitary rules to enter the floor. Plan for more lead time on this expedition than on Expedition 1.',
    calloutIcon: 'clock',
    hotspot: { x: 26, y: 28 },
  },
  {
    id: 'packaging',
    numberLabel: '03',
    tabTitle: 'Упаковка и материалы',
    tabTitle_en: 'Packaging & Materials',
    badge: 'Экспедиция 3',
    badge_en: 'Expedition 3',
    title: 'Упаковка и сопутствующие материалы',
    title_en: 'Packaging and Related Materials',
    lede:
      'Замыкающая экспедиция серии — посвящена материальному воплощению бренда в таре, этикетке и сопутствующих расходных материалах.',
    lede_en:
      "The closing expedition of the series — dedicated to the brand's physical presence in containers, labels, and related consumables.",
    whatWeSee: [
      'Производство одноразовой посуды и тары — от биоразлагаемых материалов (PLA, formed pulp) до классического пластика/бумаги',
      'Технологию кастомизации упаковки под конкретный бренд (нанесение логотипа, форм-факторы)',
      'Экологические стандарты и сертификацию — тема, критичная для брендов с ESG-повесткой',
      'Производственные мощности и минимальные партии для международных заказов',
    ],
    whatWeSee_en: [
      'Production of disposable tableware and containers — from biodegradable materials (PLA, formed pulp) to classic plastic/paper',
      'The technology of customizing packaging for a specific brand (logo application, form factors)',
      'Environmental standards and certification — a critical topic for brands with an ESG agenda',
      'Production capacity and minimum order quantities for international orders',
    ],
    whoWeMeet: [
      'Отделы продаж и R&D-центры производителей упаковки (у крупных публичных игроков часто есть собственные лаборатории разработки материалов)',
    ],
    whoWeMeet_en: [
      'Sales departments and R&D centers of packaging manufacturers (large public players often have their own material-development labs)',
    ],
    calloutTitle: 'Особенность рынка',
    calloutTitle_en: 'A note on the market',
    calloutText:
      'Рынок упаковки в Китае сильнее консолидирован географически и корпоративно, чем рынок сырья: крупнейшие производители сосредоточены в нескольких промышленных кластерах и в большинстве своём — публичные компании с прозрачной отчётностью, что упрощает верификацию и выход на официальный контакт по сравнению с частными нишевыми поставщиками сырья.',
    calloutText_en:
      "China's packaging market is more geographically and corporately consolidated than the raw-materials market: the largest producers are concentrated in a handful of industrial clusters and are mostly public companies with transparent reporting, which makes verification and reaching an official contact easier than with private, niche raw-material suppliers.",
    calloutIcon: 'globe',
    hotspot: { x: 74, y: 28 },
  },
]

export interface SeriesLogicColumn {
  numberLabel: string
  title: string
  title_en: string
  audience: string
  audience_en: string
  accessDifficulty: string
  accessDifficulty_en: string
  brandLink: string
  brandLink_en: string
}

export const seriesLogicColumns: SeriesLogicColumn[] = [
  {
    numberLabel: '01',
    title: 'Продукт',
    title_en: 'Product',
    audience: 'Рестораторы, инвесторы во франшизу',
    audience_en: 'Restaurateurs, franchise investors',
    accessDifficulty: 'Средне-высокая',
    accessDifficulty_en: 'Medium-high',
    brandLink: 'Прямая, центральная',
    brandLink_en: 'Direct, central',
  },
  {
    numberLabel: '02',
    title: 'Сырьё',
    title_en: 'Raw Materials',
    audience: 'Закупщики, дистрибьюторы HoReCa',
    audience_en: 'Buyers, HoReCa distributors',
    accessDifficulty: 'Средне-высокая',
    accessDifficulty_en: 'Medium-high',
    brandLink: 'Через рецептуру бренда',
    brandLink_en: "Through the brand's recipe",
  },
  {
    numberLabel: '03',
    title: 'Упаковка',
    title_en: 'Packaging',
    audience: 'Упаковочные дистрибьюторы, OEM-партнёры',
    audience_en: 'Packaging distributors, OEM partners',
    accessDifficulty: 'Средне-высокая',
    accessDifficulty_en: 'Medium-high',
    brandLink: 'Через рецептуру бренда',
    brandLink_en: "Through the brand's recipe",
  },
]

export interface CaseStudyRow {
  numberLabel: string
  title: string
  title_en: string
  text: string
  text_en: string
}

export const caseStudyRows: CaseStudyRow[] = [
  {
    numberLabel: '01',
    title: 'Продукт и рецептура',
    title_en: 'Product & Recipe',
    text: 'Формула напитка и меню, скорость обновления сезонных вкусов, формат точки (киоск / кофейня с посадкой), приложение для заказа.',
    text_en: 'The drink formula and menu, how fast seasonal flavors rotate, the outlet format (kiosk vs. seated café), the ordering app.',
  },
  {
    numberLabel: '02',
    title: 'Сырьё и ингредиенты',
    title_en: 'Raw Materials & Ingredients',
    text: 'Обжарочные производства, поставщики кофейных зёрен, растительного молока, сиропов и топингов.',
    text_en: 'Roasting facilities, suppliers of coffee beans, plant-based milk, syrups, and toppings.',
  },
  {
    numberLabel: '03',
    title: 'Упаковка и материалы',
    title_en: 'Packaging & Materials',
    text: 'Стаканы, крышки, трубочки, пакеты на вынос — материаловедение и кастомизация под бренд.',
    text_en: 'Cups, lids, straws, takeout bags — materials and brand customization.',
  },
]

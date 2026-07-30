// Canonical FAQ content for /faq — the ru text is client-approved and must
// be published verbatim (see the brief this was built from). The en text is
// our own translation for the site's English locale; no canonical en source
// was provided.

export type FaqBlock =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }

export interface FaqItem {
  id: string
  group: 'program' | 'requirements' | 'logistics'
  question_ru: string
  question_en: string
  blocks_ru: FaqBlock[]
  blocks_en: FaqBlock[]
}

export interface FaqGroup {
  id: 'program' | 'requirements' | 'logistics'
  title_ru: string
  title_en: string
}

export const FAQ_GROUPS: FaqGroup[] = [
  { id: 'program', title_ru: 'Организация и программа', title_en: 'Organisation & programme' },
  { id: 'requirements', title_ru: 'Польза и требования', title_en: 'Value & requirements' },
  { id: 'logistics', title_ru: 'Организация поездки', title_en: 'Trip logistics' },
]

/** Directions list reused by FAQ-01's answer and the CTA form's select. */
export const FAQ_DIRECTIONS: { ru: string; en: string }[] = [
  { ru: 'Робототехника и гуманоиды', en: 'Robotics and humanoids' },
  { ru: 'Промышленная автоматизация, коботы, сварочные комплексы', en: 'Industrial automation, cobots, welding complexes' },
  {
    ru: 'Складская логистика и интралогистика: AMR, AGV, сортировочные системы',
    en: 'Warehouse and intralogistics: AMR, AGV, sorting systems',
  },
  { ru: 'Пищевые производства и центральные кухни, включая 预制菜', en: 'Food production and central kitchens, including 预制菜 (pre-made dishes)' },
  { ru: 'AI, LLM, цифровые экосистемы', en: 'AI, LLM, digital ecosystems' },
  { ru: 'Медтех, биотех, лабораторная автоматизация', en: 'Medtech, biotech, lab automation' },
  { ru: 'Новая энергетика, электротранспорт, автопром', en: 'New energy, EVs, automotive' },
]

/** Editable "actual as of" stamp for the visa block — recheck quarterly. */
export const VISA_INFO_ACTUAL_DATE = '30.07.2026'

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'companies',
    group: 'program',
    question_ru: 'Какие конкретно компании и заводы мы увидим?',
    question_en: 'Which specific companies and factories will we see?',
    blocks_ru: [
      {
        type: 'p',
        text: 'Состав предприятий определяется в рамках выбранной программы, фиксируется в договоре и подтверждается за 2–6 недель до выезда — конкретный срок зависит от направления и графика приёма у принимающей стороны. Раньше не подтверждаем сознательно: технологический ландшафт в Китае меняется быстро, и мы не хотим привезти вас на площадку, которая к моменту визита перестала быть интересной.',
      },
      {
        type: 'p',
        text: 'Основа отбора — наша собственная отраслевая база: **более 350 китайских компаний**, размеченных по макроотраслям и регионам, с оценкой того, кто из них уже принимает иностранные делегации и на каком уровне. База постоянно пополняется и обновляется: мы добавляем новые площадки, пересматриваем актуальность прежних и убираем те, что перестали давать содержательный доступ. С частью предприятий мы работаем напрямую, как коммерческий партнёр, без посредников — это принципиально другой уровень приёма, визит партнёра к партнёру, а не экскурсия по билету.',
      },
      { type: 'p', text: 'Направления, по которым мы формируем программы:' },
      {
        type: 'ul',
        items: [
          'Робототехника и гуманоиды',
          'Промышленная автоматизация, коботы, сварочные комплексы',
          'Складская логистика и интралогистика: AMR, AGV, сортировочные системы',
          'Пищевые производства и центральные кухни, включая 预制菜',
          'AI, LLM, цифровые экосистемы',
          'Медтех, биотех, лабораторная автоматизация',
          'Новая энергетика, электротранспорт, автопром',
        ],
      },
      {
        type: 'p',
        text: 'Возможен смешанный запрос — например, пищевое производство плюс роботизация линии, или автопром плюс промышленные коботы. На практике это и есть реальная задача большинства заказчиков.',
      },
      { type: 'p', text: 'Конкретный маршрут и список площадок мы собираем под вашу задачу и обсуждаем на личной встрече.' },
    ],
    blocks_en: [
      {
        type: 'p',
        text: 'The roster of companies is defined within the chosen programme, fixed in the contract, and confirmed 2–6 weeks before departure — the exact timing depends on the direction and the host side\'s scheduling. We deliberately don\'t confirm it earlier: China\'s technology landscape moves fast, and we don\'t want to bring you to a site that has stopped being relevant by the time you visit.',
      },
      {
        type: 'p',
        text: 'Selection is built on our own industry database: **over 350 Chinese companies**, tagged by macro-sector and region, each rated on whether — and at what level — it already hosts foreign delegations. The database is continuously expanded and refreshed: we add new sites, re-check the relevance of existing ones, and drop those that stopped giving substantive access. With some companies we work directly, as a commercial partner, with no intermediaries — a fundamentally different level of reception, a partner-to-partner visit rather than a ticketed tour.',
      },
      { type: 'p', text: 'Directions we build programmes around:' },
      {
        type: 'ul',
        items: [
          'Robotics and humanoids',
          'Industrial automation, cobots, welding complexes',
          'Warehouse and intralogistics: AMR, AGV, sorting systems',
          'Food production and central kitchens, including 预制菜 (pre-made dishes)',
          'AI, LLM, digital ecosystems',
          'Medtech, biotech, lab automation',
          'New energy, EVs, automotive',
        ],
      },
      {
        type: 'p',
        text: 'Mixed requests are welcome — food production plus line robotisation, say, or automotive plus industrial cobots. In practice that is the real brief for most clients.',
      },
      { type: 'p', text: 'The specific route and site list is put together for your brief and discussed in person.' },
    ],
  },
  {
    id: 'qa-access',
    group: 'program',
    question_ru: 'Будет ли возможность задать вопросы инженерам и руководству?',
    question_en: 'Will there be a chance to ask engineers and leadership questions?',
    blocks_ru: [
      { type: 'p', text: 'Да, это ядро продукта, а не бонус. Каждый визит устроен одинаково, независимо от направления:' },
      {
        type: 'ol',
        items: [
          '**Установочная сессия в автобусе, 20–30 минут.** Консультант по бенчмаркинг-визитам разбирает с группой, на что смотреть и какие вопросы задавать. Мы входим на площадку с вопросами, а не глазеть.',
          '**Осмотр производства или R&D-зоны** в сопровождении технического специалиста принимающей стороны.',
          '**Тематическая сессия и свободный Q&A, 45–60 минут** с профильным руководителем: кейсы внедрения в вашей отрасли, экономика проекта, модели сотрудничества, условия поставки и локализации, меры господдержки.',
          '**Разбор итогов вечером** — фиксируем выводы и следующие шаги по каждому контакту, пока они не размылись.',
        ],
      },
      {
        type: 'p',
        text: 'Если у вас конкретная задача — закупка линии, поиск OEM-партнёра, оценка технологии перед инвестицией — пришлите вопросы сразу после того, как состав программы подтверждён. Мы передаём их принимающей стороне заранее, чтобы за столом сидели люди, которые могут ответить, а не служба протокола.',
      },
    ],
    blocks_en: [
      { type: 'p', text: 'Yes — this is the core of the product, not a bonus. Every visit follows the same structure, regardless of direction:' },
      {
        type: 'ol',
        items: [
          '**A 20–30 minute briefing on the bus.** Our benchmarking-visit consultant walks the group through what to look for and what to ask. We walk onto the site with questions, not just to look around.',
          '**A tour of the production or R&D area**, guided by a technical specialist from the host side.',
          '**A 45–60 minute themed session and open Q&A** with a senior manager: adoption cases in your industry, project economics, partnership models, supply and localisation terms, government-support measures.',
          '**An evening debrief** — we fix the takeaways and next steps for every contact before they blur together.',
        ],
      },
      {
        type: 'p',
        text: 'If you have a specific task — sourcing a line, finding an OEM partner, evaluating a technology before investing — send your questions as soon as the programme roster is confirmed. We pass them to the host side in advance, so the people at the table can actually answer, not just handle protocol.',
      },
    ],
  },
  {
    id: 'relevance',
    group: 'program',
    question_ru: 'Насколько актуальна программа и передовые ли это технологии?',
    question_en: 'How current is the programme, and is the technology actually cutting-edge?',
    blocks_ru: [
      { type: 'p', text: 'Три механизма, которые за это отвечают:' },
      {
        type: 'ul',
        items: [
          '**Маршрут пересобирается под каждую группу.** Готовых «замороженных» программ мы не продаём: в робототехнике и в пищевых технологиях полугодовой лаг уже критичен.',
          '**Мы идём внутрь промышленных кластеров, а не по отдельным заводам.** Ключевые кластеры, с которыми мы работаем, концентрируют по несколько сотен профильных компаний каждый и дают до половины отраслевого выпуска своего региона. Внутри кластера вы видите производственную цепочку, а не одну витрину.',
          '**Приоритет площадкам с подтверждённой практикой приёма иностранных делегаций.** У нас задокументированы конкретные прецеденты — вплоть до приёма делегаций из десятков стран одновременно. Мы не «пробиваем» доступ впервые за ваш счёт.',
        ],
      },
      {
        type: 'p',
        text: 'Отдельно про честность формулировок: часть площадок покажет действующее производство, часть — демонстрационный центр и R&D. Мы всегда указываем в программе, что именно за объект, до подписания договора.',
      },
    ],
    blocks_en: [
      { type: 'p', text: 'Three mechanisms make sure of that:' },
      {
        type: 'ul',
        items: [
          '**The route is rebuilt for every group.** We don\'t sell a frozen, off-the-shelf programme: in robotics and food technology, a six-month lag is already critical.',
          '**We go inside industrial clusters, not to individual factories.** The key clusters we work in concentrate several hundred specialised companies each and account for up to half of their region\'s industry output. Inside a cluster you see the production chain, not a single showcase.',
          '**Priority goes to sites with a proven track record of hosting foreign delegations.** We have documented precedents — including hosting delegations from dozens of countries at once. We\'re not "breaking in" access for the first time on your dime.',
        ],
      },
      {
        type: 'p',
        text: 'On honesty of framing: some sites will show live production, others a demo centre and R&D. We always specify exactly what kind of site it is in the programme, before the contract is signed.',
      },
    ],
  },
  {
    id: 'language',
    group: 'requirements',
    question_ru: 'Нужен ли английский язык или специальное техническое образование?',
    question_en: 'Do I need English or a technical background?',
    blocks_ru: [
      { type: 'p', text: 'Нет ни того, ни другого.' },
      {
        type: 'p',
        text: 'Профессиональный переводчик китайский–русский работает с группой все дни, включая технические сессии и переговоры о поставках. Английский на площадках вторичен: значительная часть китайских инженеров владеет им хуже, чем принято ожидать, поэтому мы изначально строим прямой русско-китайский канал вместо двойного перевода. Для узких направлений — медтех, биотех, химия, пищевые технологии — привлекаем переводчика с профильной терминологией.',
      },
      {
        type: 'p',
        text: 'Техническое образование не требуется. Установочные сессии выравнивают контекст для всей группы, а акценты мы даём разные: собственник, коммерческий директор и главный инженер смотрят на один и тот же объект по-разному. Практика показывает, что нетехнические руководители выносят с таких визитов не меньше — они видят бизнес-модель, а не только оборудование.',
      },
    ],
    blocks_en: [
      { type: 'p', text: 'Neither.' },
      {
        type: 'p',
        text: 'A professional Chinese–Russian interpreter works with the group every day, including technical sessions and supply negotiations. English matters less on-site than you\'d expect: many Chinese engineers speak it worse than commonly assumed, so we build a direct Russian–Chinese channel from the start instead of double translation. For narrow fields — medtech, biotech, chemistry, food technology — we bring in an interpreter with the relevant terminology.',
      },
      {
        type: 'p',
        text: 'No technical background is required. Briefing sessions level the context for the whole group, and we frame each stop differently: an owner, a commercial director, and a chief engineer look at the same site very differently. In practice, non-technical leaders get just as much out of these visits — they read the business model, not only the equipment.',
      },
    ],
  },
  {
    id: 'photo-video',
    group: 'requirements',
    question_ru: 'Можно ли делать фото и видео на производствах?',
    question_en: 'Can we take photos and video at the production sites?',
    blocks_ru: [
      { type: 'p', text: 'Отвечаем прямо, потому что от этого зависят ожидания.' },
      {
        type: 'ul',
        items: [
          '**Демонстрационные залы, шоурумы, выставочные и испытательные зоны** — съёмка разрешена и приветствуется. Это 70–80% визуально ценного материала.',
          '**Действующие линии и R&D-лаборатории** — по разрешению принимающей стороны, часто с ограничением по участкам: здесь можно, за эту линию — нет.',
          '**Отдельные зоны закрыты полностью.** Часть компаний просит подписать NDA перед входом — мы согласовываем это заранее и предупреждаем до визита.',
        ],
      },
      {
        type: 'p',
        text: 'Отраслевой нюанс: на пищевых производствах и в чистых помещениях — медтех, микроэлектроника — личные телефоны и камеры в производственную зону нередко не проносят вообще. Это требование гигиены и стандарта, а не секретности.',
      },
      {
        type: 'p',
        text: 'Правило простое: перед каждым объектом сопровождающий объявляет режим съёмки по зонам. Не снимаем то, о чём не сказано «можно». Один инцидент закрывает площадку для всех будущих групп, и мы этим не рискуем.',
      },
      {
        type: 'p',
        text: 'При этом снимать самому не обязательно: с делегацией работает мобилограф, и по итогам поездки вы получаете готовый профессиональный фото- и видеопакет — материал под корпоративные соцсети, отчёт совету директоров или внутреннюю презентацию. Для небольших делегаций эта услуга подключается по запросу.',
      },
    ],
    blocks_en: [
      { type: 'p', text: 'A direct answer, because it shapes expectations.' },
      {
        type: 'ul',
        items: [
          '**Demo halls, showrooms, exhibition and testing areas** — shooting is allowed and welcomed. This is 70–80% of the visually valuable material.',
          '**Live lines and R&D labs** — subject to the host\'s permission, often with area-by-area limits: fine here, not past this line.',
          '**Some areas are fully closed.** Some companies ask for an NDA before entry — we arrange that in advance and flag it before the visit.',
        ],
      },
      {
        type: 'p',
        text: 'An industry nuance: in food production and cleanrooms — medtech, microelectronics — personal phones and cameras are often not allowed into the production area at all. That\'s a hygiene and standards requirement, not secrecy.',
      },
      {
        type: 'p',
        text: 'The rule is simple: before each site, the group leader announces the shooting rules zone by zone. We don\'t shoot anything that hasn\'t been cleared. One incident closes a site to every future group, and we don\'t take that risk.',
      },
      {
        type: 'p',
        text: 'You don\'t need to shoot it yourself, either: a videographer travels with the delegation, and at the end of the trip you get a ready professional photo and video package — material for corporate social media, a board report, or an internal presentation. For smaller delegations this service is added on request.',
      },
    ],
  },
  {
    id: 'what-to-bring',
    group: 'requirements',
    question_ru: 'Что привезти с собой?',
    question_en: 'What should I bring?',
    blocks_ru: [
      { type: 'h', text: 'Обязательно' },
      {
        type: 'ul',
        items: [
          'Загранпаспорт со сроком действия не менее 6 месяцев от даты выезда',
          'Визитки, 80–100 штук. В Китае обмен визитками — обязательный ритуал открытия разговора, а не формальность. Оптимально двусторонние, с китайской стороной; при необходимости подготовим вам китайский вариант до выезда',
          'Закрытая удобная обувь: на производства не пускают в открытой обуви и на каблуках, ходим много',
          'Дресс-код business casual на визиты, один деловой комплект на официальные приёмы',
        ],
      },
      { type: 'h', text: 'Техника' },
      {
        type: 'ul',
        items: [
          'Ноутбук или планшет плюс бумажный блокнот — на технических сессиях писать от руки быстрее',
          'Переходник на китайскую розетку, тип A/I, 220 В',
          'Про пауэрбанк: если программа включает внутренние перелёты, внешние аккумуляторы без маркировки CCC на борт не пропустят. Берите сертифицированный либо не берите вовсе',
          'До выезда установите и настройте: WeChat с привязанной картой, Alipay, офлайн-переводчик, VPN. На месте настраивать сложнее',
        ],
      },
      { type: 'h', text: 'Полезное' },
      {
        type: 'ul',
        items: [
          '2–3 корпоративных сувенира с логотипом вашей компании: ответный подарок принимающей стороне ценится очень высоко и заметно меняет тон разговора',
          'Личная аптечка',
          'Немного наличных юаней на карманные расходы — основные платежи проходят по QR',
          'Для пищевых производств и чистых помещений: минимум парфюма и косметики, снимаемые украшения. Халаты, шапочки и бахилы выдаёт площадка',
        ],
      },
    ],
    blocks_en: [
      { type: 'h', text: 'Required' },
      {
        type: 'ul',
        items: [
          'A passport valid for at least 6 months from the departure date',
          'Business cards, 80–100 of them. In China exchanging business cards is a mandatory ritual for opening a conversation, not a formality. Bilingual, double-sided cards work best — we can prepare a Chinese version for you before departure if needed',
          'Closed, comfortable shoes: open shoes and heels aren\'t allowed on production floors, and there\'s a lot of walking',
          'Business-casual for site visits, one formal outfit for official receptions',
        ],
      },
      { type: 'h', text: 'Tech' },
      {
        type: 'ul',
        items: [
          'A laptop or tablet plus a paper notebook — handwriting is faster in technical sessions',
          'A China-compatible plug adapter, type A/I, 220V',
          'On power banks: if the programme includes domestic flights, unmarked power banks without CCC certification won\'t be allowed on board. Bring a certified one or none at all',
          'Set up before departure: WeChat with a card linked, Alipay, an offline translator app, a VPN. Harder to configure once you\'re there',
        ],
      },
      { type: 'h', text: 'Nice to have' },
      {
        type: 'ul',
        items: [
          '2–3 corporate gifts with your company\'s logo: a reciprocal gift is valued highly by the host side and noticeably shifts the tone of the conversation',
          'A personal first-aid kit',
          'A little cash in yuan for pocket expenses — most payments run through QR codes',
          'For food plants and cleanrooms: minimal perfume and makeup, removable jewellery. Gowns, caps and shoe covers are provided on-site',
        ],
      },
    ],
  },
  {
    id: 'included',
    group: 'logistics',
    question_ru: 'Что входит в участие?',
    question_en: 'What\'s included in the participation package?',
    blocks_ru: [
      { type: 'p', text: 'В пакет участника входит:' },
      {
        type: 'ul',
        items: [
          '**Проживание** в проверенных отелях класса 4–5★ рядом с деловыми кластерами маршрута. Конкретный уровень размещения фиксируется в договоре, апгрейд возможен по запросу',
          '**Питание** — завтраки, обеды и ужины все дни программы',
          '**Транспорт** — комфортабельный автобус на весь тур, все трансферы аэропорт–отель–объект, перелёты между городами внутри Китая',
          '**Программа** — организация доступа и приёма на предприятиях, все технические сессии и Q&A с руководством',
          '**Сопровождение** — переводчик китайский–русский, консультант по бенчмаркинг-визитам, координатор группы',
          '**Медиа** — работа мобилографа и готовый фото- и видеопакет по итогам поездки',
          '**Документы** — страхование участников, организационное и визовое сопровождение',
        ],
      },
      {
        type: 'p',
        text: 'Не входит: международный авиаперелёт, личные расходы и покупки, алкоголь вне групповых ужинов, дополнительные ночи до и после программы. Авиабилеты мы подбираем и бронируем по вашему запросу отдельно — так вы не переплачиваете за наш тариф и можете использовать собственные мили или бизнес-класс.',
      },
      {
        type: 'p',
        text: 'Стоимость участия зависит от направления, числа городов, глубины программы и размера делегации. Мы считаем её под вашу задачу и обсуждаем лично — присылайте вводные, и мы вернёмся с расчётом.',
      },
    ],
    blocks_en: [
      { type: 'p', text: 'The participation package includes:' },
      {
        type: 'ul',
        items: [
          '**Accommodation** in vetted 4–5★ hotels near the route\'s business clusters. The exact tier is fixed in the contract; an upgrade is available on request',
          '**Meals** — breakfast, lunch and dinner every day of the programme',
          '**Transport** — a comfortable bus for the whole tour, all airport–hotel–site transfers, and inter-city flights within China',
          '**Programme** — arranging access and reception at the companies, all technical sessions and Q&A with leadership',
          '**Support** — a Chinese–Russian interpreter, a benchmarking-visit consultant, a group coordinator',
          '**Media** — a videographer and a finished photo/video package at the end of the trip',
          '**Documents** — participant insurance, organisational and visa support',
        ],
      },
      {
        type: 'p',
        text: 'Not included: the international flight, personal expenses and purchases, alcohol outside group dinners, extra nights before or after the programme. We source and book flights separately on request — so you don\'t pay a markup on our rate and can use your own miles or fly business.',
      },
      {
        type: 'p',
        text: 'The cost of participation depends on the direction, the number of cities, how deep the programme goes, and the delegation size. We price it for your brief and discuss it in person — send us the basics and we\'ll come back with a quote.',
      },
    ],
  },
  {
    id: 'visa',
    group: 'logistics',
    question_ru: 'Как оформляется виза и нужна ли помощь с документами?',
    question_en: 'How does the visa work, and do you help with documents?',
    blocks_ru: [
      {
        type: 'p',
        text: 'Для граждан России виза не нужна. Действует безвизовый въезд по обычному загранпаспорту на срок до 30 дней, в том числе с деловыми целями. Режим введён 15 сентября 2025 года и продлён МИД КНР до 31 декабря 2027 года — то есть на весь горизонт планирования наших программ.',
      },
      {
        type: 'p',
        text: 'От вас нужен только скан загранпаспорта. Всё остальное — приглашения от принимающих компаний, верификация списка гостей на площадках, страхование, подтверждения бронирований — делаем мы.',
      },
      {
        type: 'p',
        text: 'Для участников с паспортами других стран визовый режим считаем индивидуально и оформляем документы под сопровождение. Сообщите гражданство при бронировании, и мы возьмём этот вопрос на себя.',
      },
    ],
    blocks_en: [
      {
        type: 'p',
        text: 'Russian citizens don\'t need a visa. Visa-free entry on an ordinary passport applies for up to 30 days, including for business purposes. The policy took effect on 15 September 2025 and was extended by China\'s Ministry of Foreign Affairs through 31 December 2027 — covering the full planning horizon of our programmes.',
      },
      {
        type: 'p',
        text: 'All we need from you is a passport scan. Everything else — invitations from the host companies, guest-list verification at the sites, insurance, booking confirmations — is on us.',
      },
      {
        type: 'p',
        text: 'For participants holding other passports, we work out the visa requirement individually and handle the paperwork with support. Tell us your citizenship when booking and we\'ll take care of it.',
      },
    ],
  },
  {
    id: 'free-time',
    group: 'logistics',
    question_ru: 'Будет ли свободное время на отдых и покупку сувениров?',
    question_en: 'Is there free time for rest and souvenir shopping?',
    blocks_ru: [
      {
        type: 'p',
        text: 'Здесь всегда по-разному. Логистика маршрута строится и подстраивается под максимальный формат посещения выбранных предприятий — приоритет у деловой части, потому что именно за ней вы едете. Расписание зависит от того, сколько площадок в программе, насколько они разнесены по городам и как принимающая сторона готова выстроить приём: где-то это полдня на одном объекте, где-то два визита в один день.',
      },
      {
        type: 'p',
        text: 'При этом время под свободную программу и шоппинг всегда можно скорректировать по желанию заказчика — как на этапе согласования маршрута, так и уже на месте. Скажите, что для группы важнее: максимум предприятий в те же дни или более спокойный темп с окнами на город. Мы соберём логистику под выбранный приоритет.',
      },
      {
        type: 'p',
        text: 'Сопровождение с переводчиком в свободное время — по желанию: подскажем и доведём до профильных рынков электроники и комплектующих, сувенирных кварталов и основных достопримечательностей в городах маршрута.',
      },
      {
        type: 'p',
        text: 'Групповые ужины — тоже часть программы, а не только еда: на них обычно и завязываются полезные знакомства внутри самой делегации.',
      },
    ],
    blocks_en: [
      {
        type: 'p',
        text: 'It varies. The route\'s logistics are built and adjusted to maximise visits to the chosen companies — the business programme comes first, since that\'s what you\'re there for. The schedule depends on how many sites are in the programme, how spread out they are across cities, and how the host side is able to structure the reception: sometimes that\'s half a day at one site, sometimes two visits in one day.',
      },
      {
        type: 'p',
        text: 'That said, time for free programme and shopping can always be adjusted to the client\'s preference — both while agreeing the route and once you\'re there. Tell us what matters more to the group: the maximum number of companies in the same days, or a calmer pace with windows for the city. We\'ll build the logistics around that priority.',
      },
      {
        type: 'p',
        text: 'An interpreter for free time is available on request: we\'ll point you to and take you through the electronics and components markets, souvenir districts, and main sights in the route\'s cities.',
      },
      {
        type: 'p',
        text: 'Group dinners are also part of the programme, not just food — that\'s usually where useful connections form within the delegation itself.',
      },
    ],
  },
]

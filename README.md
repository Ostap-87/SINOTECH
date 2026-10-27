# Global Tech Tour · by Aura Robotics

Бенчмаркинг-туры (标杆考察) к лидерам индустрий Китая для бизнес-делегаций. Дизайн-система — **Dala** (чёрный void + фиолетовый акцент), сигнатура — 3D-частицы на three.js, собирающиеся в предмет-символ каждой индустрии.

## Стек

React + TypeScript + Vite + Tailwind CSS v4 + framer-motion + three.js + react-router-dom + lucide-react.

## Разработка

```bash
npm install
npm run dev
```

## Данные

- `src/data/companies.json` — каталог из 438 компаний (17 отраслей, 8 макрорегионов, 47 городов).
- `src/data/tours.json` — готовые туры (Robotics Expedition).
- `src/data/site_content.example.json` — кейсы, блог, контакты.

Типы — `src/types/data.ts`. Загрузка и хелперы — `src/data/index.ts`.

## Продакшн

Живой сайт: https://globaltechtour.ru (`globaltechtour.com` — редирект на него).

Каждый пуш в `claude/sinotech-voyage-setup` автоматически подтягивается на VPS через вебхук (`scripts/webhook-deploy.py`, настраивается один раз через `scripts/setup-webhook.sh`) — `git pull` + `npm ci` + `npm run build`, без ручного захода на сервер. Тот же пуш параллельно собирает preview на Vercel.

nginx отдаёт `dist/` прямо с диска, поэтому сборка **не очищает** `dist/` (`build.emptyOutDir: false` в `vite.config.ts`): новые файлы пишутся рядом со старыми, и сорвавшаяся сборка оставляет живой прежнюю версию. 26.10.2026 очистка + оборванный деплой оставили сайт без `dist/assets` (страницы ссылались на удалённые `/assets/index-*.js` — без стилей, 3D и JS). `scripts/dist-assets.mjs repair` (сразу после `vite build`) подменяет страницы, которые ссылаются на несуществующие файлы, свежей оболочкой SPA; `scripts/dist-assets.mjs prune` (после пререндера) удаляет старые файлы из `dist/assets`, которыми не пользуется ни одна страница и которые старше 48 часов.

## Сборка по шагам

Проект собирается пошагово по спецификации из стартового пакета (`aura_navigator_spec.md`, `homepage_dala_prompt.md`): Шаг 0 — каркас; Шаг 1 — навбар/футер; Шаг 2 — движок частиц; Шаг 3 — hero; Шаг 4 — индустрии + морфинг; Шаг 5 — маркетинговые секции; Шаг 6 — навигатор/конструктор; Шаг 7 — карта маршрута; Шаг 8 — стоимость и PDF; Шаг 9 — заявка; Шаг 10 — контент и полировка.

После каждого шага — показ результата и подтверждение перед следующим.

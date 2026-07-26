# SinoTech Voyage

Сайт для технологического туризма SinoTech Voyage — платформа для организации и продвижения туров, знакомящих путешественников с технологическими достижениями и индустрией.

## Стек

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- ESLint

## Разработка

```bash
npm install
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000).

## Переменные окружения

Скопируйте `.env.example` в `.env.local` и заполните значения:

```bash
cp .env.example .env.local
```

## Деплой

Проект деплоится на [Vercel](https://vercel.com). Продакшн-ветка — `master`, для каждого Pull Request автоматически создаётся preview-деплой.

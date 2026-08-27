# Как добавить новый материал

Это НЕ материал — файл специально сохранён с расширением `.md`, чтобы
`import.meta.glob('./materials/*.json')` в `../materials.ts` его не подхватил.
Используйте его только как образец структуры.

1. Скопируйте блок JSON ниже в новый файл `<slug>.json` в этой же папке
   (`src/data/materials/`), например `src/data/materials/meat-industry-split.json`.
2. Замените поля своими значениями. `slug` должен быть уникальным и
   станет частью URL: `/corporate-training/materials/<slug>/`.
3. Изображения (обложка и картинки в теле) кладутся по путям вида
   `/public/corporate-training/materials/<slug>/cover.jpg`,
   `/public/corporate-training/materials/<slug>/1.jpg`, `2.jpg`, ... —
   ссылайтесь на них в поле `src` блоков типа `image` (без `/public`
   в самом пути, см. пример). Если файла ещё нет — компонент покажет
   аккуратную заглушку, ошибки не будет.
4. Сайт двуязычный: добавьте к `title`, `intro`, `industryTag` и к `text`/
   `items` внутри блоков `body` соответствующие поля `title_en`, `intro_en`,
   `industryTag_en`, `text_en`, `items_en` — так материал сразу появится
   на английской версии страницы (`/en/corporate-training/materials/<slug>/`).
   Поля `_en` необязательны технически (без них страница покажет русский
   текст как запасной вариант), но обязательны по факту — не оставляйте
   материал без перевода.
5. Закоммитьте новый файл и запушьте — материал появится на сайте после
   следующего деплоя, без правок кода.

```json
{
  "slug": "meat-industry-split",
  "title": "Пищевая промышленность: почему один визит не покрывает всю отрасль",
  "title_en": "Food industry: why one visit doesn't cover the whole sector",
  "intro": "Пищевая промышленность распадается на несколько независимых секторов — переработка мяса, молочная продукция, напитки, упаковка. Показываем, как разбить одну большую индустрию на 2-3 отдельные поездки.",
  "intro_en": "The food industry splits into several independent sectors — meat processing, dairy, beverages, packaging. We show how to break one large industry into 2-3 separate trips.",
  "industryTag": "Пищевая промышленность",
  "industryTag_en": "Food industry",
  "date": "2026-08-20",
  "cover": "/corporate-training/materials/meat-industry-split/cover.jpg",
  "body": [
    { "type": "paragraph", "text": "Вступительный абзац материала.", "text_en": "Opening paragraph of the material." },
    { "type": "heading", "text": "Почему один визит не работает", "text_en": "Why one visit doesn't work" },
    { "type": "paragraph", "text": "Основной текст, обычный абзац.", "text_en": "Main body text, a regular paragraph." },
    {
      "type": "list",
      "items": ["Пункт списка 1", "Пункт списка 2", "Пункт списка 3"],
      "items_en": ["List item 1", "List item 2", "List item 3"]
    },
    {
      "type": "image",
      "src": "/corporate-training/materials/meat-industry-split/1.jpg",
      "text": "Подпись/alt для изображения",
      "text_en": "Caption/alt for the image"
    }
  ]
}
```

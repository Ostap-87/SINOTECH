import type { ShapeKey } from '@/three/shapes'

/**
 * Which 3D particle map + display name each previewable country maps to.
 * `accusative_ru`/`preposition_ru` are the "в/во + accusative" form used in
 * phrases like "Бизнес-экспедиции в Японию" — Russian case agreement can't be
 * derived from the nominative name_ru, so it's spelled out per country here.
 */
export const COUNTRY_SHAPES: Record<
  string,
  { shape: ShapeKey; name_ru: string; name_en: string; accusative_ru: string; preposition_ru: 'в' | 'во' }
> = {
  cn: { shape: 'china', name_ru: 'Китай', name_en: 'China', accusative_ru: 'Китай', preposition_ru: 'в' },
  jp: { shape: 'japan', name_ru: 'Япония', name_en: 'Japan', accusative_ru: 'Японию', preposition_ru: 'в' },
  kr: { shape: 'korea', name_ru: 'Корея', name_en: 'Korea', accusative_ru: 'Корею', preposition_ru: 'в' },
  in: { shape: 'india', name_ru: 'Индия', name_en: 'India', accusative_ru: 'Индию', preposition_ru: 'в' },
  th: { shape: 'thailand', name_ru: 'Таиланд', name_en: 'Thailand', accusative_ru: 'Таиланд', preposition_ru: 'в' },
  my: { shape: 'malaysia', name_ru: 'Малайзия', name_en: 'Malaysia', accusative_ru: 'Малайзию', preposition_ru: 'в' },
  id: { shape: 'indonesia', name_ru: 'Индонезия', name_en: 'Indonesia', accusative_ru: 'Индонезию', preposition_ru: 'в' },
  vn: { shape: 'vietnam', name_ru: 'Вьетнам', name_en: 'Vietnam', accusative_ru: 'Вьетнам', preposition_ru: 'во' },
  ae: { shape: 'generic', name_ru: 'ОАЭ', name_en: 'UAE', accusative_ru: 'ОАЭ', preposition_ru: 'в' },
}

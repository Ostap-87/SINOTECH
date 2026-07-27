import type { ShapeKey } from '@/three/shapes'

/** Which 3D particle map + display name each previewable country maps to. */
export const COUNTRY_SHAPES: Record<string, { shape: ShapeKey; name_ru: string; name_en: string }> = {
  cn: { shape: 'china', name_ru: 'Китай', name_en: 'China' },
  jp: { shape: 'japan', name_ru: 'Япония', name_en: 'Japan' },
  kr: { shape: 'korea', name_ru: 'Корея', name_en: 'Korea' },
  in: { shape: 'india', name_ru: 'Индия', name_en: 'India' },
  th: { shape: 'thailand', name_ru: 'Таиланд', name_en: 'Thailand' },
  my: { shape: 'malaysia', name_ru: 'Малайзия', name_en: 'Malaysia' },
  id: { shape: 'indonesia', name_ru: 'Индонезия', name_en: 'Indonesia' },
  vn: { shape: 'vietnam', name_ru: 'Вьетнам', name_en: 'Vietnam' },
}

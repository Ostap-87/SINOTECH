import type { Locale } from '@/i18n/LanguageContext'
import type { BlogPost } from '@/types/data'

// Same "honest placeholder" approach as CompanyMark: no real cover art is on
// file yet, so a tagged gradient stands in until `cover` points at a real
// asset (i.e. no longer contains the storage `REPLACE` placeholder host).
const GRADIENTS = [
  'linear-gradient(160deg, #60a5fa, #1e3a8a)',
  'linear-gradient(160deg, #a5b4fc, #1e1b4b)',
  'linear-gradient(160deg, #38bdf8, #0e3b57)',
  'linear-gradient(160deg, #818cf8, #312e81)',
  'linear-gradient(160deg, #7dd3fc, #075985)',
]

function hasRealCover(cover: string): boolean {
  return cover.length > 0 && !cover.includes('REPLACE')
}

export function BlogCover({ post, index, className = '' }: { post: BlogPost; index: number; className?: string }) {
  if (hasRealCover(post.cover)) {
    return <img src={post.cover} alt="" className={`object-cover ${className}`} loading="lazy" />
  }

  return (
    <div
      className={`flex items-end p-4 ${className}`}
      style={{ background: GRADIENTS[index % GRADIENTS.length] }}
      aria-hidden="true"
    >
      <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.025em] text-white/90">
        {post.tags[0] ?? 'blog'}
      </span>
    </div>
  )
}

export function formatBlogDate(date: string, locale: Locale): string {
  const d = new Date(`${date}T00:00:00Z`)
  return d.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

import { Link } from 'react-router-dom'
import { useLanguage, pick } from '@/i18n/LanguageContext'
import { usePageMeta } from '@/hooks/usePageMeta'
import { blogPosts } from '@/data'
import { ShimmerText } from '@/components/ShimmerText'
import { BlogCover, formatBlogDate } from '@/components/BlogCover'

export function Blog() {
  const { locale } = useLanguage()

  usePageMeta(
    locale === 'ru' ? 'Блог — Global Tech Tour' : 'Blog — Global Tech Tour',
    locale === 'ru'
      ? 'Разбор бизнес-туров в Китай: подготовка делегаций, доступ на заводы, benchmark-визиты и работа с китайскими поставщиками.'
      : 'Notes on business trips to China: preparing delegations, plant access, benchmark visits, and working with Chinese suppliers.',
  )

  return (
    <section className="mx-auto w-full max-w-[1280px] px-6 py-16 lg:py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.025em]">
        <ShimmerText variant="saffron" text={locale === 'ru' ? 'Блог' : 'Blog'} />
      </p>
      <h1 className="mt-6 max-w-2xl text-[36px] font-normal leading-[1.1] tracking-[-0.03em] sm:text-[48px] lg:text-[56px]">
        {locale === 'ru' ? 'Заметки о поездках в Китай' : 'Notes on trips to China'}
      </h1>
      <p className="mt-4 max-w-xl text-lg font-normal text-silver-mist">
        {locale === 'ru'
          ? 'Как устроены benchmark-туры, доступ на заводы и подготовка делегаций — на реальных примерах.'
          : 'How benchmark tours, plant access and delegation planning actually work — with real examples.'}
      </p>

      {blogPosts.length === 0 ? (
        <p className="mt-16 text-silver-mist">
          {locale === 'ru' ? 'Скоро здесь появятся статьи.' : 'Articles are coming soon.'}
        </p>
      ) : (
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, i) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-surface/60 transition-colors hover:border-electric-iris/60"
            >
              <BlogCover post={post} index={i} className="aspect-[16/9] w-full" />
              <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-ash-gray">
                  <time dateTime={post.date}>{formatBlogDate(post.date, locale)}</time>
                  {post.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-full border border-black/10 px-2.5 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-lg font-medium leading-snug tracking-[-0.01em] text-bone-white transition-colors group-hover:text-electric-iris">
                  {pick(post, 'title', locale)}
                </h2>
                <p className="line-clamp-3 text-sm text-silver-mist">{pick(post, 'excerpt', locale)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

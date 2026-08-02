import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage, pick } from '@/i18n/LanguageContext'
import { usePageMeta } from '@/hooks/usePageMeta'
import { blogPosts, getBlogPost } from '@/data'
import { SITE_URL, SITE_NAME, OG_IMAGE_RU, OG_IMAGE_EN } from '@/lib/seoConfig'
import { ShimmerText } from '@/components/ShimmerText'
import { BlogCover, formatBlogDate } from '@/components/BlogCover'
import { Placeholder } from './Placeholder'

export function BlogArticle() {
  const { locale } = useLanguage()
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getBlogPost(slug) : undefined
  const postIndex = post ? blogPosts.findIndex((p) => p.id === post.id) : -1

  usePageMeta(
    post ? `${pick(post, 'title', locale)} — Global Tech Tour` : locale === 'ru' ? 'Статья — Global Tech Tour' : 'Article — Global Tech Tour',
    post ? pick(post, 'excerpt', locale) : undefined,
    { noindex: !post },
  )

  // schema.org/BlogPosting structured data.
  useEffect(() => {
    if (!post) return
    const image = post.cover.includes('REPLACE') ? (locale === 'ru' ? OG_IMAGE_RU : OG_IMAGE_EN) : post.cover
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: pick(post, 'title', locale),
      description: pick(post, 'excerpt', locale),
      image,
      datePublished: post.date,
      dateModified: post.date,
      author: { '@type': 'Organization', name: post.author },
      publisher: { '@type': 'Organization', name: SITE_NAME },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
      keywords: post.tags.join(', '),
    })
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [post, locale])

  if (!post) {
    return (
      <Placeholder
        title_ru="Статья не найдена"
        title_en="Article not found"
        note_ru="Вернитесь в блог и выберите статью ещё раз."
        note_en="Go back to the blog and pick an article again."
      />
    )
  }

  const related = blogPosts.filter((p) => p.id !== post.id).slice(0, 2)

  return (
    <article className="mx-auto w-full max-w-[820px] px-6 py-16 lg:py-20">
      <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-ash-gray hover:text-bone-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        {locale === 'ru' ? 'Все статьи' : 'All articles'}
      </Link>

      <p className="mt-8 text-sm font-semibold uppercase tracking-[0.025em]">
        <ShimmerText variant="saffron" text={locale === 'ru' ? 'Блог' : 'Blog'} />
      </p>
      <h1 className="mt-4 text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-bone-white sm:text-[42px]">
        {pick(post, 'title', locale)}
      </h1>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-ash-gray">
        <time dateTime={post.date}>{formatBlogDate(post.date, locale)}</time>
        <span aria-hidden="true">·</span>
        <span>{post.author}</span>
        {post.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-black/10 px-2.5 py-0.5 text-xs">
            {tag}
          </span>
        ))}
      </div>

      <BlogCover post={post} index={postIndex >= 0 ? postIndex : 0} className="mt-8 aspect-[16/9] w-full rounded-2xl" />

      <div className="mt-10 flex flex-col gap-5 text-base leading-relaxed text-silver-mist">
        {pick(post, 'body', locale)
          .split('\n\n')
          .map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
      </div>

      {related.length > 0 && (
        <div className="mt-16 border-t border-black/10 pt-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.025em] text-ash-gray">
            {locale === 'ru' ? 'Читайте также' : 'Read next'}
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {related.map((p) => (
              <Link
                key={p.id}
                to={`/blog/${p.slug}`}
                className="rounded-2xl border border-black/10 bg-surface/60 p-4 transition-colors hover:border-electric-iris/60"
              >
                <p className="text-sm font-medium text-bone-white">{pick(p, 'title', locale)}</p>
                <p className="mt-1 text-xs text-ash-gray">{formatBlogDate(p.date, locale)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

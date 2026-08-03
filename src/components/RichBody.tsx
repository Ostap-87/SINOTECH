import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

const LINK_PATTERN = /\[([^\]]+)\]\((\/[^)]+)\)/g

/** Renders inline `[text](/path)` links (internal-only) inside a paragraph. */
function renderInline(text: string, keyPrefix: string) {
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let i = 0
  LINK_PATTERN.lastIndex = 0
  while ((match = LINK_PATTERN.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    parts.push(
      <Link key={`${keyPrefix}-${i++}`} to={match[2]!} className="underline underline-offset-2 hover:text-electric-iris">
        {match[1]}
      </Link>,
    )
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

/** Renders a blog body: `## ` blocks become headings, others become paragraphs with inline internal links. */
export function RichBody({ body }: { body: string }) {
  return (
    <div className="mt-10 flex flex-col gap-5 text-base leading-relaxed text-silver-mist">
      {body.split('\n\n').map((paragraph, i) =>
        paragraph.startsWith('## ') ? (
          <h2
            key={i}
            className="mt-4 border-l-4 border-electric-iris pl-4 text-xl font-semibold text-bone-white first:mt-0"
          >
            {renderInline(paragraph.slice(3), `h-${i}`)}
          </h2>
        ) : (
          <p key={i}>{renderInline(paragraph, `p-${i}`)}</p>
        ),
      )}
    </div>
  )
}

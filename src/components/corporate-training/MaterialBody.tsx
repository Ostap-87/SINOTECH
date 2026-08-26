import type { MaterialBlock } from '@/data/materials'
import { StaticImage } from './StaticImage'

/**
 * Renders a material's body blocks. Deliberately a separate, small
 * component rather than reusing RichBody (the blog's body renderer) — see
 * Stage 4.5 of the spec: "Материалы и методология" is its own content
 * type, not to be coupled to /blog's component or navigation.
 */
export function MaterialBody({ blocks }: { blocks: MaterialBlock[] }) {
  return (
    <div className="mt-8 flex flex-col gap-5 text-base leading-relaxed text-silver-mist">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2 key={i} className="mt-4 border-l-4 border-electric-iris pl-4 text-xl font-semibold text-bone-white first:mt-0">
                {block.text}
              </h2>
            )
          case 'list':
            return (
              <ul key={i} className="list-disc space-y-1.5 pl-5">
                {(block.items ?? []).map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            )
          case 'image':
            return (
              <StaticImage
                key={i}
                src={block.src ?? ''}
                alt={block.text ?? ''}
                placeholderLabel="Изображение скоро появится"
                className="w-full rounded-2xl object-cover"
              />
            )
          case 'paragraph':
          default:
            return <p key={i}>{block.text}</p>
        }
      })}
    </div>
  )
}
